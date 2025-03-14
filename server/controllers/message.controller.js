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
    console.log(error);
  }
};

//4. delete msg and img from chat
export const deleteMessageAndImage = async (req, res) => {
  try {
    const { messageId, deleteText, deleteImage } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    if (message.sender.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "You can only delete your own messages" });
    }
    if (deleteText && message.text) {
      message.text = ""; // Clear text content
    }
    // Handle image deletion
    if (deleteImage && message.img) {
      try {
        // Extract Cloudinary public ID from URL
        const publicId = message.img.split("/").pop().split(".")[0];

        // Delete image from Cloudinary
        await cloudinary.v2.uploader.destroy(publicId);
        message.img = ""; // Clear image URL
      } catch (error) {
        console.error("Cloudinary image deletion error:", error);
        return res
          .status(500)
          .json({ error: "Failed to delete image from Cloudinary" });
      }
    }
    // If both text and image are empty, delete the entire message
    if (!message.text && !message.img) {
      await Message.findByIdAndDelete(messageId);
      return res.status(200).json({ message: "Message deleted successfully" });
    }
    await message.save();
    res.status(200).json(updatedMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};
