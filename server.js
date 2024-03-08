const express = require("express");
const app = express();
const chats = require("./data/data");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const colors = require("colors");
const userRoutes = require("./Routes/userRoutes")
const chatRoutes = require("./Routes/chatRoutes")
const { notFound, errorHandler } = require("./Middlewares/errorHandlingMiddlewares")
const cors = require('cors');


dotenv.config();

connectDB();

app.use(express.json()); //to acccept JSON data from frontend
app.use(cors());

app.get("/", (req, res) => {
  res.send("Api is running");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);

app.use(notFound);
app.use(errorHandler);


const PORT = process.env.PORT || 7000;

app.listen(7000, console.log(`Server Running on PORT ${PORT}`.yellow.bold));
