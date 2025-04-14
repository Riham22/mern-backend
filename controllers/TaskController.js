import Task from "../models/Task.js";
import io from '../index.js';
import { scheduleJob } from "node-schedule";

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user._id }).sort({ dateTime: 1 }); ;
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks", error });
  }
};


export const addTask = async (req, res) => {
  try {
    const { title, description, dateTime, remindMe } = req.body;

    const newTask = new Task({
      title,
      description,
      dateTime,
      remindMe,
      createdBy: req.user._id,
    });
    console.log("➡️ Received addTask request", req.body);

    await newTask.save();
    console.log("✅ Task saved:", newTask);

    if (remindMe) {
      const reminderTime = new Date(newTask.dateTime);
      reminderTime.setMinutes(reminderTime.getMinutes() - 5); 

      if (reminderTime > new Date()) {
        scheduleJob(reminderTime, () => {
          io.emit("taskReminder", {
            id: newTask._id,
            title: newTask.title,
            description: newTask.description,
            time: newTask.dateTime,
          });
        });
      }
    }
    res.status(201).json({ task: newTask }); 


  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add task", error });
  }
};



export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dateTime, remindMe } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      { _id: id, createdBy: req.user._id },
      { title, description, dateTime, remindMe },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task updated successfully', task: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: 'Failed to update task', error });
  }
};


export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTask = await Task.findByIdAndDelete({ _id: id, createdBy: req.user._id });

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted successfully", id });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete task", error });
  }
};
