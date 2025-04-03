import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
    const [user, setUser] = useState({
        email: '',
        password: ''
    })

    const handleLogin = (e) => {
        e.preventDefault();
        // Xử lý đăng nhập ở đây
        console.log(user);
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
                        />
                    </div>

                    {/* Login Button */}
                    <div className="mb-4">
                        <button
                            type="submit"
                            className="cursor-pointer w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                        >
                            Đăng nhập
                        </button>
                    </div>
                </form>

                {/* Signup Link */}
                <p className="text-center text-sm text-gray-600">
                    Chưa có tài khoản?{' '}
                    <Link to="/signup" className="text-indigo-600 hover:text-indigo-700">
                        Đăng ký
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
