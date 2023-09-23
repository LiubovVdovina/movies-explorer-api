const router = require('express').Router();
const {
  getMovies, createMovie, deleteMovie,
} = require('../controllers/movies');

const {
  createMovieValidation,
  movieIdValidation,
} = require('../middlewares/validators/movieValidator');

router.get('/movies', getMovies);
router.post('/movies', createMovieValidation, createMovie);
router.delete('/movies/:movieId', movieIdValidation, deleteMovie);

module.exports = router;
