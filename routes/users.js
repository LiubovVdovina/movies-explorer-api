const router = require('express').Router();
const {
  updateUser, getCurrentUser,
} = require('../controllers/users');

const { updateUserValidation } = require('../middlewares/validators/userValidator');

router.get('/users/me', getCurrentUser);
router.patch('/users/me', updateUserValidation, updateUser);

module.exports = router;
