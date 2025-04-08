import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { createNewMessage, getAllMessages } from "../apiCalls/message";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import { useEffect, useRef, useState } from "react";
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { clearUnreadMessageCount } from "../apiCalls/chat";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { setAllChats } from "../redux/usersSlice";
import moment from "moment";

const ChatArea = ({ socket }) => {
    const dispatch = useDispatch();
    const [message, setMessage] = useState("");
    const [allMessages, setAllMessages] = useState([]);
    const { selectedChat, allUsers, user, allChats } = useSelector((state) => state.user);
    const messagesEndRef = useRef(null);

    //console.log("selectedChat: ", selectedChat.members);
    //console.log("danh sách users: ", allUsers);
    //console.log("Thông tin user hiện tại: ", user);

    const selectedUserId = selectedChat?.members?.find((member) => member._id !== user._id)?._id;
    //console.log("ID người dùng được chọn: ", selectedUserId);

    // Search user from allUsers on ID
    const selectedUser = allUsers.find((user) => user._id === selectedUserId);
    //console.log("Người dùng được chọn: ", selectedUser);

    //call api create message
    const sendMessage = async () => {
        try {
            const newMessage = {
                chatId: selectedChat._id,
                sender: user._id,
                text: message
            }
            //console.log("newMessage: ", newMessage);

            const response = await createNewMessage(newMessage);

            // Check if the response is successful
            if (response?.success) {
                setMessage(""); // Reset message input

                socket.emit("send-message", {
                    ...newMessage,
                    members: selectedChat.members.map(m => m._id),
                    read: false,
                    createdAt: moment().format("DD-MM-YYYY hh:mm:ss")
                })
            }
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Lỗi khi gửi tin nhắn!", error.message);
        }
    }

    //call api get all messages
    const getMessages = async () => {
        try {
            dispatch(showLoader());
            const response = await getAllMessages(selectedChat._id);
            dispatch(hideLoader());

            if (response?.success) {
                setAllMessages(response.data); // Set all messages to state
            }
            //console.log("Tất cả tin nhắn: ", response.data);
        } catch (error) {
            dispatch(hideLoader());
            console.error("Lỗi lấy tin nhắn: ", error);
            toast.error(error.message || "Lỗi lấy tin nhắn")
        }
    }

    //call api clear unread messages
    const clearUnreadMessages = async () => {
        try {
            dispatch(showLoader());
            const response = await clearUnreadMessageCount(selectedChat._id);
            dispatch(hideLoader());

            if (response?.success) {
                const updatedChats = allChats.map(chat => {
                    if (chat._id === selectedChat._id) {
                        return response.data;
                    }
                    return chat;
                });
                dispatch(setAllChats(updatedChats))
            }
            //console.log("Tất cả tin nhắn: ", response.data);
        } catch (error) {
            dispatch(hideLoader());
            console.error("Lỗi xóa tin nhắn: ", error);
            toast.error(error.message || "Lỗi xóa tin nhắn")
        }
    }

    //theo dõi để cuộn
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [allMessages]);

    //theo dõi nhận tin
    useEffect(() => {
        if (selectedChat?._id) {
            getMessages(); // Gọi API chỉ khi selectedChat thay đổi
        }
        if (selectedChat?.lastMessage?.sender !== user._id) {
            clearUnreadMessages();
        }

        //tín hiệu nhận tin từ socket server
        socket.on("receive-message", (data) => {
            //console.log(data);
            const selectChat = selectedChat;
            //console.log(selectChat);
            if (selectChat._id === data.chatId) {
                setAllMessages(prevmsg => [...prevmsg, data]); //
            }
        })

    }, [selectedChat]);

    //console.log("Tất cả tin nhắn: ", allMessages);
    //console.log("Danh sách tin nhắn: ", allChats)

    return (
        <>
            {/* Title */}
            <h2 className="text-xl font-semibold my-2">Component Chat Area</h2>

            {/* Chat with who? */}
            <div className="w-full mx-auto mb-2 text-gray-700 text-center text-2xl">
                {selectedChat && (
                    <p>💬 Chat với <span className="font-medium">{selectedUser.firstname} {selectedUser.lastname}</span></p>
                )}
            </div>

            {/* Chat messages */}
            <div className="h-96 overflow-y-scroll p-4 space-y-2 bg-gray-50 border rounded shadow-inner scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                {allMessages?.map((message) => {
                    const senderId = typeof message.sender === "object" ? message.sender._id : message.sender;
                    const isSender = senderId === user._id;

                    return (
                        <div
                            key={message._id}
                            className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-xs md:max-w-sm p-3 rounded-lg shadow-sm
                        ${isSender ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
                            >
                                <p className="break-words">{message.text}</p>
                                <span className={`text-xs block mt-1 ${isSender ? 'text-right' : 'text-left'} opacity-70`}>
                                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {isSender && message.read && (
                                        <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-sm ml-1" />
                                    )}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} /> {/* Điểm đánh dấu để scroll tới */}
            </div>

            {/* Send message */}
            <div className="mt-4 flex gap-2">
                <input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && message.trim()) {
                            sendMessage();
                        }
                    }}
                    className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                />
                <button
                    onClick={sendMessage}
                    disabled={message.trim() === ""}
                    className={`px-4 py-2 rounded transition 
                    ${message.trim() === ""
                            ? "bg-gray-300 cursor-not-allowed text-white"
                            : "bg-blue-500 hover:bg-blue-600 text-white"
                        }`}
                >
                    <PaperAirplaneIcon className="h-5 w-5 rotate-[-30deg]" />
                </button>

            </div>

        </>
    )
}

export default ChatArea