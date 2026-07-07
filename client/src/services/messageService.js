import api from "./api";

export const getMessages = (userId) =>
  api.get(`/api/messages/${userId}`);

export const sendMessage = (userId, formData) =>
  api.post(`/api/messages/send/${userId}`, formData);


export const deleteMessage = (messageId, mode) =>
  api.delete(`/api/messages/${messageId}`, {
    data: { mode },
  });

export const clearChat = (userId) =>
  api.post(`/api/messages/clear/${userId}`);

export const getUsers = () =>
  api.get("/api/users");
export const markMessagesSeen = (userId) =>
  api.put(`/api/messages/seen/${userId}`);