const router = require("express").Router();
const protect = require("../middlewares/authMiddleware");
const Chat = require("../models/chat");
const Message = require("../models/message");

router.post("/new-message", protect, async (req, res) => {
  try {
    const { chatId, sender, text } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!chatId || !sender || !text) {
      return res.status(400).send({
        message: "Thiếu thông tin bắt buộc!",
        success: false,
      });
    }

    // 1. Lưu tin nhắn vào collection messages
    const newMessage = new Message({ chatId, sender, text });
    const savedMessage = await newMessage.save();

    // 2. Cập nhật tin nhắn cuối cùng & tăng số tin chưa đọc
    const currentChat = await Chat.findOneAndUpdate(
      { _id: chatId }, // Sửa `id` thành `_id`
      {
        lastMessage: savedMessage._id,
        $inc: { unreadMessageCount: 1 }, // Tăng số tin nhắn chưa đọc
      },
      { new: true } // Trả về dữ liệu đã cập nhật
    );

    res.status(201).send({
      message: "Tin nhắn gửi thành công!",
      success: true,
      data: currentChat,
    });
  } catch (error) {
    res.status(400).send({
      message: "Tạo tin nhắn thất bại!" + error.message,
      success: false,
    });
  }
});

module.exports = router;
