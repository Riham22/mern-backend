// models/Task.js
import mongoose from "mongoose";
const taskSchema = new mongoose.Schema({
 
  title: { type: String, required: true },
  description: { type: String, default: '' },
  dateTime: { type: Date, required: true }, 
  remindMe: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,  
  }],
  
  
});

const Task = mongoose.model('Task', taskSchema);
export default Task;
