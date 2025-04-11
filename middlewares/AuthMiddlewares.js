
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import  jwt from 'jsonwebtoken';
dotenv.config();
export const userVerification = (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        console.log('❌ No token found');
        return res.status(401).json({ status: false, message: "No token" });
    }

    jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
        if (err) {
            console.log('❌ Token verification failed:', err);
            return res.status(401).json({ status: false, message: "Invalid token" });
        }

        console.log('✅ Decoded Token:', data);

        try {
            const user = await User.findById(data.id); // أو data.userId لو ده اللي بتستخدمه
            if (user) {
                console.log('✅ User found:', user.username);
                return res.status(200).json({
                    status: true,
                    user: { username: user.username, id: user._id },
                });
            } else {
                console.log('❌ User not found for ID:', data.id);
                return res.status(401).json({ status: false, message: "User not found" });
            }
        } catch (error) {
            console.log('❌ Error finding user:', error);
            return res.status(500).json({ status: false, message: "Server error" });
        }
    });
};
