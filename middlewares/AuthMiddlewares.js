
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import  jwt from 'jsonwebtoken';
dotenv.config();
export const userVerification = async(req, res, next) => {
    const token =
    req.cookies.token ||
    (req.headers.authorization && req.headers.authorization.split(" ")[1]);

  if (!token) {
    console.log('❌ No token found');
    return res.status(401).json({ message: "No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    console.log('✅ Decoded Token:', decoded);

    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('❌ User not found for ID:', decoded.id);
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    console.log('✅ User verified and attached to req:', user.username);
    next(); // 👈 دي أهم حاجة
  } catch (error) {
    console.log('❌ Error in middleware:', error.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};
