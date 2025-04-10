import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { createNewMessage, getAllMessages, sendImageMessage } from "../apiCalls/message";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import { useEffect, useRef, useState } from "react";
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { clearUnreadMessageCount } from "../apiCalls/chat";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faFaceSmile, faImage, faTimes } from '@fortawesome/free-solid-svg-icons'
import { setAllChats, setSelectedChat } from "../redux/usersSlice";
import moment from "moment";
import EmojiPicker from "emoji-picker-react";

const ChatArea = ({ socket, onlineUser }) => {
    const dispatch = useDispatch();
    const [message, setMessage] = useState("");
    const [allMessages, setAllMessages] = useState([]);
    const { selectedChat, allUsers, user, allChats } = useSelector((state) => state.user);
    const messagesEndRef = useRef(null);
    const [showEmoji, setShowEmoji] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);


    //console.log("selectedChat: ", selectedChat.members);
    //console.log("danh sách users: ", allUsers);
    //console.log("Thông tin user hiện tại: ", user);

    const selectedUserId = selectedChat?.members?.find((member) => member._id !== user._id)?._id;
    //console.log("ID người dùng được chọn: ", selectedUserId);

    // Search user from allUsers on ID
    const selectedUser = allUsers.find((user) => user._id === selectedUserId);
    // console.log("Người dùng được chọn: ", selectedUser);
    // console.log("Danh sách user online: ", onlineUser);


    //call api create message
    const sendMessage = async () => {
        if (!message.trim() && !selectedImage) return;

        try {
            let response;

            if (selectedImage && !message.trim()) {
                // Gửi ảnh: gọi API ảnh
                const newImageMessage = {
                    chatId: selectedChat._id,
                    image: selectedImage,
                };
                response = await sendImageMessage(newImageMessage);
            } else {
                // Gửi text (hoặc text + ảnh, nếu bạn định gộp về sau)
                const newTextMessage = {
                    chatId: selectedChat._id,
                    sender: user._id, // Nếu backend dùng protect, có thể bỏ dòng này
                    text: message,
                };
                response = await createNewMessage(newTextMessage);
            }

            if (response?.success) {
                setMessage("");
                setSelectedImage(null);

                socket.emit("send-message", {
                    chatId: selectedChat._id,
                    text: message,
                    image: selectedImage,
                    sender: user._id,
                    members: selectedChat.members.map((m) => m._id),
                    read: false,
                    createdAt: moment().format("DD-MM-YYYY hh:mm:ss"),
                });
            }
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Lỗi khi gửi tin nhắn!", error.message);
        }
    };

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

    //handle select image
    const sendImage = async (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onloadend = async () => {
            setSelectedImage(reader.result);
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
                                <div className="space-y-2">
                                    {/* Nếu có text */}
                                    {message.text && (
                                        <p className="break-words text-sm text-gray-800">
                                            {message.text}
                                        </p>
                                    )}

                                    {/* Nếu có ảnh */}
                                    {message.image && (
                                        <div className="max-w-xs">
                                            <img
                                                src={message.image}
                                                alt="sent"
                                                className="rounded-lg shadow-md object-cover"
                                            />
                                        </div>
                                    )}
                                </div>
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
            {/* Emoji Picker popover */}
            {showEmoji && (
                <div className="absolute bottom-16 right-4 z-50">
                    <div className="shadow-lg border rounded-md overflow-hidden">
                        <EmojiPicker
                            height={300}
                            width={280}
                            onEmojiClick={(e) => {
                                setMessage((prev) => prev + e.emoji);
                                setShowEmoji(false); // tự ẩn sau khi chọn
                            }}
                        />
                    </div>
                </div>
            )}
            <div className="mt-1 flex items-center gap-2 relative">
                <textarea
                    rows={1}
                    placeholder="Nhập tin nhắn..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey && message.trim()) {
                            e.preventDefault(); // chặn xuống dòng nếu chỉ nhấn Enter
                            sendMessage();
                        }
                    }}
                    className="flex-1 resize-none border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:border-blue-300 overflow-hidden"
                />

                {/* Hidden input file */}
                <input
                    type="file"
                    id="selectImage"
                    accept="image/jpg, image/png, image/jpeg, image/gif, image/webp"
                    className="hidden"
                    onChange={sendImage}
                />

                {/* Icon chọn ảnh */}
                <label
                    htmlFor="selectImage"
                    className="h-10 w-10 flex items-center justify-center text-gray-600 hover:text-blue-500 transition cursor-pointer"
                    title="Chọn hình ảnh"
                >
                    <FontAwesomeIcon icon={faImage} className="text-lg" />
                </label>

                {/* Nút chọn emoji */}
                <button
                    onClick={() => setShowEmoji(!showEmoji)}
                    className="h-10 w-10 flex items-center justify-center text-gray-600 hover:text-yellow-500 transition"
                    title="Chèn emoji"
                >
                    <FontAwesomeIcon icon={faFaceSmile} className="text-lg" />
                </button>

                {/* Nút gửi tin */}
                <button
                    onClick={sendMessage}
                    disabled={message.trim() === "" && !selectedImage}
                    className={`h-10 w-10 flex items-center justify-center rounded transition
      ${message.trim() === "" && !selectedImage
                            ? "bg-gray-300 cursor-not-allowed text-white"
                            : "bg-blue-500 cursor-pointer hover:bg-blue-600 text-white"
                        }`}
                >
                    <PaperAirplaneIcon className="h-4 w-4 rotate-[-30deg]" />
                </button>
            </div>
            {/* Hiển thị ảnh đã chọn nếu có */}
            {selectedImage && (
                <div className="relative mt-2 ml-1">
                    <img
                        src={selectedImage}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded shadow"
                    />
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-1 right-1 bg-white bg-opacity-80 text-red-600 rounded-full p-1 hover:text-red-800"
                        title="Xóa ảnh"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
            )}
        </div>
    );
}

export default ChatArea