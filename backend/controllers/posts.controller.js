import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";
import Post from "../models/posts.model.js";
import Comment from "../models/comments.model.js";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

export const activeCheck = async (req, res) => {
    return res.status(200).json({ message: "active" });
};

export const createPost = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: "User not found" });
        }

        const post = await Post.create({
            userId: user._id,
            body: req.body.body || "",
            media: req.file ? req.file.filename : "",
            fileType: req.file ? req.file.mimetype.split("/")[1] : "",
        });

        return res.status(201).json({ message: "Post created successfully", post });

    } catch (error) {
        console.error("❌ Error creating post:", error);

        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(500).json({ message: error.message });
    }
};

export const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const totalPosts = await Post.countDocuments();
    const totalPages = Math.ceil(totalPosts / limit);
    
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name username profilePicture');
    
    // Create likedByUser map as you already do
    const likedByUser = {};
    if (req.user) {
      for (const post of posts) {
        likedByUser[post._id] = post.likes.includes(req.user._id);
      }
    }
    
    return res.status(200).json({
      posts,
      likedByUser,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts,
        hasMore: page < totalPages
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deletePost = async (req, res) => {
    const { post_id } = req.params; 
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const post = await Post.findById(post_id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        if (post.userId.toString() !== user._id.toString()) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (post.media) {
            const filePath = path.join("uploads", post.media);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await Post.findByIdAndDelete(post_id);

        return res.status(200).json({ message: "Post deleted successfully" });

    } catch (error) {
        console.error("❌ Error deleting post:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const commentPost = async (req, res) => {
    const { post_id } = req.params;
    const { commentBody } = req.body;

    if (!mongoose.Types.ObjectId.isValid(post_id)) {
        return res.status(400).json({ message: "Invalid post ID" });
    }

    if (!commentBody?.trim()) {
        return res.status(400).json({ message: "Comment body cannot be empty" });
    }

    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const post = await Post.findById(post_id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const comment = new Comment({
            userId: user._id,
            postId: post._id,
            body: commentBody.trim(),
        });

        await comment.save();

        const populatedComment = await Comment.findById(comment._id)
            .populate("userId", "name username profilePicture");

        return res.status(201).json({
            message: "Comment added successfully",
            comment: populatedComment
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


export const get_comments_by_post = async (req, res) => {
  try {
    const { post_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const totalComments = await Comment.countDocuments({ postId: post_id });
    const totalPages = Math.ceil(totalComments / limit);
    
    const comments = await Comment.find({ postId: post_id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name username profilePicture');
    
    return res.status(200).json({
      comments,
      pagination: {
        currentPage: page,
        totalPages,
        totalComments,
        hasMore: page < totalPages
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const delete_comment_of_user = async (req, res) => {
    const { comment_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(comment_id)) {
        return res.status(400).json({ message: "Invalid comment ID" });
    }

    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const comment = await Comment.findById(comment_id);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        const post = await Post.findById(comment.postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        if (comment.userId.toString() !== user._id.toString() && 
            post.userId.toString() !== user._id.toString()) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        await comment.deleteOne();

        return res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const toggle_like = async (req, res) => {
    const { post_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(post_id)) {
        return res.status(400).json({ message: "Invalid post ID" });
    }

    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const post = await Post.findById(post_id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const isLiked = post.likes.map(id => id.toString()).includes(user._id.toString());

        const update = isLiked
            ? { $pull: { likes: user._id } }  
            : { $addToSet: { likes: user._id } };  

        const updatedPost = await Post.findByIdAndUpdate(post_id, update, { new: true });

        return res.status(200).json({ 
            message: isLiked ? "Post unliked successfully" : "Post liked successfully",
            likesCount: updatedPost.likes.length,
            isLiked: !isLiked
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const get_likes_by_post = async (req, res) => {
    const { post_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(post_id)) {
        return res.status(400).json({ message: "Invalid post ID" });
    }

    try {
        const post = await Post.findById(post_id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        
        // Get users who liked the post
        const likedUsers = await User.find({ _id: { $in: post.likes } })
            .select("name username profilePicture");
        
        // Return likes data
        return res.status(200).json({
            likesCount: post.likes.length,
            previewLikes: likedUsers.slice(0, 3), // First 3 users for preview
            allLikes: likedUsers // All users who liked
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getPostsByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find posts by userId, newest first
    const posts = await Post.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .populate('userId', 'name username profilePicture');

    return res.status(200).json({ posts });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
