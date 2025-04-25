// models/Task.js
import mongoose from "mongoose";
const taskSchema = new mongoose.Schema({
  // models/Task.js
assignedTo: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
],

  title: { type: String, required: true },
  description: { type: String, default: '' },
  dateTime: { type: Date, required: true },  // تاريخ ووقت في حقل واحد
  remindMe: { type: Boolean, default: false }, // للـ reminder
  createdAt: { type: Date, default: Date.now },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  assignedTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  
});

const Task = mongoose.model('Task', taskSchema);
export default Task;
