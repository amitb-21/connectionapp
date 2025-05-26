import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";
import ConnectionRequest from "../models/connection.model.js";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

export const register = async(req, res) => {
  try {
     console.log("Registration request received:", req.body);
    const { name, email, username, firebaseUid } = req.body;

    if (!name || !email || !username || !firebaseUid) {
      console.log("Missing fields:", { name, email, username, firebaseUid });
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const userExists = await User.findOne({
      $or: [{ email }, { username }, { firebaseUid }]
    });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      name,
      email,
      username,
      firebaseUid
    });

    await newUser.save();

    const profile = new Profile({
      userId: newUser._id
    });

    await profile.save();

    res.json({ message: "User Created successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getUserAndProfile = async(req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(404).json({ message: "User not found" });

    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    return res.json({
      user,
      profile
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getUserByFirebaseUid = async(req, res) => {
  try {
    const { firebaseUid } = req.params;
    
    const user = await User.findOne({ firebaseUid });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const profile = await Profile.findOne({ userId: user._id });
    
    return res.json({
      user,
      profile
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const uploadProfilePicture = async(req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Delete old profile picture if exists
    if (user.profilePicture) {
      const oldPicturePath = path.join("uploads", user.profilePicture);
      if (fs.existsSync(oldPicturePath)) {
        fs.unlinkSync(oldPicturePath);
      }
    }

    // Update user with new profile picture
    user.profilePicture = req.file.filename;
    await user.save();

    return res.json({ 
      message: "Profile picture updated successfully",
      profilePicture: user.profilePicture
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateUserProfile = async(req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, bio, currentPost } = req.body;

    // Update user fields
    if (name) user.name = name;
    await user.save();

    // Update profile fields
    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    if (bio) profile.bio = bio;
    if (currentPost) profile.currentPost = currentPost;
    await profile.save();

    return res.json({ 
      message: "Profile updated successfully",
      user,
      profile
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateProfileData = async(req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(404).json({ message: "User not found" });

    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const { education, experience, skills } = req.body;

    if (education) profile.education = education;
    if (experience) profile.experience = experience;
    if (skills) profile.skills = skills;

    await profile.save();

    return res.json({ 
      message: "Profile data updated successfully",
      profile
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// In backend/controllers/user.controller.js
export const getAllUserProfile = async(req, res) => {
  try {
    const currentUserId = req.user?._id;
    const users = await User.find().select("-firebaseUid");
    
    // If user is authenticated, add connection status to each user
    if (currentUserId) {
      const usersWithConnectionStatus = await Promise.all(users.map(async (user) => {
        // Skip self
        if (user._id.toString() === currentUserId.toString()) {
          return user;
        }
        
        // Check connection status
        const existingConnection = await ConnectionRequest.findOne({
          $or: [
            { userId: currentUserId, connectionId: user._id },
            { userId: user._id, connectionId: currentUserId }
          ]
        });
        
        const userObj = user.toObject();
        
        if (existingConnection) {
          userObj.isConnection = existingConnection.status === "accepted";
          userObj.connectionRequestSent = existingConnection.status === "pending" && 
                                         existingConnection.userId.toString() === currentUserId.toString();
          userObj.connectionRequestReceived = existingConnection.status === "pending" && 
                                             existingConnection.userId.toString() === user._id.toString();
        }
        
        return userObj;
      }));
      
      return res.json({ users: usersWithConnectionStatus });
    }
    
    return res.json({ users });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export const downloadProfile = async(req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Find the profile
    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    
    // Generate PDF
    const doc = new PDFDocument();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${user.name.replace(/\s+/g, '_')}_resume.pdf"`);
    
    // Pipe the PDF to the response
    doc.pipe(res);
    
    // Add content to the PDF
    doc.fontSize(25).text(`${user.name}'s Profile`, {
      align: 'center'
    });
    
    doc.moveDown();
    doc.fontSize(15).text(`Email: ${user.email}`);
    doc.fontSize(15).text(`Name: ${user.name}`);
    
    if (user.bio) {
      doc.moveDown();
      doc.fontSize(18).text('Bio');
      doc.fontSize(12).text(user.bio);
    }
    
    if (user.currentPost) {
      doc.moveDown();
      doc.fontSize(18).text('Current Position');
      doc.fontSize(12).text(user.currentPost);
    }
    
    if (profile.education && profile.education.length > 0) {
      doc.moveDown();
      doc.fontSize(18).text('Education');
      profile.education.forEach(edu => {
        doc.fontSize(14).text(edu.institution);
        doc.fontSize(12).text(`${edu.degree}, ${edu.startYear} - ${edu.endYear || 'Present'}`);
        doc.moveDown(0.5);
      });
    }
    
    if (profile.experience && profile.experience.length > 0) {
      doc.moveDown();
      doc.fontSize(18).text('Experience');
      profile.experience.forEach(exp => {
        doc.fontSize(14).text(exp.company);
        doc.fontSize(12).text(`${exp.position}, ${exp.startYear} - ${exp.endYear || 'Present'}`);
        doc.fontSize(10).text(exp.description || '');
        doc.moveDown(0.5);
      });
    }
    
    if (profile.skills && profile.skills.length > 0) {
      doc.moveDown();
      doc.fontSize(18).text('Skills');
      doc.fontSize(12).text(profile.skills.join(', '));
    }
    
    // Finalize PDF
    doc.end();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Updated connection controller functions using ConnectionRequest model consistently

export const sendConnectionRequest = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { connectionId } = req.body;

    if (!connectionId) {
      return res.status(400).json({ message: "connectionId is required." });
    }

    if (senderId.toString() === connectionId) {
      return res.status(400).json({ message: "You cannot connect with yourself." });
    }

    // Check if target user exists
    const targetUser = await User.findById(connectionId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if a request already exists in either direction
    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { userId: senderId, connectionId },
        { userId: connectionId, connectionId: senderId }
      ]
    });

    if (existingRequest) {
      if (existingRequest.status === "pending") {
        return res.status(400).json({ message: "Connection request already pending." });
      }
      if (existingRequest.status === "accepted") {
        return res.status(400).json({ message: "You are already connected." });
      }
      if (existingRequest.status === "rejected") {
        // Update the rejected request to pending and change the requester
        existingRequest.userId = senderId;
        existingRequest.connectionId = connectionId;
        existingRequest.status = "pending";
        existingRequest.createdAt = new Date();
        await existingRequest.save();
        return res.status(200).json({ message: "Connection request sent successfully." });
      }
    }

    // Create new connection request
    const newRequest = new ConnectionRequest({
      userId: senderId,
      connectionId,
      status: "pending"
    });

    await newRequest.save();
    return res.status(201).json({ message: "Connection request sent successfully." });

  } catch (err) {
    console.error("sendConnectionRequest error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

export const getMyConnectionRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all pending connection requests where current user is the recipient
    const connectionRequests = await ConnectionRequest.find({
      connectionId: userId,
      status: "pending"
    })
    .populate('userId', 'name username profilePicture')
    .sort({ createdAt: -1 });

    // Format the response to match the expected structure
    const formattedRequests = connectionRequests.map(request => ({
      _id: request.userId._id,
      name: request.userId.name,
      username: request.userId.username,
      profilePicture: request.userId.profilePicture,
      requestId: request._id,
      createdAt: request.createdAt
    }));

    return res.json({ connectionRequests: formattedRequests });
  } catch (error) {
    console.error("getMyConnectionRequests error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const getMySentConnectionRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all pending connection requests where current user is the sender
    const sentRequests = await ConnectionRequest.find({
      userId: userId,
      status: "pending"
    })
    .populate('connectionId', 'name username profilePicture bio')
    .sort({ createdAt: -1 });

    // Format the response to match the expected structure
    const formattedRequests = sentRequests.map(request => ({
      _id: request.connectionId._id,
      name: request.connectionId.name,
      username: request.connectionId.username,
      profilePicture: request.connectionId.profilePicture,
      bio: request.connectionId.bio,
      requestId: request._id,
      createdAt: request.createdAt
    }));

    return res.json({ sentConnectionRequests: formattedRequests });
  } catch (error) {
    console.error("getMySentConnectionRequests error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const whatAreMyConnections = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all accepted connections where current user is either sender or recipient
    const connections = await ConnectionRequest.find({
      $or: [
        { userId: userId, status: "accepted" },
        { connectionId: userId, status: "accepted" }
      ]
    })
    .populate('userId', 'name username profilePicture')
    .populate('connectionId', 'name username profilePicture')
    .sort({ createdAt: -1 });

    // Format the response to get the other person in each connection
    const formattedConnections = connections.map(connection => {
      const isCurrentUserSender = connection.userId._id.toString() === userId.toString();
      const otherUser = isCurrentUserSender ? connection.connectionId : connection.userId;
      
      return {
        _id: otherUser._id,
        name: otherUser.name,
        username: otherUser.username,
        profilePicture: otherUser.profilePicture,
        connectionDate: connection.updatedAt || connection.createdAt
      };
    });

    return res.json({ connections: formattedConnections });
  } catch (error) {
    console.error("whatAreMyConnections error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.body; // This is the ID of the person who sent the request
    const currentUserId = req.user._id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find the pending connection request
    const connectionRequest = await ConnectionRequest.findOne({
      userId: userId,
      connectionId: currentUserId,
      status: "pending"
    });

    if (!connectionRequest) {
      return res.status(404).json({ message: "No pending connection request found from this user" });
    }

    // Update the status to accepted
    connectionRequest.status = "accepted";
    await connectionRequest.save();

    return res.json({ message: "Connection request accepted successfully" });
  } catch (error) {
    console.error("acceptConnectionRequest error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const rejectConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.body; // This is the ID of the person who sent the request
    const currentUserId = req.user._id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find the pending connection request
    const connectionRequest = await ConnectionRequest.findOne({
      userId: userId,
      connectionId: currentUserId,
      status: "pending"
    });

    if (!connectionRequest) {
      return res.status(404).json({ message: "No pending connection request found from this user" });
    }

    // Update the status to rejected
    connectionRequest.status = "rejected";
    await connectionRequest.save();

    return res.json({ message: "Connection request rejected successfully" });
  } catch (error) {
    console.error("rejectConnectionRequest error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const toggleConnectionRequest = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { connectionId } = req.body;

    if (!connectionId) {
      return res.status(400).json({ message: "connectionId is required." });
    }

    if (currentUserId.toString() === connectionId) {
      return res.status(400).json({ message: "You cannot toggle connection with yourself." });
    }

    // Look for any existing connection between the two users
    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { userId: currentUserId, connectionId },
        { userId: connectionId, connectionId: currentUserId }
      ]
    });

    if (!existingRequest) {
      return res.status(404).json({ message: "No connection exists between the users." });
    }

    if (existingRequest.status === "pending") {
      // Allow sender to cancel only if they are the requester
      if (existingRequest.userId.toString() === currentUserId.toString()) {
        await existingRequest.deleteOne();
        return res.status(200).json({ message: "Connection request cancelled." });
      } else {
        return res.status(403).json({ message: "You can't cancel someone else's request." });
      }
    }

    if (existingRequest.status === "accepted") {
      // Unfriend logic - remove the connection entirely
      await existingRequest.deleteOne();
      return res.status(200).json({ message: "Connection removed successfully." });
    }

    if (existingRequest.status === "rejected") {
      return res.status(400).json({ message: "Rejected request cannot be toggled. Send a new request." });
    }

    return res.status(400).json({ message: "Invalid connection state." });

  } catch (err) {
    console.error("toggleConnectionRequest error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// Helper function to get connection status between two users
export const getConnectionStatus = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { targetUserId } = req.params;

    if (!targetUserId) {
      return res.status(400).json({ message: "Target user ID is required." });
    }

    if (currentUserId.toString() === targetUserId) {
      return res.json({ status: "self" });
    }

    // Check for any existing connection between the users
    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { userId: currentUserId, connectionId: targetUserId },
        { userId: targetUserId, connectionId: currentUserId }
      ]
    });

    if (!existingRequest) {
      return res.json({ status: "none" });
    }

    // Determine the relationship from current user's perspective
    let status = existingRequest.status;
    let actionBy = "other";

    if (existingRequest.userId.toString() === currentUserId.toString()) {
      actionBy = "self";
    }

    return res.json({ 
      status,
      actionBy,
      canCancel: existingRequest.status === "pending" && actionBy === "self",
      canAccept: existingRequest.status === "pending" && actionBy === "other",
      canReject: existingRequest.status === "pending" && actionBy === "other",
      canUnfriend: existingRequest.status === "accepted"
    });

  } catch (error) {
    console.error("getConnectionStatus error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Updated getUserProfileAndUserBasedOnUsername function
export const getUserProfileAndUserBasedOnUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user._id;

    const targetUser = await User.findOne({ username }).select("-firebaseUid");
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const userProfile = await Profile.findOne({ userId: targetUser._id });
    if (!userProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Check connection status using ConnectionRequest model
    const existingConnection = await ConnectionRequest.findOne({
      $or: [
        { userId: currentUserId, connectionId: targetUser._id },
        { userId: targetUser._id, connectionId: currentUserId }
      ]
    });

    let connectionStatus = {
      isConnection: false,
      requestSent: false,
      requestReceived: false,
      status: "none"
    };

    if (existingConnection) {
      connectionStatus.status = existingConnection.status;
      
      if (existingConnection.status === "accepted") {
        connectionStatus.isConnection = true;
      } else if (existingConnection.status === "pending") {
        // Check who sent the request
        if (existingConnection.userId.toString() === currentUserId.toString()) {
          connectionStatus.requestSent = true;
        } else {
          connectionStatus.requestReceived = true;
        }
      }
    }

    // Return only necessary profile data
    const profileData = {
      bio: userProfile.bio,
      currentPost: userProfile.currentPost,
      education: userProfile.education,
      experience: userProfile.experience,
      skills: userProfile.skills
    };

    return res.json({ 
      user: targetUser, 
      profile: profileData, 
      connectionStatus
    });
  } catch (error) {
    console.error("getUserProfileAndUserBasedOnUsername error:", error);
    return res.status(500).json({ message: error.message });
  }
};