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

export const getAllMessages = async (chatId) => {
  try {
    const response = await axiosInstance.get(
      `/api/message/get-all-messages/${chatId}`
    );

    return response?.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi lấy tin nhắn!");
  }
};
