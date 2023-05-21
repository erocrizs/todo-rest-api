const { validate, Joi } = require("express-validation");

module.exports = validate({
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }).required(),
});
