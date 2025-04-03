import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { signupUser } from "../apiCalls/auth";

const Signup = () => {
    const [user, setUser] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
    });
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        //console.log(user);

        try {
            const response = await signupUser(user); // Gọi API signup

            if (response?.success) {
                alert(response.message);
                setTimeout(() => {
                    navigate('/login');
                }, 800)
            } else {
                alert(response?.message || "Đăng ký thất bại!");
            }
        } catch (error) {
            alert(error?.message || "Có lỗi xảy ra!");
            console.error(error);
        }
    }
    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
                    <h2 className="text-2xl font-semibold text-center mb-6">Tạo tài khoản</h2>
                    <form onSubmit={handleSignup}>
                        {/* {Last Name} */}
                        <div className="mb-4">
                            <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">Họ và tên lót</label>
                            <input
                                type="text"
                                id="lastname"
                                name="lastname"
                                className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Nhập họ và tên lót ..."
                                required
                                value={user.lastname}
                                onChange={(e) => setUser({ ...user, lastname: e.target.value })}

                            />

                        </div>

                        {/* First Name */}
                        <div className="mb-4">
                            <label htmlFor="firstname" className="block text-sm font-medium text-gray-700">Tên</label>
                            <input
                                type="text"
                                id="firstname"
                                name="firstname"
                                className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Nhập tên ..."
                                required
                                value={user.firstname}
                                onChange={(e) => setUser({ ...user, firstname: e.target.value })}

                            />
                        </div>

                        {/* Email */}
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Nhập email ..."
                                required
                                value={user.email}
                                onChange={(e) => setUser({ ...user, email: e.target.value })}

                            />
                        </div>

                        {/* Password */}
                        <div className="mb-4">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Nhập mật khẩu ..."
                                required
                                value={user.password}
                                onChange={(e) => setUser({ ...user, password: e.target.value })}
                            />
                        </div>

                        {/* Button */}
                        <div className="mb-4">
                            <button type="submit" className="cursor-pointer w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50">Đăng ký</button>
                        </div>
                    </form>

                    {/* Login link */}
                    <p className="text-center text-sm text-gray-600">Bạn đã có tài khoản? <Link to="/login" className="text-indigo-600 hover:text-indigo-700">Đăng nhập</Link></p>
                </div>
            </div>
        </>
    )
}

export default Signup;