require("dotenv").config();
const express = require("express");
const app = express();

// SETTINGS
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(require("cors")());

app.use("/users", require("./src/main/users/user.routes"));

// set port, listen for requests
app.listen(process.env.NODE_DB_PORT, () => {
  console.log(`Server is running on port: ${process.env.NODE_DB_PORT}`);
});
