const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    profilePic: {
      url: {
        type: String,
        required: false,
      },
      public_id: {
        type: String,
        required: false,
      },
    },
    resetPasswordToken: {
      type: String,
      default: null,
      select: false, // không cần trả về khi query user
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("users", userSchema);
