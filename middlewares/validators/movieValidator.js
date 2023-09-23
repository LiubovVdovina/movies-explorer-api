const { Joi, celebrate } = require('celebrate');

const URL_REGEX = /^((ftp|http|https):\/\/)?(www\.)?([A-Za-zА-Яа-я0-9]{1}[A-Za-zА-Яа-я0-9-]*\.?)*\.{1}[A-Za-zА-Яа-я0-9-]{2,8}(\/([\w#!:.?+=&%@!\-/])*)?/im;
const RU_REGEX = /^[а-яА-ЯёЁ]/im;
const ENG_REGEX = /^[a-zA-Z]/im;

const createMovieValidation = celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    description: Joi.string().required(),
    image: Joi.string().required().regex(URL_REGEX),
    trailerLink: Joi.string().required().regex(URL_REGEX),
    thumbnail: Joi.string().required().regex(URL_REGEX),
    nameRU: Joi.string().required().regex(RU_REGEX),
    nameEN: Joi.string().required().regex(ENG_REGEX),
  }),
});

const movieIdValidation = celebrate({
  params: Joi.object().keys({
    cardId: Joi.number().required(),
  }),
});

module.exports = { createMovieValidation, movieIdValidation };
