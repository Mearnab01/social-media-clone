import Conversation from "../model/conversation.model.js";
import Message from "../model/message.model.js";
import { getRecipientSocketId, io } from "../socketio/socket.js";
import { v2 as cloudinary } from "cloudinary";
//1. sending message
export const sendMessage = async (req, res) => {
  try {
    const { recipientId, message } = req.body;
    let { img } = req.body;
    const senderId = req.user._id;

    if (recipientId === senderId) {
      return res.status(404).json({
        error: `${recipientId} and ${senderId} are same`,
      });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, recipientId],
        lastMessage: {
          text: message,
          sender: senderId,
        },
      });
      await conversation.save();
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }
    const newMessage = new Message({
      conversationId: conversation._id,
      sender: senderId,
      text: message,
      img: img || "",
    });

    await Promise.all([
      newMessage.save(),
      conversation.updateOne({
        lastMessage: {
          text: message,
          sender: senderId,
        },
      }),
    ]);
    const recipientSocketId = getRecipientSocketId(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("newMessage", newMessage);
    }
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error); // Logs error in terminal
    res.status(500).json({ error: error.message });
  }
};
//2. get messsage
export const getMessages = async (req, res) => {
  const { otherUserId } = req.params;
  const userId = req.user._id;
  //console.log("otherUserId:", otherUserId);
  //console.log("userId:", userId);

  try {
    const conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] },
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//3. get convos
export const getConversations = async (req, res) => {
  const userId = req.user._id;
  try {
    const conversations = await Conversation.find({
      participants: userId,
    }).populate({
      path: "participants",
      select: "username profilePic",
    });

    // remove the current user from the participants array
    conversations.forEach((conversation) => {
      conversation.participants = conversation.participants.filter(
        (participant) => participant._id.toString() !== userId.toString()
      );
    });
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteImgFromChat = async (req, res) => {
  try {
    const { messageId } = req.body; // Get message ID from request body
    const userId = req.user._id;
    if (message.sender.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "You can only delete your own messages" });
    }

    // Find the message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Check if the message contains an image
    if (!message.img) {
      return res.status(400).json({ error: "No image found in this message" });
    }

    // Extract Cloudinary public ID from URL
    const imgUrl = message.img;
    const publicId = imgUrl.split("/").pop().split(".")[0];

    // Delete the image from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Delete the message from MongoDB
    await Message.findByIdAndDelete(messageId);

    // Check if this was the last message in the conversation
    const conversation = await Conversation.findById(message.conversationId);
    if (conversation && conversation.lastMessage.img === imgUrl) {
      // Find the latest message in the conversation
      const lastMessage = await Message.findOne({
        conversationId: conversation._id,
      }).sort({ createdAt: 1 });

      // Update conversation's last message
      await Conversation.updateOne(
        { _id: conversation._id },
        {
          lastMessage: lastMessage
            ? { text: lastMessage.text, sender: lastMessage.sender }
            : null,
        }
      );
    }

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
