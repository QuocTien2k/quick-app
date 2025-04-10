const cloudinary = require("cloudinary");

// Configuration
cloudinary.config({
  cloud_name: "dyr07enpm",
  api_key: "726756645131951",
  api_secret: "9uigXKb80rJFWYN3CrEVPU3qV8E", // Click 'View API Keys' above to copy your API secret
});

module.exports = cloudinary;
