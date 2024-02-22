const express = require("express");
const app = express();
const chats = require("./data/data");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const colors = require("colors");

dotenv.config();

connectDB();

app.get("/", (req, res) => {
  res.send("Api is running");
});

app.get("/api/chat", (req, res) => {
  res.send(chats);
});

const PORT = process.env.PORT || 7000;

app.listen(7000, console.log(`Server Running on PORT ${PORT}`.yellow.bold));
