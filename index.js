import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from 'http';
import { Server } from "socket.io";
import authRouters from "./routes/Auth.js";
import cookieParser from "cookie-parser";
import  jwt  from 'jsonwebtoken';

dotenv.config();
const { MONGO_URL, PORT ,TOKEN_KEY} = process.env;

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ["https://mernfront-267uc4yje-riham22s-projects.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});


io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    console.log("❌ No token provided");
    return next(new Error("Authentication error"));
  }

  try {
    const decoded = jwt.verify(token, TOKEN_KEY);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    console.log("❌ Invalid token");
    return next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    console.log("❌ No token provided");
    return socket.disconnect(); 
  }

  try {
    const decoded = jwt.verify(token, TOKEN_KEY);
    console.log("✅ User connected:", decoded.id);
  } catch (err) {
    console.log("❌ Invalid token");
    return socket.disconnect();
  }

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });
});




mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));


httpServer.listen(PORT, () => {
  console.log(`Server is listening on Port ${PORT}`);
});

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ["https://mernfront-267uc4yje-riham22s-projects.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use("/", authRouters);

export { io }; 