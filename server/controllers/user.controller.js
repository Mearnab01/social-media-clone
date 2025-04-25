import User from "../model/user.model.js";
import Post from "../model/post.model.js";
import { getRecipientSocketId, io } from "../socketio/socket.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/generateTokenAndSetCookie.js";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { createNotification } from "./notification.controller.js";
import Notification from "../model/notification.model.js";
import Message from "../model/message.model.js";
import Conversation from "../model/conversation.model.js";
// user signup
export const userSignup = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
    });
    await newUser.save();

    if (!newUser) {
      return res.status(400).json({ error: "Failed to create user" });
    }

    generateTokenAndSetCookie(newUser._id, res);
    res.status(201).json({
      message: "User created successfully",
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      username: newUser.username,
    });
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
    console.error("Error in user signup", error);
  }
};

// user login
export const userLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "Invalid username or password" });
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );
    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid username or password" });
    }
    generateTokenAndSetCookie(user._id, res);
    res.status(200).json({
      message: `Welcome back ${user.username}`,
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      bio: user.bio,
      profilePic: user.profilePic,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in loginUser: ", error.message);
  }
};

// user logout
export const logoutUser = (_, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 1 });
    res.status(200).json({ message: "User logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in logoutUser: ", err.message);
  }
};

// follow unfollow user
export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = await User.findById(req.user._id);
    const userToFollow = await User.findById(id);
    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ error: "You can't follow/unfollow yourself" });
    }
    if (!currentUser || !userToFollow) {
      return res.status(404).json({ error: "User not found" });
    }
    const isFollowing = currentUser.following.includes(id);
    if (isFollowing) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      res
        .status(200)
        .json({ message: `You Unfollowed ${userToFollow.username}` });
    } else {
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      res.status(200).json({
        message: `You are now following ${userToFollow.username}`,
      });
      const follw_noti = await createNotification(
        "follow",
        currentUser,
        id,
        `${currentUser.username} started following you`
      );

      const recipientSocketId = getRecipientSocketId(id);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("newNotification", follw_noti);
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in followUnfollowUser: ", error.message);
  }
};

// update user
export const updateUser = async (req, res) => {
  const { name, email, username, bio, password } = req.body;
  let { profilePic } = req.body;
  const userId = req.user._id;
  try {
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (req.params.id !== userId.toString()) {
      return res
        .status(401)
        .json({ error: "You can only update your account" });
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }
    if (profilePic) {
      if (user.profilePic) {
        await cloudinary.uploader.destroy(
          user.profilePic.split("/").pop().split(".")[0]
        );
      }
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      profilePic = uploadResponse.secure_url;
    }
    user.name = name || user.name;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.profilePic = profilePic || user.profilePic;
    user = await user.save();
    // Find all posts that this user replied and update username and userProfilePic fields
    await Post.updateMany(
      { "replies.userId": userId },
      {
        $set: {
          "replies.$[reply].username": user.username,
          "replies.$[reply].userProfilePic": user.profilePic,
        },
      },
      { arrayFilters: [{ "reply.userId": userId }] }
    );

    // password should be null in response
    user.password = null;

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in updateUser: ", error.message);
  }
};

// get user
export const getUser = async (req, res) => {
  const { query } = req.params;
  try {
    let user;

    // query is userId
    if (mongoose.Types.ObjectId.isValid(query)) {
      user = await User.findOne({ _id: query })
        .select("-password -updatedAt")
        .populate("posts")
        .populate("followers")
        .populate("following");
    } else {
      // query is username
      user = await User.findOne({ username: query })
        .select("-password -updatedAt")
        .populate("posts")
        .populate("followers")
        .populate("following");
    }
    if (!user) return res.status(404).json({ error: "User not found" });
    const postCount = user.posts.length;
    //console.log(user._doc);

    res.status(200).json({ ...user._doc, postCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in getUserProfile: ", err.message);
  }
};

//get suggested user
export const getSuggestedUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const followedUserByMe = await User.findById(userId).select("following");

    const users = await User.aggregate([
      { $match: { _id: { $ne: userId } } }, // exclude current users
      { $sample: { size: 10 } }, // pick random 10 users, including the users i followed already
    ]);
    const filterUsers = users.filter(
      (user) => !followedUserByMe.following.includes(user._id) // filter users that followed already
    );

    const suggestedUsers = filterUsers
      .sort(() => Math.random() - 0.5)
      .slice(0, 4); // get 4 suggested users
    suggestedUsers.forEach((user) => (user.password = null));
    res.status(200).json(suggestedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in getSuggestedUser: ", error.message);
  }
};

// get all followers of a user by username
export const getFollowers = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ error: "User not found" });

    const followersData = await User.find(
      { _id: { $in: user.followers } },
      "username profilePic bio posts followers following"
    ).lean();

    const followers = followersData.map((f) => ({
      _id: f._id,
      username: f.username,
      profilePic: f.profilePic,
      bio: f.bio,
      postCount: f.posts?.length || 0,
      followerCount: f.followers?.length || 0,
      followingCount: f.following?.length || 0,
    }));

    res.status(200).json({ success: true, followers });
  } catch (err) {
    console.error("Error in getFollowers:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// get all following of a user by username
export const getFollowing = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ error: "User not found" });

    const followingData = await User.find(
      { _id: { $in: user.following } },
      "username profilePic bio posts followers following"
    ).lean();

    const following = followingData.map((f) => ({
      _id: f._id,
      username: f.username,
      profilePic: f.profilePic,
      bio: f.bio,
      postCount: f.posts?.length || 0,
      followerCount: f.followers?.length || 0,
      followingCount: f.following?.length || 0,
    }));

    res.status(200).json({ success: true, following });
  } catch (err) {
    console.error("Error in getFollowing:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// delete user account
export const deleteAccount = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ error: "User not found" });

    // 1. Notify followers
    for (const followerId of user.followers) {
      const farewellNoti = await createNotification(
        "account-deleted",
        followerId,
        user._id,
        `${user.username} has deleted their account.`
      );

      const recipientSocketId = getRecipientSocketId(followerId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("newNotification", farewellNoti);
      }
    }
    await Notification.deleteMany({
      $or: [
        { fromUser: user._id }, // Notifications where the deleted user is the target
        { toUser: user._id }, // Notifications where the deleted user is the actor
      ],
    });

    // 2. Clean up user-related data
    await Post.deleteMany({ postedBy: user._id });
    await Post.updateMany({}, { $pull: { replies: { userId: user._id } } });
    await User.updateMany(
      { followers: user._id },
      { $pull: { followers: user._id } }
    );
    await User.updateMany(
      { following: user._id },
      { $pull: { following: user._id } }
    );
    // 5. Delete conversations and messages
    const conversations = await Conversation.find({
      participants: user._id,
    });

    const conversationIds = conversations.map((conv) => conv._id);

    await Message.deleteMany({ conversationId: { $in: conversationIds } });
    await Conversation.deleteMany({ _id: { $in: conversationIds } });
    // 3. Delete the user
    await User.findByIdAndDelete(user._id);

    res
      .status(200)
      .json({ message: "User account deleted and followers notified." });
  } catch (err) {
    console.error("Account deletion failed:", err);
    res.status(500).json({ error: "Failed to delete account." });
  }
};
