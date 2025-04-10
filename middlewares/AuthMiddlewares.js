
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import  jwt from 'jsonwebtoken';
dotenv.config();
export const userVerification = (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        console.log('No token found');
        return res.json({ status: false });
    }

    jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
        if (err) {
            console.log('Token verification failed', err);
            return res.json({ status: false });
        }
    
        console.log('✅ Decoded Token:', data); // اطبع الـ ID وغيره
    
        try {
            const user = await User.findById(data.id);
            if (user) {
                console.log('User found:', user.username);
                return res.json({ status: true, user: { username: user.username, id: user._id } });
            } else {
                console.log('❌ User not found for ID:', data._id);
                return res.json({ status: false });
            }
        } catch (error) {
            console.log('Error finding user:', error);
            return res.json({ status: false });
        }
    });
};
