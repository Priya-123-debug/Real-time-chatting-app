import api from "./api";

export const searchUsers = (query) =>

  api.get(`/api/users/search?query=${query}`);

export const updateProfile = (formData) =>

  api.put("/api/users/profile", formData);