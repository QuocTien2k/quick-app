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
                <span className={`text-xl ${usersWithMessages.some(user => getUnreadMessageCount(user._id) > 0) ? 'animate-pulse-ring' : ''}`}>
                    💬
                </span>
                <span className={`text-sm ${usersWithMessages.some(user => getUnreadMessageCount(user._id) > 0) ? 'text-red-500' : 'text-gray-500'}`}>
                    {usersWithMessages.some(user => getUnreadMessageCount(user._id) > 0)
                        ? 'Tin nhắn mới'
                        : 'Không có tin nhắn mới'}
                </span>
            </div>

            {/* Dropdown List */}
            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded-lg max-h-80 overflow-y-auto z-10">
                    {usersWithMessages.length === 0 ? (
                        <div className="p-4 text-sm text-gray-500 text-center">Không có cuộc trò chuyện nào</div>
                    ) : (
                        usersWithMessages.map((user) => (
                            <div
                                key={user._id}
                                className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b last:border-none"
                                onClick={() => handleClick(user._id)}
                            >
                                <div className="flex justify-between items-start">
                                    {/* Tên người gửi và tin nhắn cuối */}
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm text-gray-800">{user.lastname}</span>
                                        <span className="text-xs text-gray-500 truncate max-w-[180px]">
                                            {getLastMessage(user._id, user.lastname) || 'Chưa có tin nhắn'}
                                        </span>
                                    </div>

                                    {/* Badge số lượng chưa đọc */}
                                    {getUnreadMessageCount(user._id) > 0 && (
                                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 h-fit ml-2">
                                            {getUnreadMessageCount(user._id)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default MessageNotification;
