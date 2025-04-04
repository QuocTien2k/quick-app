import { useEffect, useState } from "react";
import { getListUsers, getAllUsers, getLoggedUser } from "../apiCalls/users";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "../redux/loaderSlice";

const Home = () => {
    const [listUsers, setListUsers] = useState([]);
    // const { user } = useSelector((state) => state.user.user);
    const dispatch = useDispatch();
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                dispatch(showLoader());
                setError("");

                if (token) {
                    // Kiểm tra xem user có login chưa 
                    const loggedUserRes = await getLoggedUser();
                    if (!loggedUserRes?.success) {
                        throw new Error("Token không hợp lệ, vui lòng đăng nhập lại.");
                    }
                    setCurrentUser(loggedUserRes?.data); // Lưu thông tin người dùng hiện tại

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
                    //navigate("/login");
                }
            } finally {
                dispatch(hideLoader());
            }

        };

        fetchUsers(); // Gọi API khi component mount hoặc token thay đổi
    }, [token, navigate]);

    // Hiển thị khi đang tải dữ liệu hoặc có lỗi
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    // Xử lý chat
    const handleChat = async (user) => {
        // Kiểm tra xem người dùng đã đăng nhập chưa
        if (currentUser) {
            console.log("Chat với người dùng có ID: ", user);
        } else {
            toast.error("Vui lòng đăng nhập để trò chuyện!");
        }
    }
    //console.log(currentUser);
    return (
        <>
            <div className="p-4">
                {!currentUser ? (
                    <button
                        onClick={() => navigate("/login")}
                        className="cursor-pointer px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        Đăng nhập
                    </button>
                ) : (
                    <div className="flex items-center justify-between bg-white p-4 rounded-lg">
                        <h3 className="text-xl font-semibold text-blue-600 flex items-center gap-2">
                            👋 Xin chào, <span className="text-gray-800">{currentUser.firstname} {currentUser.lastname}</span>!
                        </h3>
                        <button
                            onClick={() => console.log("Đăng xuất")}
                            className="cursor-pointer px-5 py-2 bg-red-600 text-white font-medium rounded-lg shadow-md 
                   hover:bg-red-700 hover:shadow-lg transition-all duration-300"
                        >
                            Đăng xuất
                        </button>
                    </div>

                )}
                <div className="border-b-2 border-gray-200 pb-2 mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 text-center">
                        📜 Danh sách người dùng
                    </h1>
                </div>

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
        </>
    );
};

export default Home;
