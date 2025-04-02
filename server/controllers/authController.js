const router = require("express").Router();
const bcrypt = require("bcryptjs");
const userModel = require("../models/user");
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

module.exports = router;
