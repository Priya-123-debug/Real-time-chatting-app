import express from "express";
import { getMessages, sendMessage ,clearChat} from "../controllers/message.controller.js";
import protectRoute from "../middleware/protectRoute.js";
import { deleteMessageForMe } from "../controllers/message.controller.js";
import { markMessagesSeen } from "../controllers/message.controller.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.get("/:userId", protectRoute, getMessages);
router.post(
  "/send/:userId",
  protectRoute,
  upload.single("media"),
  sendMessage
);
router.delete("/:messageId", protectRoute, deleteMessageForMe);
router.post("/clear/:userId", protectRoute, clearChat);
router.put(
  "/seen/:userId",
  protectRoute,
  markMessagesSeen
);

export default router;