import dotenv from "dotenv";

dotenv.config();

import { User } from '../models/User.js';
import { createSecretToken } from '../utils/SecretToken.js';
import jwt from 'jsonwebtoken';
import bcrypt  from 'bcryptjs';
import nodemailer from 'nodemailer';
import transporter from "../config/nodemailer.js";

export const signUp= async (req,res,next)=> {
    
    try{
        const  {username,password,createdAt}=req.body;
        const existingUser =await User.findOne({username});

        if(existingUser) return res.json( { message: "User already exists"} );

        const user= await User.create({username,password,createdAt});
        const token=createSecretToken(user._id);

        res.cookie("token",token,{
            withCredentials: true,
            httpOnly:true,
        });

        res.status(201).json({message:"Registered Successfully!",success: true, user});

        next();
    }
    catch(err){
        console.log(err); 
    }
    
};

export const logIn= async (req,res,next)=> {
    
    try{
        const  {username,password}=req.body;

        if(!username|| !password) return res.json({ message: "All Fields Are Required!"} );

        const user= await User.findOne({username});

        if(!user) return res.json({message:'Check Your Usename and Password, Something is Incorrect'});

        const auth=await bcrypt.compare(password,user.password);

        if(!auth) return res.json({message:'Check Your Usename and Password, Something is Incorrect'});

        const token= createSecretToken(user._id);

        res.cookie("token",token,{
            withCredentials:true,
            httpOnly:true
        });



        res.status(201).json({message:"Logged In Successfully!",success: true, user, token});

        next();
    }
    catch(err){
        console.log(err); 
    }
    
};

export const forgotPassword = async (req, res) => {
    try {
      const { username } = req.body;
      console.log("Received username:", username);
  
      if (typeof username !== 'string') {
        return res.status(400).json({ message: 'Username should be a string' });
      }
  
      const user = await User.findOne({ username });
      console.log("User found:", user);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      if (!username.includes('@')) {
        return res.status(400).json({ message: "Username must be a valid email address for password reset" });
      }
  
      // إنشاء رمز JWT صالح لمدة 24 ساعة
      const resetToken = jwt.sign(
        { userId: user._id },
        process.env.TOKEN_KEY,
        { expiresIn: '24h' } // زيادة مدة الصلاحية إلى 24 ساعة
      );
  
      // حساب وقت انتهاء الصلاحية يدويًا (بعد 24 ساعة من الآن)
      const expireDate = new Date();
      expireDate.setHours(expireDate.getHours() + 24);
      
      // تخزين رمز التعيين وتاريخ انتهاء صلاحيته في وثيقة المستخدم
      user.resetToken = resetToken;
      user.resetTokenExpiry = expireDate;
      
      // حفظ التغييرات
      await user.save();
      
      const resetLink = `http://localhost:5173/reset/${resetToken}`;
      console.log("Reset Link:", resetLink);
      console.log("Token expiry date:", expireDate); // طباعة تاريخ انتهاء الصلاحية للتحقق
  
      const mailOptions = {
        from: process.env.MYEMAIL,
        to: username,
        subject: 'Password Reset Link',
        text: `Click the following link to reset your password: ${resetLink}\nThis link will expire on ${expireDate.toLocaleString()}.`,
      };
  
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Password reset link sent' });
    } catch (error) {
      console.error("Error in forgotPassword:", error.message);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  // تعديل دالة resetPassword للتحقق من انتهاء صلاحية الرمز من قاعدة البيانات
  export const resetPassword = async (req, res) => {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;
  
      if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
        return res.status(400).json({ message: 'Invalid password. Password must be at least 6 characters long.' });
      }
  
      try {
        // فك تشفير الرمز للحصول على معرف المستخدم
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        
        // البحث عن المستخدم بالمعرف والتحقق من صلاحية الرمز
        const user = await User.findOne({
          _id: decoded.userId,
          resetToken: token,
          resetTokenExpiry: { $gt: new Date() } // التحقق من أن تاريخ انتهاء الصلاحية أكبر من الوقت الحالي
        });
        
        if (!user) {
          return res.status(404).json({ message: "User not found or reset token has expired" });
        }
        
        // تشفير كلمة المرور الجديدة
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        // تحديث كلمة المرور وإزالة بيانات إعادة التعيين
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        
        await user.save();
        res.status(200).json({ message: "Password updated successfully" });
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Password reset link has expired' });
        } else if (error.name === 'JsonWebTokenError') {
          return res.status(401).json({ message: 'Invalid reset link' });
        }
        throw error;
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };

export const logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,  
        // secure: process.env.NODE_ENV === "production", 
        sameSite: "strict", 
        
    });

    res.status(200).json({ status: true, message: "Logged out successfully" });
};

