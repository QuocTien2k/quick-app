import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { uploadProfilePic } from "../apiCalls/users";
import { setUser } from "../redux/usersSlice";
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "../redux/loaderSlice";

const Profile = ({ user, onClose }) => {
    const dispatch = useDispatch();
    const [image, setImage] = useState("");
    //console.log(user);
    useEffect(() => {

        if (user?.profilePic) {
            setImage(user.profilePic.url);
        }
    }, [user])

    if (!user) return <p>Đang tải thông tin người dùng...</p>;
    const formattedDate = new Date(user.createdAt).toLocaleDateString("vi-VN");

    const onFileSelect = async (e) => {
        const file = e.target.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Vui lòng chọn một tệp hình ảnh.");
            return;
        }

        const reader = new FileReader();

        reader.onloadend = async () => {
            setImage(reader.result);
        }

        reader.readAsDataURL(file);
    }

    const uploadImage = async () => {
        try {
            dispatch(showLoader())
            const response = await uploadProfilePic(image);
            dispatch(hideLoader())
            console.log(response);

            if (response.success) {
                toast.success(response.message);
                dispatch(setUser(response.data));
                onClose();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.log("Lỗi tải ảnh: ", error.message);
            toast.error(error.message)
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

                    <div className="flex justify-center gap-4 mt-4">
                        {/* Nút chọn ảnh */}
                        <label
                            htmlFor="avatarUpload"
                            className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Chọn ảnh
                        </label>

                        {/* Nút đồng ý */}
                        <button
                            onClick={uploadImage}
                            disabled={!image}
                            className={`px-4 py-2 rounded text-white transition
      ${image ? "bg-green-600 hover:bg-green-700 cursor-pointer" : "bg-gray-400 cursor-not-allowed opacity-50"}
    `}
                        >
                            Đồng ý
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default Profile;
