import Post from "../model/post.model.js";
import User from "../model/user.model.js";
import { v2 as cloudinary } from "cloudinary";
// create post
export const createPost = async (req, res) => {
  try {
    const { postedBy, text } = req.body;
    let { img } = req.body;
    if (!postedBy || !text)
      return res.status(400).json({ error: "Please fill in all fields" });

    const user = await User.findById(postedBy);
    if (!user) return res.status(400).json({ error: "User does not exist" });

    if (user._id.toString() !== req.user._id.toString())
      return res.status(400).json({ error: "Unauthorized to create post" });

    const maxLength = 500;
    if (text.length > maxLength) {
      return res
        .status(400)
        .json({ error: `Text must be less than ${maxLength} characters` });
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    const newPost = new Post({ postedBy, text, img });
    await newPost.save();

    await User.findByIdAndUpdate(postedBy, { $push: { posts: newPost._id } });

    res.status(200).json(newPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in createPost: ", error.message);
  }
};

// get post
export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "postedBy",
      "username"
    );
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in getPost: ", error.message);
  }
};

// delete post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.postedBy.toString() !== req.user._id.toString())
      return res.status(400).json({ error: "Unauthorized to delete post" });

    if (post.img) {
      const postId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(postId);
    }
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in deletePost: ", error.message);
  }
};

// delete comment
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id; // Logged-in user ID

    // Find the post containing the comment
    const post = await Post.findOne({ "replies._id": commentId });
    if (!post) return res.status(404).json({ error: "Comment not found" });

    // Find the comment to check ownership
    const comment = post.replies.find(
      (reply) => reply._id.toString() === commentId
    );
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    // Check if the logged-in user owns the comment
    if (comment.userId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "You can only delete your own comments" });
    }

    // Remove comment from the array
    post.replies = post.replies.filter(
      (reply) => reply._id.toString() !== commentId
    );
    await post.save();

    res.status(200).json({ message: "Comment deleted successfully", post });
  } catch (error) {
    console.log("Error deleting comment:", error.message);
    res.status(500).json({ error: error.message });
  }
};

//like dislike post
export const likeDislikePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "No post found" });

    const userLikedPost = post.likes.some(
      (id) => id.toString() === userId.toString()
    );

    if (userLikedPost) {
      // Unlike post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      return res.status(200).json({
        success: true,
        message: `${req.user.username} unliked this post`,
      });
    } else {
      // Like post
      post.likes.push(userId); // ObjectId is fine
      await post.save();
      return res.status(200).json({
        success: true,
        message: `${req.user.username} liked this post`,
      });
    }
  } catch (error) {
    console.error("Error in likeDislikePost:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

// reply to user
export const replyToUser = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;
    const userProfilePic = req.user.profilePic;
    const username = req.user.username;
    const commentAt = new Date();

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const reply = { userId, text, userProfilePic, username, commentAt };
    post.replies.push(reply);
    await post.save();

    res.status(200).json(reply);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in replyToUser: ", error.message);
  }
};

//get feed posts
export const getFeedPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    const following = user.following;
    const feedPosts = await Post.find({ postedBy: { $in: following } }).sort({
      createdAt: -1,
    });
    res.status(200).json(feedPosts);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in getFeedPosts: ", error.message);
  }
};

// get user posts
export const getUserPosts = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const posts = await Post.find({ postedBy: user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
