const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    members: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
      validate: {
        validator: function (v) {
          return v.length === 2; // Chỉ cho phép 2 thành viên
        },
        message: "Cuộc trò chuyện chỉ được có 2 thành viên!",
      },
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "messages",
    },
    unreadMessageCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("chats", chatSchema);
