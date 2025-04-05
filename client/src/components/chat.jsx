import { useSelector } from "react-redux";

const ChatArea = () => {
    const { selectedChat, allUsers, user } = useSelector((state) => state.user);

    // console.log("danh sách users: ", allUsers);
    // console.log("Thông tin user hiện tại: ", user);

    const selectedUserId = selectedChat?.members?.find((member) => member !== user?._id);
    // Tìm người dùng từ allUsers dựa trên ID
    const selectedUser = allUsers?.find((user) => user._id === selectedUserId);
    return (
        <>
            <h2>Component Chat Area</h2>
            <div className="">
                {selectedChat && <p>Chat với {selectedUser.firstname} {selectedUser.lastname}</p>}
            </div>
        </>
    )
}

export default ChatArea