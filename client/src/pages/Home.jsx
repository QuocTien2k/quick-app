import { useEffect, useState } from "react";
import { getListUsers, getAllUsers, getLoggedUser } from "../apiCalls/users";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Home = () => {
    const [listUsers, setListUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [token, setToken] = useState(localStorage.getItem("token"));

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError("");

                if (token) {
                    // Kiểm tra xem token có hợp lệ không
                    const loggedUserRes = await getLoggedUser();
                    if (!loggedUserRes?.success) {
                        throw new Error("Token không hợp lệ, vui lòng đăng nhập lại.");
                    }

                    // Nếu token hợp lệ, lấy danh sách trừ user hiện tại
                    const usersRes = await getAllUsers();
                    if (usersRes.success) {
                        setListUsers(usersRes?.data);
                    } else {
                        throw new Error(usersRes?.message);
                    }
                } else {
                    // Nếu không có token, lấy toàn bộ danh sách
                    const usersRes = await getListUsers();
                    if (usersRes.success) {
                        setListUsers(usersRes.data);
                    } else {
                        throw new Error(usersRes.message);
                    }
                }

            } catch (error) {
                setError(error?.message);

                // Nếu token lỗi, xóa token và chuyển hướng đến trang login
                if (token) {
                    localStorage.removeItem("token");
                    setToken(null); // Xóa token khỏi state
                    navigate("/login");
                }
            } finally {
                setLoading(false);
            }

        };

        fetchUsers(); // Gọi API khi component mount hoặc token thay đổi
    }, [token, navigate]);

    // Hiển thị khi đang tải dữ liệu hoặc có lỗi
    if (loading) return <div className="p-4">Đang tải...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    // Xử lý chat
    const handleChat = async (user) => {

        if (token) {
            console.log("Mở chat với: ", user)
        } else {
            toast.error("Vui lòng đăng nhập để trò chuyện!");
        }
    }


    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">Danh sách người dùng</h1>
            {listUsers.length === 0 ? (
                <p>Không có người dùng nào.</p>
            ) : (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {listUsers.map((user) => (
                        <div
                            key={user._id}
                            className="bg-white border rounded-lg shadow-md p-4 hover:shadow-lg transition cursor-pointer"
                            onClick={() => handleChat(user._id)}
                        >
                            <div className="flex items-center space-x-4 mb-3">
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-gray-600">
                                    {user.firstname?.charAt(0).toUpperCase() || "?"}
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold">Xin chào,{user.lastname} {user.firstname}</h2>
                                    <p className="text-sm text-gray-600">{user.email}</p>
                                </div>
                            </div>
                            {/* Bạn có thể thêm nhiều thông tin hơn tại đây */}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;
