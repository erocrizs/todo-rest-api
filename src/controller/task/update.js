const _ = require("lodash");
const { validate, Joi } = require("express-validation");
const Task = require("@src/model/task");

async function handler(req, res) {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404).send({ error: "Not found" });
    return;
  }

  if (!_.isNil(req.body.title)) {
    task.title = req.body.title;
  }

  if (!_.isNil(req.body.description)) {
    task.description = req.body.description;
  }

  if (!_.isNil(req.body.isDone)) {
    task.isDone = Boolean(req.body.isDone);
  }

  await task.save();
  res.status(200).send(task.json());
}

const validator = validate({
  body: Joi.object({
    title: Joi.string(),
    description: Joi.string(),
    isDone: Joi.boolean(),
  })
    .required()
    .min(1),
});

module.exports = {
  handler,
  validator,
};
