import mongoose, { Model } from "mongoose";
import bcrypt from "bcryptjs";
const UserSchema= new mongoose.Schema({
username:{
    type:String,
    required: [true,'Username is Required']
},
password:{
type:String,
required:[true,'Password is Required']
},
createdAt:{
    type:Date,
    default:Date.now
},
resetToken: {
    type: String,
  },
  resetTokenExpiry: {
    type: Date,
  }
  
});
UserSchema.pre("save",async function(next) {
    this.password=await bcrypt.hash(this.password,12);
    next();
});
export const User=mongoose.model("User",UserSchema);