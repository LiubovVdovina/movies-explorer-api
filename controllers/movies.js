const Movie = require('../models/movie');

const ForbiddenError = require('../errors/forbidden-err');
const BadRequestError = require('../errors/bad-request-err');
const NotFoundError = require('../errors/not-found-err');

function getMovies(req, res, next) {
  Movie.find({})
    .then((movies) => res.status(200).send({ movies }))
    .catch(next);
}

// создаёт фильм с переданными в теле country, director, duration, year,
// description, image, trailer, nameRU, nameEN и thumbnail, movieId - для роута POST /movies
function createMovie(req, res, next) {
  const {
    country, director,
    duration, year,
    description, image,
    trailer, nameRU, nameEN,
    thumbnail, movieId,
  } = req.body;
  const owner = req.user._id;
  Movie.create(
    {
      country,
      director,
      duration,
      year,
      description,
      image,
      trailer,
      nameRU,
      nameEN,
      thumbnail,
      movieId,
      owner,
    },
  )
    .then((movie) => res.status(201).send({ movie }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const errorMessage = Object.values(err.errors).map((error) => error.message).join('. ');
        next(new BadRequestError(`Переданы некорректные данные при создании фильма. ${errorMessage}`));
      } else {
        next(err);
      }
    });
}

// # удаляет сохранённый фильм по id - для роута DELETE /movies/_id
function deleteMovie(req, res, next) {
  Movie.findById(req.params.movieId)
    .orFail(() => {
      throw new NotFoundError('Фильм с переданным ID не найден');
    })
    .then((movie) => {
      if (req.user._id !== movie.owner.toString()) {
        throw new ForbiddenError('Вы не можете удалять чужие фильмы');
      }
      Movie.findByIdAndRemove(req.params.movieId)
        .then((removedMovie) => res.status(200).send({ removedMovie }))
        .catch(next);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Некорректный ID фильма'));
      } else {
        next(err);
      }
    });
}

module.exports = {
  getMovies, createMovie, deleteMovie,
};
