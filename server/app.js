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

const onlineUsers = [];
//TEST socket connection from client
io.on("connection", (socket) => {
  //console.log("Connected with socket id: ", socket.id);

  //lắng nghe client khi user đăng nhập từ browser, tham gia chat
  socket.on("join-room", (userId) => {
    console.log("User join room: " + userId);
    socket.join(userId);
  });

  //lắng nghe gửi tin từ client và gửi lại tin để client nhận
  socket.on("send-message", (message) => {
    //console.log("message nhận được: ", message);
    io.to(message.members[0]) //người gửi
      .to(message.members[1]) //người nhận
      .emit("receive-message", message);
  });

  //lắng nghe gửi tin chưa đọc từ client và gửi lại tin khi đã đọc
  socket.on("clear-unread-messages", (data) => {
    //console.log(data);
    io.to(data.members[0])
      .to(data.members[1])
      .emit("message-count-cleared", data);
  });

  //lắng nghe client có user online, gửi lên cho client array user online
  socket.on("user-login", (userId) => {
    if (!onlineUsers.includes(userId)) {
      onlineUsers.push(userId);
    }
    console.log("Danh sách user online: ", onlineUsers);
    socket.emit("online-users", onlineUsers);
  });

  //lắng nghe khi user loggout
  socket.on("user-offline", (userId) => {
    //onlineUsers = onlineUsers.filter((user) => user._id !== userId); dùng khi mảng chứa object phức tạp
    onlineUsers.splice(onlineUsers.indexOf(userId), 1);
    console.log("Danh sách user online: ", onlineUsers);

    io.emit("online-users-updated", onlineUsers);
  });
});
module.exports = server;
