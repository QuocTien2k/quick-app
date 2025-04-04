import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLoggedUser } from "../apiCalls/users";

export const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const getLoggedInUser = async () => {
    let response = null;
    try {
      response = await getLoggedUser();

      if (response?.success) {
        setUser(response?.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy người dùng:", error);
      throw new Error("Không thể lấy người dùng. Vui lòng thử lại.");
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      //
      getLoggedInUser();
    } else {
      navigate("/login");
    }
  });

  return (
    <div>
      <p>
        {user.firstname} {user.lastname}
      </p>
      {children}
    </div>
  );
};
