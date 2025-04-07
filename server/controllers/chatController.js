const router = require("express").Router();
const protect = require("../middlewares/authMiddleware");
const Chat = require("../models/chat");
const message = require("../models/message");

//Create new chat
router.post("/create-new-chat", protect, async (req, res) => {
  try {
    const { members } = req.body;

    // Kiểm tra members có hợp lệ không
    if (!members || !Array.isArray(members) || members.length !== 2) {
      return res.status(400).send({
        message: "Cuộc trò chuyện tối đa 2 người!",
        success: false,
      });
    }

    // Kiểm tra xem 2 ID có trùng nhau không
    if (members[0] === members[1]) {
      return res.status(400).send({
        message: "Không thể tạo cuộc trò chuyện với chính mình!",
        success: false,
      });
    }

    // Kiểm tra xem cuộc trò chuyện đã tồn tại chưa
    const existingChat = await Chat.findOne({ members: { $all: members } });

    if (existingChat) {
      return res.status(200).send({
        message: "Cuộc trò chuyện đã tồn tại!",
        success: true,
        data: existingChat,
      });
    }

    //Tạo mới chat
    const chat = new Chat({ members });
    const savedChat = await chat.save();

    res.status(201).send({
      message: "Tạo chat thành công!",
      success: true,
      data: savedChat,
    });
  } catch (error) {
    res.status(500).send({
      message: "Tạo chat thất bại! " + error.message,
      success: false,
    });
  }
});

//Get list chat of user
router.get("/get-all-chats", protect, async (req, res) => {
  try {
    const userId = req.user.id; // Lấy userId từ middleware authMiddleware
    const allChats = await Chat.find({ members: userId })
      .populate("members", "firstname lastname email") // Lấy thông tin user
      .populate("lastMessage") // Lấy thông tin tin nhắn cuối cùng
      .sort({ updatedAt: -1 }); // Sắp xếp theo thời gian cập nhật gần nhất

    res.status(201).send({
      message: `Lấy danh sách chat của ${userId} thành công!`,
      success: true,
      data: allChats,
    });
  } catch (error) {
    res.status(400).send({
      message: "Lấy danh sách chat thất bại!" + error.message,
      success: false,
    });
  }
});

//
router.post("/clear-unread-message", protect, async (req, res) => {
  try {
    const chatId = req.body.chatId;

    //1. we want to update the unread message count in chat collection
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).send({
        message: "Không tìm thấy cuộc trò chuyện!",
        success: false,
      });
    }

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { unreadMessage: 0 },
      { new: true }
    )
      .populate("members")
      .populate("lastMessage");

    //2. we want to update the read property to true in message collection
    await message.updateMany({ chatId: chatId, read: false }, { read: true });

    res.status(200).send({
      message: "Đánh dấu tất cả tin nhắn là đã đọc thành công!",
      success: true,
      data: updatedChat,
    });
  } catch (error) {
    res.status(400).send({
      message: "Xóa tin nhắn chưa đọc thất bại!" + error.message,
      success: false,
    });
  }
});

module.exports = router;
