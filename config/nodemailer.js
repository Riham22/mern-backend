import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();
console.log({
    user: process.env.MYEMAIL,
    pass: process.env.MYPASSWORD ? '✅ EXISTS' : '❌ MISSING',
  });
  
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    secure:true,
    auth: {
        user: process.env.MYEMAIL,
        pass: process.env.MYPASSWORD, // تأكد من استخدام Password صحيح أو App Password
    },
});

export default transporter;
