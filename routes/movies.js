const router = require('express').Router();
const {
  getYourMovies, createMovie, deleteMovie,
} = require('../controllers/movies');

const {
  createMovieValidation,
  movieIdValidation,
} = require('../middlewares/validators/movieValidator');

router.get('/movies', getYourMovies);
router.post('/movies', createMovieValidation, createMovie);
router.delete('/movies/:movieId', movieIdValidation, deleteMovie);

module.exports = router;
