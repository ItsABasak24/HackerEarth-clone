import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
  try {
    const res = await api.post("/admin/login", {
      username,
      password,
    });

    console.log("Admin response:", res.data);

    const token = res.data.token;   // ← IMPORTANT FIX

    if (!token) {
      setError("Token not received from server");
      return;
    }

    localStorage.setItem("adminToken", token);

    navigate("/admin-dashboard");

  } catch (err) {
    setError("Invalid admin credentials");
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-96 p-8 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-white">Admin Login</h2>

        <input
          type="text"
          placeholder="Username"
          className="w-full mb-4 p-3 rounded-lg bg-white/10 border border-white/20"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-3 rounded-lg bg-white/10 border border-white/20"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-400 mb-3">{error}</p>}

        <button
          onClick={handleLogin}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
