import { useState } from "react";
import { forgotPassword } from "../apiCalls/auth";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const res = await forgotPassword(email);
        if (res?.success) {
            setMessage({ type: "success", text: res.message });
        } else {
            setMessage({ type: "error", text: res.message || "Đã xảy ra lỗi" });
        }

        setLoading(false);
    };

    return (
        <div className="max-w-md mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4 text-center">Quên mật khẩu</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="email"
                    placeholder="Nhập email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full text-white py-2 rounded transition ${loading ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                        }`}
                >
                    {loading ? "Đang gửi..." : "Gửi yêu cầu"}
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

export default ForgotPassword;
