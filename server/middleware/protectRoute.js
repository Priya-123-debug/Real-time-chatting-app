import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-googleId");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;   // attach user to request
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export default protectRoute;