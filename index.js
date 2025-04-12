import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import authRouters from "./routes/Auth.js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

dotenv.config();
const { MONGO_URL, PORT, TOKEN_KEY } = process.env;

const app = express();
const httpServer = http.createServer(app);


const allowedOrigins = [
  // "https://mernfront-sable.vercel.app",
  "https://clientmern-22tgb5300-riham22s-projects.vercel.app",
  'http://localhost:5173',
  'https://clientmern.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200 
};



app.use(cors(corsOptions));


app.use(express.json());
app.use(cookieParser());


app.use("/", authRouters);


const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  transports: ["polling", "websocket"],
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
  console.log("✅ User connected:", socket.userId);

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected");
  });
});


mongoose.connect(MONGO_URL)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));


  httpServer.listen(PORT, () => {
  console.log(`🚀 Server is listening on Port ${PORT}`);
});

export default io;
