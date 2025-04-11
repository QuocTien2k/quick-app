const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userModel = require("../models/user");
const sendEmail = require("../utils/sendEmail");

//route signup
router.post("/signup", async (req, res) => {
  try {
    //1. If user already exists
    const user = await userModel.findOne({ email: req.body.email });

    //2. If user exists, send an error response
    if (user) {
      return res.send({
        message: "Email đã được sử dụng",
        success: false,
      });
    }

    //3. encrypt password (mã hóa 1 chiều => tránh giải mã, 10 là số lần mã hóa)
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    req.body.password = hashedPassword;

    //4. create a new user in the database
    const newUser = await userModel.create(req.body);
    await newUser.save();

    res.status(201).send({
      message: "Đăng ký thành công",
      success: true,
    });
  } catch (error) {
    res.status(400).send({
      message: `Đăng ký thất bại : ${error.message}`,
      success: false,
    });
  }
});

//route login
router.post("/login", async (req, res) => {
  //console.log("Request body:", req.body);
  try {
    //1.check user exists
    const user = await userModel
      .findOne({ email: req.body.email })
      .select("+password");
    //console.log("User data from database:", user);
    if (!user) {
      return res.status(401).send({
        message: "Email không tồn tại hoặc chưa đăng ký",
        success: false,
      });
    }

    //2. check password is correct
    const isValid = await bcrypt.compare(req.body.password, user.password);
    //console.log("Password comparison:", isValid);
    if (!isValid) {
      return res.status(401).send({
        message: "Mật khẩu không đúng",
        success: false,
      });
    }

    //3. login success + assign token
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "10d",
    });

    res.status(200).send({
      message: "Đăng nhập thành công",
      success: true,
      user: {
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
      },
      token: token,
    });
  } catch (error) {
    res.status(400).send({
      message: `Đăng nhập thất bại : ${error.message}`,
      success: false,
    });
  }
});

//route forgot password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Tìm user theo email
    const user = await userModel.findOne({ email });
    //console.log("Thông tin của user là: ", user);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email không tồn tại trong hệ thống",
      });
    }

    // 2. Tạo reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 3. Gán vào user và lưu lại
    user.resetPasswordToken = resetToken;
    await user.save();

    // 4. Tạo link reset
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

    // 5. Gửi email
    const htmlContent = `
      <h2>Yêu cầu đặt lại mật khẩu</h2>
      <p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấn vào link bên dưới để tiếp tục:</p>
      <a href="${resetLink}" target="_blank">${resetLink}</a>
      <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
    `;

    await sendEmail(user.email, "Đặt lại mật khẩu - QuickChat", htmlContent);

    res.status(200).send({
      success: true,
      message: "Đã gửi email đặt lại mật khẩu",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Lỗi server khi gửi mail: " + error.message,
    });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { token } = req.query;

    if (!token) {
      return res.status(400).send({
        success: false,
        message: "Thiếu token",
      });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).send({
        success: false,
        message: "Mật khẩu mới không hợp lệ (ít nhất 6 ký tự)",
      });
    }

    // Tìm user có token này
    const user = await userModel.findOne({ resetPasswordToken: token });
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "Token không hợp lệ hoặc đã hết hạn",
      });
    }

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Xóa token
    user.resetPasswordToken = undefined;

    // Lưu lại
    await user.save();

    res.status(200).send({
      success: true,
      message: "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập lại.",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Lỗi server: " + error.message,
    });
  }
});

module.exports = router;
