const router = require("express").Router();
const protect = require("../middlewares/authMiddleware");
const userModel = require("../models/user");
//get details of current logged-in user:
router.get("/get-logged-user", protect, async (req, res) => {
  try {
    // Tìm người dùng theo userId nhưng không lấy trường password
    const user = await userModel
      .findOne({ _id: req.user.id })
      .select("-password");

    if (!user) {
      return res.status(404).send({
        message: "Không tìm thấy người dùng",
        success: false,
      });
    }

    res.status(200).send({
      message: "Lấy thông tin thành công",
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

module.exports = router;
