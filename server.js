const express = require("express");
const app = express();
const chats = require("./data/data");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const colors = require("colors");
const userRoutes = require("./Routes/userRoutes")
const chatRoutes = require("./Routes/chatRoutes")
const messageRoutes = require("./Routes/messageRoutes")
const { notFound, errorHandler } = require("./Middlewares/errorHandlingMiddlewares")
const cors = require('cors')

dotenv.config();

connectDB();
app.use(cors())
app.use(express.json()); //to acccept JSON data from frontend


app.get("/", (req, res) => {
  res.send("Api is running");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.use(notFound);
app.use(errorHandler);


const PORT = process.env.PORT || 7000;

const server = app.listen(7000, console.log(`Server Running on PORT ${PORT}`.yellow.bold));

const io = require("socket.io")(server, {
  pingTimeout: 60000,
   cors: {
    origin: "https://quickkchatnew-frontend.vercel.app", // this is socket.io connection from server
   },
});


io.on("connection",(socket) => {
  console.log("connected to socket.io");


  socket.on("setup", (userData) => {
     socket.join(userData._id)
     console.log(userData._id);
     socket.emit("connected")
  });


  socket.on("join chat",(room) => {
     socket.join(room);
     console.log("User Joined Room:" + room);
  });


  socket.on("typing",(room) => socket.in(room).emit("typing"))
  socket.on("stop typing",(room) => socket.in(room).emit("stop typing"))


  socket.on("new message",(newMessageReceived) => {
     var chat = newMessageReceived.chat;

     if(!chat.Users) return console.log("chat.Users not defined");

     chat.Users.forEach(user => {
      if(user._id == newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message received", newMessageReceived)
     })
  });


  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});