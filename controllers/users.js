const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const BadRequestError = require('../errors/bad-request-err');
const NotFoundError = require('../errors/not-found-err');
const ConflictError = require('../errors/conflict-err');

function createUser(req, res, next) {
  const {
    name, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      email,
      password: hash,
    }))
    .then((user) => res.status(201).send({
      name: user.name,
      email: user.email,
      _id: user._id,
    }))
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictError('Пользователь с указанным email уже существует'));
      } else if (err.name === 'ValidationError') {
        const errorMessage = Object.values(err.errors).map((error) => error.message).join('. ');
        next(new BadRequestError(`Переданы некорректные данные при создании пользователя. ${errorMessage}`));
      } else {
        next(err);
      }
    });
}

// обновляет информацию о пользователе (email и имя) - для роута PATCH /users/me
function updateUser(req, res, next) {
  const { name, email } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true })
    .orFail(() => {
      throw new NotFoundError('Пользователь с переданным ID не найден');
    })
    .then((user) => res.send({ user }))
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictError('Пользователь с указанным email уже существует'));
      } else if (err.name === 'CastError') {
        next(new BadRequestError('Некорректный ID пользователя'));
      } else if (err.name === 'ValidationError') {
        const errorMessage = Object.values(err.errors).map((error) => error.message).join('. ');
        next(new BadRequestError(`Переданы некорректные данные при обновлении пользователя. ${errorMessage}`));
      } else {
        next(err);
      }
    });
}

// login с сохранением токена в куки
function login(req, res, next) {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      // аутентификация успешна! пользователь в переменной user
      const { NODE_ENV, JWT_SECRET } = process.env;
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );
      // отправим токен, браузер сохранит его в куках
      res
        .cookie('jwt', token, {
        // token - наш JWT токен, который мы отправляем
          maxAge: '604800',
          httpOnly: true,
        })
        .status(200)
        .send({ message: 'Авторизация прошла успешно' });
    })
    .catch(next);
}

// выход из аккаунта
const logout = (req, res) => {
  res.clearCookie('jwt').send({ message: 'Осуществлен выход из системы' });
};

// возвращает информацию о текущем пользователе (email и имя) - для роута GET /users/me
function getCurrentUser(req, res, next) {
  User.findById(req.user._id)
    .then((user) => res.send({ user }))
    .catch(next);
}

module.exports = {
  createUser, updateUser, login, logout, getCurrentUser,
};
