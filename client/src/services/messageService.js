import api from "./api";

export const getMessages = (userId) => api.get(`/api/messages/${userId}`);

export const sendMessage = (userId, text) =>
  api.post(`/api/messages/send/${userId}`, { text });

export const getUsers = () => api.get("/api/users");