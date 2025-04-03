const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "chats",
      required: true, // Bắt buộc phải có chatId
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true, // Bắt buộc phải có người gửi
    },
    text: {
      type: String,
      required: [true, "Tin nhắn không được để trống"], // Thêm thông báo lỗi
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // Tự động tạo createdAt & updatedAt
);

module.exports = mongoose.model("messages", messageSchema);
