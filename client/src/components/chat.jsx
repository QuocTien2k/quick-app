import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { createNewMessage, getAllMessages } from "../apiCalls/message";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import { useEffect, useRef, useState } from "react";
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { clearUnreadMessageCount } from "../apiCalls/chat";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { setAllChats, setSelectedChat } from "../redux/usersSlice";
import moment from "moment";

const ChatArea = ({ socket, onlineUser }) => {
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
    console.log("Người dùng được chọn: ", selectedUser);
    console.log("Danh sách user online: ", onlineUser);


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

            const response = await clearUnreadMessageCount(selectedChat._id);

            if (response?.success) {
                socket.emit("clear-unread-messages", {
                    chatId: selectedChat._id,
                    members: selectedChat.members.map(m => m._id)
                })

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

        //xử lý nhận tin từ socket server
        const handleReceiveMessage = (message) => {
            //console.log(message);
            if (selectedChat?._id === message.chatId) {
                setAllMessages(prevmsg => [...prevmsg, message]);
            }

            if (selectedChat?._id === message.chatId && message.sender !== user._id) {
                clearUnreadMessages();
            }
        };

        //xử lý tín hiệu xóa số lượng tin chưa đọc
        const handleMessageCountCleared = (data) => {
            //console.log(data);
            if (selectedChat?._id === data.chatId) {
                //updating unread message count in chat object
                const updatedChats = allChats.map(chat =>
                    chat._id === data.chatId ? { ...chat, unreadMessageCount: 0 } : chat
                );
                dispatch(setAllChats(updatedChats));

                //updating read property message object
                setAllMessages(prevMsgs =>
                    prevMsgs.map(msg => ({ ...msg, read: true }))
                );
            }
        };

        //tín hiệu nhận tin từ socket server
        socket.on("receive-message", handleReceiveMessage);
        socket.on("message-count-cleared", handleMessageCountCleared);

        // Cleanup listeners on unmount or selectedChat change
        return () => {
            socket.off("receive-message", handleReceiveMessage);
            socket.off("message-count-cleared", handleMessageCountCleared);
        };

    }, [selectedChat]);

    //console.log("Tất cả tin nhắn: ", allMessages);
    //console.log("Danh sách tin nhắn: ", allChats)

    return (
        <div className="fixed bottom-4 right-4 w-[320px] sm:w-[360px] h-[360px] bg-white rounded-lg shadow-lg flex flex-col p-3 z-50">
            {/* Chat với ai */}
            {selectedChat && (
                <div className="flex items-center justify-between text-white text-sm font-medium px-3 py-2 rounded-t-md bg-[#0084FF]">
                    <div className="flex items-center gap-2">
                        💬 Chat với
                        <span className="flex items-center gap-1">
                            {selectedUser.firstname} {selectedUser.lastname}
                            {onlineUser?.includes(selectedUser._id) && (
                                <span
                                    className="w-2 h-2 rounded-full bg-green-500 animate-pulse"
                                    title="Đang online"
                                ></span>
                            )}
                        </span>
                    </div>
                    <button
                        onClick={() => dispatch(setSelectedChat(null))}
                        className="text-sm text-red-500 cursor-pointer"
                    >
                        ❌
                    </button>
                </div>
            )}

            {/* Khung chat */}
            <div className="h-[50vh] overflow-y-auto p-3 bg-gray-50 border rounded shadow-inner scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 space-y-2">
                {allMessages?.map((message) => {
                    const senderId = typeof message.sender === "object" ? message.sender._id : message.sender;
                    const isSender = senderId === user._id;

                    return (
                        <div
                            key={message._id}
                            className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[75%] p-2 rounded-md text-sm shadow-sm 
                                ${isSender ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
                            >
                                <p className="break-words">{message.text}</p>
                                <span className={`text-[11px] block mt-1 ${isSender ? 'text-right' : 'text-left'} opacity-70`}>
                                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {isSender && message.read && (
                                        <FontAwesomeIcon icon={faCheckCircle} className="text-green-400 text-xs ml-1" />
                                    )}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Gửi tin nhắn */}
            <div className="mt-1 flex gap-2">
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
                    className="flex-1 border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring focus:border-blue-300"
                />
                <button
                    onClick={sendMessage}
                    disabled={message.trim() === ""}
                    className={`px-3 py-1.5 rounded transition text-sm
                        ${message.trim() === ""
                            ? "bg-gray-300 cursor-not-allowed text-white"
                            : "bg-blue-500 hover:bg-blue-600 text-white"
                        }`}
                >
                    <PaperAirplaneIcon className="h-4 w-4 rotate-[-30deg]" />
                </button>
            </div>
        </div>
    );
}

export default ChatArea