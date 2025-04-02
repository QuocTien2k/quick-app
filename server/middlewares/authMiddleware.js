const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).send({
        message: "Không có token",
        success: false,
      });
    }

    //verify token: kiểm tra token có hợp lệ không
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY); //{userId: user._id}
    req.body.userId = decodedToken.userId; //gán userId vào req.body để sử dụng trong các route khác

    next(); //tiếp tục xử lý request
  } catch (error) {
    res.status(401).send({
      message: "Lỗi token: " + error.message,
      success: false,
    });
  }
};
