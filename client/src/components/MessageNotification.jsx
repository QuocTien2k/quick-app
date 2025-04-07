import { useEffect, useState } from 'react';

const MessageNotification = ({ listUsers, getUnreadMessageCount, getLastMessage, openChat }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [filteredUsers, setFilteredUsers] = useState([]);

    // Lọc những người có tin nhắn cuối cùng
    // Khởi tạo danh sách khi listUsers thay đổi
    useEffect(() => {
        const usersWithMessages = listUsers.filter(user =>
            getLastMessage(user._id, user.lastname)
        );
        setFilteredUsers(usersWithMessages);
    }, [listUsers, getLastMessage]);

    const handleClick = (selectedUserId) => {
        openChat(selectedUserId);  // Gọi hàm openChat khi click vào người dùng
        setIsDropdownOpen(false);  // Đóng dropdown sau khi chọn

        // Xoá người đã đọc khỏi danh sách filteredUsers
        setFilteredUsers(prev =>
            prev.filter(user => user._id !== selectedUserId)
        );
    };

    return (
        <div className="relative">
            {/* Notification Icon */}
            <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="cursor-pointer flex items-center gap-2"
            >
                <span className={`text-lg ${filteredUsers.some(user => getUnreadMessageCount(user._id) > 0) ? 'animate-pulse-ring' : ''}`}>
                    💬
                </span>
                {filteredUsers.some(user => getUnreadMessageCount(user._id) > 0) ? (
                    <span className="text-xs text-red-500">Tin nhắn mới</span>
                ) : (
                    <span className="text-xs text-gray-500">Không có tin nhắn mới</span>
                )}
            </div>

            {/* Dropdown List */}
            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-md max-h-60 overflow-y-scroll">
                    {filteredUsers.map((user) => (
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
