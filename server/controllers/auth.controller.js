import generateToken from "../utils/generateToken.js";

// called after passport verifies Google user
export const googleCallback = (req, res) => {
  generateToken(req.user._id, res);
  res.redirect(process.env.CLIENT_URL);
};

// get currently logged in user
export const getMe = (req, res) => {
  res.json(req.user);
};

// logout
export const logout = (req, res) => {
  res.clearCookie("jwt");
  res.json({ message: "Logged out successfully" });
};