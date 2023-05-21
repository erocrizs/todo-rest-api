const Task = require("@src/model/task");

async function handler(req, res) {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404).send({ error: "Not found" });
    return;
  }

  res.status(200).send(task.json());
}

module.exports = {
  handler,
};
