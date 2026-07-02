import User from "../models/User.model.js";

// get all users except logged in user
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};