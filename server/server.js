import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";

const { initPassport } = await import("./config/passport.js");
const { default: connectDB } = await import("./config/db.js");
const { app, server } = await import("./socket/socket.js");

const { default: authRoutes } = await import("./routes/auth.routes.js");
const { default: userRoutes } = await import("./routes/user.routes.js");
const { default: messageRoutes } = await import("./routes/message.routes.js");

initPassport();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});