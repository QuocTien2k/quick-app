const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send({
        message: "Không có token",
        success: false,
      });
    }

    // Lấy token sau "Bearer "
    const token = authHeader.split(" ")[1];

    // Xác thực token
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY); // { userId: user._id }

    // Gán userId vào req.user thay vì req.body
    req.user = { id: decodedToken.userId };

    next(); // Tiếp tục xử lý request
  } catch (error) {
    res.status(401).send({
      message: "Lỗi token: " + error.message,
      success: false,
    });
  }
};

module.exports = protect;
