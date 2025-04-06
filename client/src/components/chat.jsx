import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { createNewMessage } from "../apiCalls/message";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import { useState } from "react";

const ChatArea = () => {
    const dispatch = useDispatch();
    const [message, setMessage] = useState("");
    const { selectedChat, allUsers, user } = useSelector((state) => state.user);
    //console.log("selectedChat: ", selectedChat._id);
    // console.log("danh sách users: ", allUsers);
    //console.log("Thông tin user hiện tại: ", user);

    const selectedUserId = selectedChat?.members?.find((member) => member !== user?._id);
    // Tìm người dùng từ allUsers dựa trên ID
    const selectedUser = allUsers?.find((user) => user._id === selectedUserId);

    //call api create message
    const sendMessage = async () => {
        try {
            const newMessage = {
                chatId: selectedChat._id,
                sender: user._id,
                text: message
            }
            console.log("newMessage: ", newMessage);
            dispatch(showLoader());
            const response = await createNewMessage(newMessage);
            dispatch(hideLoader());

            // Check if the response is successful
            if (response?.success) {
                setMessage(""); // Reset message input
            }
        } catch (error) {
            dispatch(hideLoader());
            console.error("Error sending message:", error);
            toast.error("Lỗi khi gửi tin nhắn!", error.message);
        }
    }

    return (
        <>
            {/*Title */}
            <h2>Component Chat Area</h2>

            {/*Chat with who? */}
            <div className="">
                {selectedChat && <p>Chat với {selectedUser.firstname} {selectedUser.lastname}</p>}
            </div>

            {/* Send message */}
            <div className="">
                <input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button onClick={sendMessage}>Gửi</button>
            </div>
        </>
    )
}

export default ChatArea