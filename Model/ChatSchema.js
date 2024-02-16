const mongoose = require("mongoose");

const ChatSchema = mongoose.Schema({
  ChatName: { type: String, trim: true },
  isGroupChat: { type: Boolean, default: false },
  Users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  latestMessages: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  GroupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });


const Chat = mongoose.model("Chat", ChatSchema);
module.exports = Chat;