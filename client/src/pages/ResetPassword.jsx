import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../apiCalls/auth";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            setMessage({ type: "error", text: "Token không hợp lệ" });
            return;
        }

        const res = await resetPassword({ token, newPassword });
        if (res?.success) {
            setMessage({ type: "success", text: res.message });
            navigate("/login");
        } else {
            setMessage({ type: "error", text: res.message || "Đã xảy ra lỗi" });
        }
    };

    return (
        <div className="max-w-md mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4 text-center">Đặt lại mật khẩu</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="password"
                    placeholder="Nhập mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
                >
                    Xác nhận
                </button>
            </form>

            {message && (
                <p
                    className={`mt-4 text-sm text-center ${message.type === "success" ? "text-green-600" : "text-red-600"
                        }`}
                >
                    {message.text}
                </p>
            )}
        </div>
    );
};

export default ResetPassword;
