import { axiosInstance } from "./index";

export const signupUser = async (user) => {
  try {
    const response = await axiosInstance.post("/api/auth/signup", user);

    return response.data;
  } catch (error) {
    return error.response?.data;
  }
};

export const loginUser = async (user) => {
  try {
    const response = await axiosInstance.post("/api/auth/login", user);

    return response.data;
  } catch (error) {
    return error.response?.data;
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await axiosInstance.post("/api/auth/forgot-password", {
      email,
    });
    return response.data;
  } catch (error) {
    return error.response?.data;
  }
};

export const resetPassword = async ({ token, newPassword }) => {
  try {
    const response = await axiosInstance.post(
      `/api/auth/reset-password?token=${token}`,
      {
        newPassword,
      }
    );
    return response.data;
  } catch (error) {
    return error.response?.data;
  }
};
