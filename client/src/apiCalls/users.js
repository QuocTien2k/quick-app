import { axiosInstance } from "./index";

//lấy tất cả danh sách người dùng
export const getListUsers = async () => {
  try {
    const response = await axiosInstance.get("/api/user/listUsers");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    throw new Error("Không thể lấy danh sách người dùng. Vui lòng thử lại.");
  }
};

//lấy tất cả danh sách trừ tài khoản đang đăng nhập
export const getAllUsers = async () => {
  try {
    const response = await axiosInstance.get("/api/user/get-all-users");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    throw new Error("Không thể lấy danh sách người dùng. Vui lòng thử lại.");
  }
};

//lấy user đăng nhập
export const getLoggedUser = async () => {
  try {
    const response = await axiosInstance.get("/api/user/get-logged-user");

    return response?.data;
  } catch (error) {
    console.error("Lỗi khi lấy người dùng:", error?.message);
    throw new Error("Không thể lấy người dùng. Vui lòng thử lại.");
  }
};

//user upload image
export const uploadProfilePic = async (image) => {
  try {
    const response = await axiosInstance.post("/api/user/upload-profile-pic", {
      image,
    });

    return response?.data;
  } catch (error) {
    console.error("Lỗi khi tải ảnh:", error?.message);
    throw new Error("Không thể tải ảnh. Vui lòng thử lại.");
  }
};
