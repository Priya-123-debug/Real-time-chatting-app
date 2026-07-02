import api from "./api";

export const getMessages = (userId) =>
  api.get(`/api/messages/${userId}`);

export const sendMessage = (userId, text) =>
  api.post(`/api/messages/send/${userId}`, { text });

export const deleteMessage = (messageId, mode) =>
  api.delete(`/api/messages/${messageId}`, {
    data: { mode },
  });

export const clearChat = (userId) =>
  api.delete(`/api/messages/clear/${userId}`);

export const getUsers = () =>
  api.get("/api/users");