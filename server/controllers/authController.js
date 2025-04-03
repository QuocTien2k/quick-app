const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user");

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
      return res.status(400).send({
        message: "Email không tồn tại hoặc chưa đăng ký",
        success: false,
      });
    }

    //2. check password is correct
    const isValid = await bcrypt.compare(req.body.password, user.password);
    //console.log("Password comparison:", isValid);
    if (!isValid) {
      return res.status(400).send({
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

module.exports = router;
