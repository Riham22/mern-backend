import dotenv from "dotenv";
dotenv.config(); // 👌 دي لازم تيجي فوق خالص قبل أي استخدام لـ process.env

import { User } from '../models/User.js';
import { createSecretToken } from '../utils/SecretToken.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import transporter from "../config/nodemailer.js";


const myLink ='https://clientmern.vercel.app/';


export const signUp = async (req, res, next) => {
  try {
    const { username, password, createdAt } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ username, password, createdAt });
    const token = createSecretToken(user._id);

    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: true,
    });

    res.status(201).json({ message: "Registered Successfully!", success: true, user ,token});
    // next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export const logIn = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: "Invalid username or password" });

    const auth = await bcrypt.compare(password, user.password);
    if (!auth) return res.status(401).json({ message: "Invalid username or password" });

    const token = createSecretToken(user._id);

    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: true,
    });

    res.status(200).json({ message: "Logged in successfully", success: true, user, token });
    // next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export const forgotPassword = async (req, res) => {
  try {
    const { username } = req.body;

    if (typeof username !== 'string') {
      return res.status(400).json({ message: 'Username should be a string' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!username.includes('@')) {
      return res.status(400).json({ message: "Username must be a valid email address for password reset" });
    }

    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.TOKEN_KEY,
      { expiresIn: '24h' }
    );

    const expireDate = new Date();
    expireDate.setHours(expireDate.getHours() + 24);

    user.resetToken = resetToken;
    user.resetTokenExpiry = expireDate;
    await user.save();

    const resetLink = `${myLink}/reset/${resetToken}`;

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


export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ message: 'Invalid password. Password must be at least 6 characters long.' });
    }

    const decoded = jwt.verify(token, process.env.TOKEN_KEY);

    const user = await User.findOne({
      _id: decoded.userId,
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found or reset token has expired" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

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

    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
  });

  res.status(200).json({ status: true, message: "Logged out successfully" });
};
