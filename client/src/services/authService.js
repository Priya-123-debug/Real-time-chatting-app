// src/services/authService.js
import api from "./api";

export const getMe = () => api.get("/api/auth/me");
export const logout = () => api.post("/api/auth/logout");

// Google OAuth — just redirect to backend, backend handles everything
export const googleLogin = () => {
  window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
};