import { useEffect, useState } from "react";
import { getListUsers, getAllUsers, getLoggedUser } from "../apiCalls/users";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import { createNewChat, getAllChats } from "../apiCalls/chat";
import { setAllChats, setAllUsers, setSelectedChat, setUser } from "../redux/usersSlice";
import ChatArea from "../components/chat";
import MessageNotification from "../components/MessageNotification";
import io from "socket.io-client"
import Profile from "./Profile";

const socket = io("http://localhost:5000");
const Home = () => {
    const [listUsers, setListUsers] = useState([]);
    const dispatch = useDispatch();
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [token, setToken] = useState(localStorage.getItem("token"));
    const { selectedChat, allChats, user } = useSelector((state) => state.user);
    const [onlineUser, setOnlineUser] = useState();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    // const userState = useSelector((state) => state.user); 
    // console.log("User state:", userState); 

    //theo dõi trạng thái đăng nhập và gửi các event đến server
    useEffect(() => {
        if (user) {
            //console.log("User hiện tại: ", user);
            socket.emit("join-room", user._id);
            socket.emit("user-login", user._id);

            socket.on("online-users", onlineUsers => {
                //console.log(onlineUsers);
                setOnlineUser(onlineUsers);
            })
        }
    }, [user]);

    //kiểm tra token, lấy API danh sách 
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
                    // Lưu thông tin người dùng hiện tại vào Redux
                    dispatch(setUser(loggedUserRes?.data)); // Dispatch thông tin người dùng vào Redux

                    // Nếu token hợp lệ, lấy danh sách trừ user hiện tại
                    const usersRes = await getAllUsers();
                    if (usersRes.success) {
                        dispatch(setAllUsers(usersRes?.data));
                        setListUsers(usersRes?.data);

                    } else {
                        throw new Error(usersRes?.message);
                    }
                    getCurrentChat(); // Gọi hàm lấy danh sách chat hiện tại
                    //dispatch(setAllUsers(usersRes.data));
                } else {
                    // Nếu không có token, lấy toàn bộ danh sách
                    const usersRes = await getListUsers();
                    if (usersRes.success) {
                        dispatch(setAllUsers(usersRes.data));  // Dispatch vào Redux
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
    }, [token, navigate, dispatch]);

    // Hiển thị khi đang tải dữ liệu hoặc có lỗi
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    // Xử lý chat
    const openChat = async (selectedUserId) => {
        if (!user) {
            toast.error("Vui lòng đăng nhập để trò chuyện!");
            return;
        }

        // Tìm xem đã có cuộc trò chuyện chưa
        const chat = allChats?.find(chat =>
            chat.members.map(m => m._id).includes(user._id) &&
            chat.members.map(m => m._id).includes(selectedUserId)
        );

        if (chat) {
            dispatch(setSelectedChat(chat)); // Mở cuộc trò chuyện

            // ✅ Cập nhật Redux: đánh dấu đã đọc
            const updatedChats = allChats.map(c => {
                if (c._id === chat._id) {
                    return {
                        ...c,
                        lastMessage: {
                            ...c.lastMessage,
                            read: true,
                        },
                        unreadMessageCount: 0,
                    };
                }
                return c;
            });

            dispatch(setAllChats(updatedChats)); // Cập nhật lại Redux state
            toast.success("Đã mở cuộc trò chuyện!");
        } else {
            // Nếu chưa có chat → tạo mới
            const newChat = await startNewChat(user._id, selectedUserId);
            if (newChat) {
                dispatch(setSelectedChat(newChat));
            }
        }
    };

    //lấy danh sách mà currentUser đã chat
    const getCurrentChat = async () => {
        try {
            const response = await getAllChats();
            //console.log("Danh sách chat:", response?.data);
            if (response?.success) {
                dispatch(setAllChats(response?.data));
            }
        } catch (error) {
            toast.error("Lỗi khi lấy danh sách chat!");
            console.error("Lỗi khi lấy danh sách chat:", error);
        }
    }

    //tạo chat với 2 user
    const startNewChat = async (userId_1, userId_2) => {
        let response = null;
        try {
            dispatch(showLoader());
            response = await createNewChat([userId_1, userId_2]);
            dispatch(hideLoader());

            if (response?.success) {
                const newChat = response.data;
                //console.log("Tạo chat thành công:", response?.data);
                toast.success(response?.message);

                // Gộp luôn vào danh sách nếu chưa có
                const allChatsArray = Array.isArray(allChats) ? allChats : [];
                const isChatInRedux = allChatsArray?.some(chat => chat._id === newChat._id);
                if (!isChatInRedux) {
                    const updateChat = [...allChatsArray, newChat];
                    dispatch(setAllChats(updateChat));
                    dispatch(setSelectedChat(newChat)); // Mở chat mới ngay lập tức
                }

                return newChat;
            }
        } catch (error) {
            dispatch(hideLoader());
            toast.error(error.message);
            console.error("Lỗi khi tạo chat:", error);
            return null;
        }
    };

    //lấy tin nhắn cuối cùng của cuộc trò chuyện
    const getLastMessage = (userId, userLastname) => {
        const chat = allChats?.find(chat => chat.members.map(m => m._id).includes(userId));

        if (!chat || !chat.lastMessage) {
            return "";
        }

        const isSender = chat?.lastMessage?.sender === user._id;
        const prefix = isSender ? "Bạn: " : `Tin nhắn từ ${userLastname}: `;

        // Nếu có text → cắt hiển thị, nếu không mà có ảnh → hiển thị fallback
        const content = chat?.lastMessage?.text
            ? chat.lastMessage.text.substring(0, 20)
            : chat?.lastMessage?.image
                ? "🖼️ Đã gửi một hình ảnh"
                : "[Không có nội dung]";

        return prefix + content;
    };


    //lấy tin nhắn chưa đọc
    const getUnreadMessageCount = (userId) => {
        const chat = allChats.find(chat =>
            chat.members.map(m => m._id).includes(userId)
        )

        if (chat && chat.unreadMessageCount && chat.lastMessage.sender !== user._id) {
            return chat.unreadMessageCount
        } else {
            return 0;
        }
    }

    //xử lý khi update 
    const handleAvatarClick = () => {
        setIsProfileOpen(true);
    };

    //console.log("User hiện tại: ", user);
    //console.log("User hiện tại: ", currentUser);

    return (
        <>
            <div className="p-4">
                {!user ? (
                    <button
                        onClick={() => navigate("/login")}
                        className="cursor-pointer px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        Đăng nhập
                    </button>
                ) : (
                    <div className="flex items-center justify-between bg-white p-4 rounded-lg">
                        <h3 className="text-xl font-semibold text-blue-600 flex items-center gap-2">
                            👋 Xin chào, <span className="text-gray-800">{user.firstname} {user.lastname}</span>!
                        </h3>

                        <div className="cursor-pointer" onClick={handleAvatarClick}>
                            {user.profilePic ? (
                                // Hiển thị hình ảnh
                                <div className="w-12 h-12 rounded-full overflow-hidden">
                                    <img
                                        src={user.profilePic}
                                        alt="User Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                // Nếu không có hình thì hiển thị chữ cái đầu
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-gray-600">
                                    {user.firstname?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        {isProfileOpen && <Profile user={user} onClose={() => setIsProfileOpen(false)} />}

                        {/* Notice and button logout */}
                        <div className="flex items-center justify-between gap-1">

                            {/* 1 cái chuông thông báo tin nhắn chưa đọc */}
                            <MessageNotification
                                listUsers={listUsers}
                                getUnreadMessageCount={getUnreadMessageCount}
                                getLastMessage={getLastMessage}
                                openChat={openChat}
                                socket={socket}
                            />
                            <button
                                onClick={() => console.log("Đăng xuất")}
                                className="cursor-pointer px-5 py-2 bg-red-600 text-white font-medium rounded-lg shadow-md 
                   hover:bg-red-700 hover:shadow-lg transition-all duration-300"
                            >
                                Đăng xuất
                            </button>
                        </div>
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
                                onClick={() => openChat(user._id)}

                            >
                                <div className="flex items-center space-x-4 mb-3">
                                    {user.profilePic ? (
                                        // Hiển thị hình ảnh
                                        <div className="w-12 h-12 rounded-full overflow-hidden">
                                            <img
                                                src={user.profilePic}
                                                alt="User Avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        // Nếu không có hình thì hiển thị chữ cái đầu
                                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-gray-600">
                                            {user.firstname?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <h2 className="text-lg font-semibold">Xin chào,{user.firstname} {user.lastname}</h2>
                                        <p className="text-sm text-gray-600">{user.email}</p>
                                    </div>
                                </div>
                                {/* Bạn có thể thêm nhiều thông tin hơn tại đây */}

                                {/* {getLastMessage(user._id, user.lastname) && (<div>
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                        <span className="text-xs">
                                            {getLastMessage(user._id, user.lastname)}
                                        </span>
                                        <span className="text-[12px] animate-bounce">💬</span>
                                    </p>
                                </div>)} */}

                            </div>
                        ))}
                    </div>
                )}

                {selectedChat && <ChatArea onlineUser={onlineUser} socket={socket} />}

            </div>
        </>
    );
};

export default Home;
