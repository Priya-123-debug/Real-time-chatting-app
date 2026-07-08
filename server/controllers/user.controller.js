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