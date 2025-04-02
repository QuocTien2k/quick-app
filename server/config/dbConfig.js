const mongoose = require("mongoose");

//connection db
mongoose.connect(process.env.MONGO_URL);

//check connection
const db = mongoose.connection;
db.on("connected", () => {
  console.log("MongoDB connected successfully!");
});
db.on("error", (error) => {
  console.log("MongoDB connection error:", error);
});

module.exports = db;
