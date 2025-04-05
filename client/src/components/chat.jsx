import { useSelector } from "react-redux";

const ChatArea = () => {
    const { selectedChat } = useSelector((state) => state.user);
    return (
        <>
            <h2>Component Chat Area</h2>
            <div className="">
                {selectedChat && <p>{selectedChat._id}</p>}
            </div>
        </>
    )
}

export default ChatArea