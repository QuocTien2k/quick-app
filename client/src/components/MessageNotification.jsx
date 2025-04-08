import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAllChats } from '../redux/usersSlice';

const MessageNotification = ({ listUsers, getUnreadMessageCount, getLastMessage, openChat, socket }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dispatch = useDispatch();
    const { selectedChat, allChats } = useSelector((state) => state.user);
    const selectedChatRef = useRef(selectedChat);
    const allChatsRef = useRef(allChats);
    // console.log(selectedChat);
    // console.log(allChats);

    useEffect(() => {
        selectedChatRef.current = selectedChat;
    }, [selectedChat]);

    useEffect(() => {
        allChatsRef.current = allChats;
    }, [allChats]);

    const handleClick = (selectedUserId) => {
        openChat(selectedUserId);  // Gọi hàm openChat khi click vào người dùng
        setIsDropdownOpen(false);  // Đóng dropdown sau khi chọn 
    };

    // Lọc những user có tin nhắn cuối cùng
    const usersWithMessages = listUsers.filter(user =>
        getLastMessage(user._id, user.lastname)
    );

    //lắng nghe để theo dõi tin nhăn từ server
    useEffect(() => {
        const handleMessage = (message) => {
            //console.log(message);

            const selectChat = selectedChatRef.current;
            const getAllChats = allChatsRef.current;

            if (selectChat?._id !== message.chatId) {
                const updatedChats = getAllChats.map(chat => {
                    if (chat._id === message.chatId) {
                        return {
                            ...chat,
                            unreadMessageCount: (chat?.unreadMessageCount || 0) + 1,
                            lastMessage: message
                        };
                    }
                    return chat;
                });
                dispatch(setAllChats(updatedChats));
            }
        };

        socket.on("receive-message", handleMessage);

        return () => {
            socket.off("receive-message", handleMessage);
        };
    }, []);

    return (
        <div className="relative">
            {/* Notification Icon */}
            <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="cursor-pointer flex items-center gap-2"
            >
                <span className={`text-lg ${usersWithMessages.some(user => getUnreadMessageCount(user._id) > 0) ? 'animate-pulse-ring' : ''}`}>
                    💬
                </span>
                {usersWithMessages.some(user => getUnreadMessageCount(user._id) > 0) ? (
                    <span className="text-xs text-red-500">Tin nhắn mới</span>
                ) : (
                    <span className="text-xs text-gray-500">Không có tin nhắn mới</span>
                )}
            </div>

            {/* Dropdown List */}
            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-md max-h-60 overflow-y-scroll">
                    {usersWithMessages.map((user) => (
                        <div key={user._id} className="p-2 hover:bg-gray-100">
                            <div className="cursor-pointer flex justify-between items-center" onClick={() => handleClick(user._id)}>
                                <span>{user.lastname}</span>
                                {getUnreadMessageCount(user._id) > 0 && (
                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                        <span className="text-xs">
                                            {getLastMessage(user._id, user.lastname)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MessageNotification;
