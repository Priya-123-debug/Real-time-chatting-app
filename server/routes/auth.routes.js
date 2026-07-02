import express from "express";
import passport from "passport";
import { googleCallback, getMe, logout } from "../controllers/auth.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

// redirect to Google
router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false,
}));

// Google sends user back here
router.get("/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  googleCallback
);

router.get("/me", protectRoute, getMe);
router.post("/logout", protectRoute, logout);

export default router;