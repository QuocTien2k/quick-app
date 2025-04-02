const express = require("express");
const app = express();
const authController = require("./controllers/authController");

//use auth controller
app.use(express.json()); // Parse JSON bodies (as sent by API clients)
app.use("/api/auth", authController);

module.exports = app;
