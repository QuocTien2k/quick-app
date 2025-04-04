import { axiosInstance } from "./index";

export const getAllChats = async () => {
  try {
    const response = await axiosInstance.get("/api/chat/get-all-chats");
    return response?.data;
  } catch (error) {
    console.error(error);
  }
};

export const createNewChat = async (members) => {
  let response = null;
  try {
    response = await axiosInstance.post("/api/chat/create-new-chat", {
      members,
    });
    return response?.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi tạo chat!");
  }
};
