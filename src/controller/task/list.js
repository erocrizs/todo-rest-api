const _ = require("lodash");
const { validate, Joi } = require("express-validation");
const Task = require("@src/model/task");

async function handler(req, res) {
  const page = +req.query.page || 1;
  const count = +req.query.count || 5;

  if (!_.isNil(req.query.filter?.isDone)) {
    req.query.filter.isDone = req.query.filter.isDone === "true";
  }

  const tasks = await Task.list({
    filter: req.query.filter || {},
    page: page - 1,
    count,
  });

  res.status(200).send({
    data: tasks.map((t) => t.json()),
    page,
    count,
  });
}

const validator = validate({
  query: Joi.object({
    filter: Joi.object({
      title: Joi.string(),
      description: Joi.string(),
      isDone: Joi.boolean(),
    }),
    page: Joi.number().integer().greater(0),
    count: Joi.number().integer().greater(0),
    isDone: Joi.string().valid("true", "false"),
  }),
});

module.exports = {
  handler,
  validator,
};
