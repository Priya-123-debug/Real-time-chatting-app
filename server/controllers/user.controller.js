import User from "../models/User.model.js";


import uploadToCloudinary from "../utils/uploadToCloudinary.js";

import cloudinary from "../config/cloudinary.js";

// get all users except logged in user
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
export const searchUsers = async (req, res) => {

  try {

    const query = req.query.query?.trim() || "";

    const myId = req.user._id;

    if (!query) {

      return res.json([]);

    }
    if (query.length < 2) {

  return res.json([]);

}

    const regex = new RegExp(`^${query}`, "i");

    const users = await User.find({

      _id: { $ne: myId },

      username: regex,

    })

      .select("username profilePic")

      .limit(10);

    res.json(users);

  } catch (err) {

    res.status(500).json({ message: "Server error" });

  }

};

export const editUser = async (req, res) => {

  try {

    const userId = req.user._id;

    const existingUser = await User.findById(userId);

    if (!existingUser) {

      return res.status(404).json({ message: "User not found" });

    }

    const updateData = {};

    // Username update

    if (req.body.username) {

      const username = req.body.username.trim();

      if (username && username !== existingUser.username) {

        updateData.username = username;

      }

    }

    // Profile picture update

    if (req.file) {

      const uploaded = await uploadToCloudinary(req.file);

      // Delete old image if exists

      if (existingUser.profilePicPublicId) {

        await cloudinary.uploader.destroy(existingUser.profilePicPublicId);

      }

      updateData.profilePic = uploaded.secure_url;

      updateData.profilePicPublicId = uploaded.public_id;

    }

    if (Object.keys(updateData).length === 0) {

      return res.status(400).json({ message: "No changes provided" });

    }

    const updatedUser = await User.findByIdAndUpdate(

      userId,

      updateData,

      { new: true }

    ).select("-googleId");

    res.json(updatedUser);

  } catch (err) {

    console.error(err);

    res.status(500).json({ message: "Server error" });

  }

};