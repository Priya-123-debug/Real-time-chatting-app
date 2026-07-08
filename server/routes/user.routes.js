import express from "express";
import { getUsers } from "../controllers/user.controller.js";
import protectRoute from "../middleware/protectRoute.js";
import {  searchUsers } from "../controllers/user.controller.js";



const router = express.Router();

router.get("/", protectRoute, getUsers);
router.get("/search", protectRoute, searchUsers);

export default router;