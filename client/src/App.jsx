import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { Toaster } from "react-hot-toast";
import Loader from "./components/loader";
import { useSelector } from "react-redux";

function App() {
  const { loading } = useSelector((state) => state.loader.loader);
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      {loading && <Loader />}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
