const { validate, Joi } = require("express-validation");
const Task = require("@src/model/task");

async function handler(req, res) {
  const task = Task.create({
    title: req.body.title,
    description: req.body.description || "",
    isDone: Boolean(req.body.isDone),
  });
  await task.save();
  res.status(200).send(task.json());
}

const validator = validate({
  body: Joi.object({
    title: Joi.string().required(),
    description: Joi.string(),
    isDone: Joi.boolean(),
  })
    .required()
    .exist(),
});

module.exports = {
  handler,
  validator,
};
