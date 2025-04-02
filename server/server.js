const dotenv = require("dotenv");
dotenv.config("./.env");
const app = require("./app");

const dbConfig = require("./config/dbConfig");
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
