const dotenv = require("dotenv");
dotenv.config("./.env");
const server = require("./app");

const dbConfig = require("./config/dbConfig");
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
