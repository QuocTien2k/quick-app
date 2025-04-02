const express = require("express");
const app = express();
const authController = require("./controllers/authController");
const userController = require("./controllers/userController");

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

//use auth, user controller
app.use("/api/auth", authController);
app.use("/api/user", userController);

module.exports = app;
