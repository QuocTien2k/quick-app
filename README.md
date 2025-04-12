# 💬 Realtime Chat App

Dự án ứng dụng chat realtime cá nhân được xây dựng với **ReactJS**, **Redux**, **Socket.io**, và **MongoDB**. Đây là một ứng dụng mô phỏng hệ thống nhắn tin giữa các người dùng với tính năng hiển thị online, thông báo tin nhắn chưa đọc, gửi hình ảnh và emoji.

## 🚀 Công nghệ sử dụng

- **Frontend**:  
  - [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)  
  - [Tailwind CSS](https://tailwindcss.com/)  
  - [Redux Toolkit](https://redux-toolkit.js.org/)  
  - [Socket.IO Client](https://socket.io/)  
  - [Emoji Mart](https://github.com/missive/emoji-mart)  
  - React Toastify, React Router DOM, Moment.js,...

- **Backend**:  
  - [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)  
  - [MongoDB](https://www.mongodb.com/) + Mongoose  
  - [Cloudinary](https://cloudinary.com/) (upload ảnh)  
  - [Socket.IO](https://socket.io/) (realtime communication)  
  - [JWT](https://jwt.io/) (xác thực)  
  - Nodemon, Multer, Dotenv,...

---

> Lưu ý: Cần cài đặt MongoDB và NodeJS trước khi bắt đầu.


![13](https://github.com/user-attachments/assets/a3cb7df8-b8fe-4202-872e-beb58a3ac0e3)

## ⚙️ Cài đặt & chạy ứng dụng

### Terminal 1: Khởi động Backend
cd server
npm install
npm run server
Mặc định chạy ở http://localhost:5000

# Terminal 2: Frontend
cd client
npm install
npm run dev
Mặc định chạy ở http://localhost:5173

✨ Các tính năng nổi bật
✅ Đăng nhập / Đăng ký người dùng

✅ Danh sách người dùng có thể nhắn tin

✅ Gửi / Nhận tin nhắn realtime qua socket.io

✅ Hỗ trợ gửi hình ảnh (upload Cloudinary)

✅ Emoji picker trực quan

✅ Hiển thị trạng thái người dùng online / offline

✅ Đếm số lượng tin nhắn chưa đọc

✅ Reset mật khẩu qua email (nếu quên)

# 🧑‍💻 Tác giả: 
Đỗ Quốc Tiến 🚴‍♂️ (shipper code - tốc độ code nhanh như hàng đến)
GitHub: QuocTien2k
