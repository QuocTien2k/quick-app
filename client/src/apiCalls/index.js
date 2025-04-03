import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Lấy API từ biến môi trường
  headers: {
    authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});
