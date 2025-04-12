import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { loginUser } from '../apiCalls/auth';
import { toast } from 'react-hot-toast';

const Login = () => {
    const [user, setUser] = useState({
        email: '',
        password: ''
    })
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        //console.log(user);
        let response = null;
        try {
            setLoading(true);
            response = await loginUser(user);

            // console.log("Server response:", response)
            //console.log("response message:", response?.message)
            //console.log("response token:", response?.token)

            if (response?.success) {
                toast.success(response?.message);
                // Lưu token vào localStorage
                localStorage.setItem('token', response?.token);

                // Delay 600ms trước khi chuyển trang
                setTimeout(() => {
                    window.location.href = '/';
                }, 1400);

            } else {
                toast.error(response?.message);
            }
        } catch (error) {
            toast.error(response?.message || "Có lỗi xảy ra!");
            console.error("Lỗi đăng nhập ", error);
            setLoading(false);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-semibold text-center mb-6">Đăng nhập</h2>
                <form onSubmit={handleLogin}>
                    {/* Email Field */}
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={user.email}
                            onChange={(e) => setUser({ ...user, email: e.target.value })}
                            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Nhập email"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Password Field */}
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={user.password}
                            onChange={(e) => setUser({ ...user, password: e.target.value })}
                            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Nhập mật khẩu"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Login Button */}
                    <div className="mb-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full text-white py-2 rounded transition ${loading ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                                }`}
                        >
                            Đăng nhập
                        </button>
                    </div>
                </form>

                <div className="flex flex-col items-center gap-2 mt-4">
                    {/* Signup Link */}
                    <p className="text-sm text-gray-600">
                        Chưa có tài khoản?{' '}
                        <Link to="/signup" className="text-indigo-600 hover:text-indigo-700">
                            Đăng ký
                        </Link>
                    </p>

                    {/* Forgot Password Link */}
                    <p className="text-sm text-gray-600">
                        <Link to="/forgot-password" className="text-indigo-600 hover:text-indigo-700">
                            Quên mật khẩu?
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
