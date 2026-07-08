import api from "./api";

export const searchUsers = (query) =>

  api.get(`/api/users/search?query=${query}`);