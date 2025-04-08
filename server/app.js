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

const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

//use auth, user, chat, message controller
app.use("/api/auth", authController);
app.use("/api/user", userController);
app.use("/api/chat", chatController);
app.use("/api/message", messageController);

//TEST socket connection from client
io.on("connection", (socket) => {
  //console.log("Connected with socket id: ", socket.id);
  socket.on("join-room", (userId) => {
    console.log("User join room: " + userId);
  });
});
module.exports = server;
