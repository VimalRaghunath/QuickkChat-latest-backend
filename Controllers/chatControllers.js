const asyncHandler = require("express-async-handler");
const Chat = require("../Model/ChatSchema");
const User = require("../Model/UserSchema");

//--------------------------

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("userId param not sent with request");
    return res.sendStatus(400);
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { Users: { $elemMatch: { $eq: req.user._id } } },
      { Users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("Users", "-password")
    .populate("latestMessages");

  isChat = await User.populate(isChat, {
    path: "latestMessages.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      ChatName: "sender",
      isGroupChat: false,
      Users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);

      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "Users",
        "-password"
      );

      res.status(200).send(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

//----------------------------

const fetchChats = asyncHandler(async (req, res) => {
  try {
    Chat.find({ Users: { $elemMatch: { $eq: req.user._id } } })
      .populate("Users", "-password")
      .populate("GroupAdmin", "-password")
      .populate("latestMessages")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessages.sender",
          select: "name pic email",
        });

        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//-------------------------

const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.Users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the fields" });
  }
  var users = JSON.parse(req.body.Users);
  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      ChatName: req.body.name,
      Users: users,
      isGroupChat: true,
      GroupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("Users", "-password")
      .populate("GroupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//-----------------------------

const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, ChatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId, {
       ChatName,
    },
    {
       new: true,
    }
  ).populate("Users", "-password")
  .populate("GroupAdmin", "-password");

  if(!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
});


//---------------------------


 const addToGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    const added = await Chat.findByIdAndUpdate(
      chatId, {
        $push: { Users: userId },
      }, { new: true }

    ).populate("Users", "-password")
    .populate("GroupAdmin", "-password");

    if (!added) {
      res.status(404);
      throw new Error("Chat Not Found");
    } else {
      res.json(added);
    }
 });


 //--------------------------


 const removeFromGroup = asyncHandler( async (req, res) => {
  const { chatId, userId } = req.body;

  const removed = await Chat.findByIdAndUpdate(
    chatId, {
      $pull: { Users: userId },
    }, { new: true }

  ).populate("Users", "-password")
  .populate("GroupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
    
  } else {
    res.json(removed);
  }
 })

module.exports = { accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup };
