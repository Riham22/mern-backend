// models/Task.js
import mongoose from "mongoose";
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  dateTime: { type: Date, required: true },  // تاريخ ووقت في حقل واحد
  remindMe: { type: Boolean, default: false }, // للـ reminder
  createdAt: { type: Date, default: Date.now },
});

const Task = mongoose.model('Task', taskSchema);
export default Task;
