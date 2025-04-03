const express = require("express");
const app = express();
const authController = require("./controllers/authController");
const userController = require("./controllers/userController");
const chatController = require("./controllers/chatController");
const messageController = require("./controllers/messageController");
const cors = require("cors");

// Cho phép CORS với frontend (React)
app.use(
  cors({
    origin: "http://localhost:5173", // Chỉ cho phép React frontend
    credentials: true, // Nếu có gửi cookies hoặc token
  })
);
app.use(cors());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

//use auth, user, chat, message controller
app.use("/api/auth", authController);
app.use("/api/user", userController);
app.use("/api/chat", chatController);
app.use("/api/message", messageController);

module.exports = app;
