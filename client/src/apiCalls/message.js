import { axiosInstance } from "./index";

export const createNewMessage = async (message) => {
  try {
    const response = await axiosInstance.post(
      "/api/message/new-message",
      message
    );

    return response?.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi tạo tin nhắn!");
  }
};
