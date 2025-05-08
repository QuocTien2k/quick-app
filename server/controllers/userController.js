const router = require("express").Router();
const cloudinary = require("../cloudinary");
const protect = require("../middlewares/authMiddleware");
const userModel = require("../models/user");

//get details of current logged-in user:
router.get("/get-logged-user", protect, async (req, res) => {
  try {
    // Tìm người dùng theo userId nhưng không lấy trường password
    const user = await userModel.findOne({ _id: req.user.id });

    if (!user) {
      return res.status(404).send({
        message: "Không tìm thấy người dùng",
        success: false,
      });
    }

    res.status(200).send({
      message: "Lấy thông tin user đăng nhập thành công",
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).send({
      message: "Lỗi : " + error.message,
      success: false,
    });
  }
});

//get all users excluding the currently logged-in user
router.get("/get-all-users", protect, async (req, res) => {
  try {
    // Lấy tất cả user, nhưng loại bỏ user đang đăng nhập
    const otherUsers = await userModel.find({ _id: { $ne: req.user.id } }); // $ne = not equal (không bằng)

    res.status(200).send({
      message: "Lấy danh sách người dùng (trừ bạn) thành công",
      success: true,
      data: otherUsers,
    });
  } catch (error) {
    res.status(500).send({
      message: "Lỗi: " + error.message,
      success: false,
    });
  }
});

//get list users from mongodb
router.get("/listUsers", async (req, res) => {
  try {
    // Lấy danh sách tất cả người dùng nhưng không lấy trường password
    const allUsers = await userModel.find({}).select("-password");

    if (!allUsers || allUsers.length === 0) {
      return res.status(404).send({
        message: "Không tìm thấy danh sách người dùng",
        success: false,
      });
    }

    res.status(200).send({
      message: "Lấy thông tin danh sách người dùng thành công",
      success: true,
      data: allUsers,
    });
  } catch (error) {
    res.status(500).send({
      message: "Lỗi : " + error.message,
      success: false,
    });
  }
});

//upload image
router.post("/upload-profile-pic", protect, async (req, res) => {
  try {
    const image = req.body.image;
    if (!image) {
      return res
        .status(400)
        .json({ success: false, message: "Không có ảnh nào được gửi lên." });
    }

    // Lấy user hiện tại từ DB
    const currentUser = await userModel.findById(req.user.id);

    // Nếu có avatar cũ → xóa ảnh khỏi Cloudinary
    if (currentUser.profilePic?.public_id) {
      await cloudinary.uploader.destroy(currentUser.profilePic.public_id);
    }

    // Upload ảnh mới
    const uploadedImage = await cloudinary.uploader.upload(image, {
      folder: "quick-chat",
    });

    // Cập nhật DB với avatar mới
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user.id,
      {
        profilePic: {
          url: uploadedImage.secure_url,
          public_id: uploadedImage.public_id,
        },
      },
      { new: true }
    );

    res.status(201).send({
      message: "Tải ảnh thành công",
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    res.status(400).send({
      message: "Tải ảnh thất bại! " + error.message,
      success: false,
    });
  }
});

module.exports = router;
