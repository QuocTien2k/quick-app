const router = require("express").Router();
const protect = require("../middlewares/authMiddleware");
const Chat = require("../models/chat");
const Message = require("../models/message");
const cloudinary = require("../cloudinary");

//create message
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
      message: "Tạo tin nhắn thành công!",
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

// send image message
router.post("/send-image-message", protect, async (req, res) => {
  try {
    const { chatId, image } = req.body;
    const sender = req.user.id; // đã có từ middleware

    if (!chatId || !image) {
      return res.status(400).json({
        success: false,
        message: "Thiếu chatId hoặc ảnh!",
      });
    }

    // 1. Upload ảnh lên Cloudinary
    const uploadedImage = await cloudinary.uploader.upload(image, {
      folder: "message-image",
    });

    // 2. Tạo message mới chứa link ảnh
    const newMessage = new Message({
      chatId,
      sender,
      image: uploadedImage.secure_url,
    });

    const savedMessage = await newMessage.save();

    // 3. Cập nhật lastMessage + unreadMessageCount trong Chat
    const currentChat = await Chat.findOneAndUpdate(
      { _id: chatId },
      {
        lastMessage: savedMessage._id,
        $inc: { unreadMessageCount: 1 },
      },
      { new: true }
    );

    res.status(201).json({
      message: "Gửi ảnh thành công!",
      success: true,
      data: currentChat,
    });
  } catch (error) {
    res.status(400).json({
      message: "Gửi ảnh thất bại! " + error.message,
      success: false,
    });
  }
});

//get message from collection (~~ table) chat
router.get("/get-all-messages/:chatId", protect, async (req, res) => {
  try {
    const { chatId } = req.params;

    // Kiểm tra chatId có hợp lệ không
    if (!chatId) {
      return res.status(400).send({
        message: "Thiếu chatId!",
        success: false,
      });
    }

    // Lấy tất cả tin nhắn của cuộc trò chuyện và sắp xếp theo thời gian
    const allMessages = await Message.find({ chatId })
      .sort({ createdAt: 1 })
      .populate("sender", "firstname lastname email"); // Lấy thông tin người gửi

    res.status(200).send({
      message: "Lấy tin nhắn thành công!",
      success: true,
      data: allMessages,
    });
  } catch (error) {
    res.status(500).send({
      message: "Lấy tin nhắn thất bại! " + error.message,
      success: false,
    });
  }
});
module.exports = router;
