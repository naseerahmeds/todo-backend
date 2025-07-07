const express = require("express");
const Task = require("../models/task");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();

// Middleware to check auth
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Get user tasks
router.get("/", authenticate, async (req, res) => {
  const tasks = await Task.find({ userId: req.user._id });
  res.json(tasks);
});

// Create a task
router.post("/", authenticate, async (req, res) => {
  const newTask = new Task({
    userId: req.user._id,
    title: req.body.title,
    status: "in progress",
    date: new Date(),
  });
  await newTask.save();
  res.json(newTask);
});

// Update task (title and/or status)
router.put("/:id", authenticate, async (req, res) => {
  const updates = {};
  if (req.body.title !== undefined) updates.title = req.body.title;
  if (req.body.status !== undefined) updates.status = req.body.status;

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    updates,
    { new: true }
  );
  res.json(task);
});

// Delete task
router.delete("/:id", authenticate, async (req, res) => {
  await Task.deleteOne({ _id: req.params.id, userId: req.user._id });
  res.json({ message: "Task deleted" });
});

module.exports = router;
