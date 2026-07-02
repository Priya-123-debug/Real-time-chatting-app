import express from "express";
import { getMessages, sendMessage } from "../controllers/message.controller.js";
import protectRoute from "../middleware/protectRoute.js";
import { deleteMessageForMe } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/:userId", protectRoute, getMessages);
router.post("/send/:userId", protectRoute, sendMessage);
router.delete("/:messageId", protectRoute, deleteMessageForMe);

export default router;