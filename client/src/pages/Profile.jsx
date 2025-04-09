import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

const Profile = ({ user, onClose }) => {
    const formattedDate = new Date(user.createdAt).toLocaleDateString("vi-VN");
    const [image, setImage] = useState("");

    useEffect(() => {
        if (user?.profilePic) {
            setImage(user.profilePic);
        }
    }, [user])

    const onFileSelect = async (e) => {
        const file = e.target.files[0];
        const reader = new FileReader(file);

        reader.readAsDataURL(file);

        reader.onloadend = async () => {
            setImage(reader.result);
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-100/30 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-md relative">
                {/* Close Icon */}
                <button
                    className="cursor-pointer absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                    onClick={onClose}
                >
                    <FontAwesomeIcon icon={faTimes} size="lg" />
                </button>

                <div className="flex justify-around items-center space-y-4">
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-600">
                        {image ? (
                            <img
                                src={image}
                                alt="User Avatar"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            user.firstname?.charAt(0).toUpperCase()
                        )}
                    </div>

                    {/* User Info */}
                    <div className="text-center space-y-2">
                        <div className="text-lg font-semibold">
                            Tên: {user.firstname} {user.lastname}
                        </div>
                        <hr />
                        <div className="text-sm text-gray-600">
                            Email: {user.email}
                            <br />
                            Tạo vào ngày: {formattedDate}
                        </div>
                    </div>

                </div>
                {/* Chọn ảnh */}
                <div className="flex justify-center">
                    {/* Hidden input file */}
                    <input
                        type="file"
                        id="avatarUpload"
                        accept="image/*"
                        className="hidden"
                        onChange={onFileSelect}
                    />

                    {/* Custom styled button */}
                    <label
                        htmlFor="avatarUpload"
                        className="cursor-pointer mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Chọn ảnh
                    </label>
                </div>

            </div>
        </div>
    );
};

export default Profile;
