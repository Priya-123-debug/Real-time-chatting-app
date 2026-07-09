import express from "express";
import { getUsers } from "../controllers/user.controller.js";
import protectRoute from "../middleware/protectRoute.js";
import {  searchUsers,editUser } from "../controllers/user.controller.js";
import upload from "../middleware/multer.js";



const router = express.Router();

router.get("/", protectRoute, getUsers);
router.get("/search", protectRoute, searchUsers);
router.put("/profile", protectRoute, upload.single("profilePic"), editUser);

export default router;