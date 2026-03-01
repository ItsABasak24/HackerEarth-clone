import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // If user was redirected here from ProtectedRoute
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---------------- Email/Password Login ---------------- */

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", form);

      localStorage.setItem("token", res.data.token);

      // Redirect to intended page
      navigate(from, { replace: true });

    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Google Login ---------------- */

  const handleGoogleSuccess = async (credentialResponse: any) => {
    const idToken = credentialResponse?.credential;
    if (!idToken) {
      setError("Google login failed");
      return;
    }

    try {
      const res = await api.post("/api/v1/auth/google/auth", {
        id_token: idToken,
      });

      localStorage.setItem("token", res.data.token);

      // Redirect to intended page
      navigate(from, { replace: true });

    } catch (err: any) {
      setError("Google login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050816] text-white">
      <form
        onSubmit={handleLogin}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 w-[400px] shadow-[0_0_40px_rgba(34,211,238,0.2)]"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">
          Sign In
        </h2>

        {/* Email */}
        <div className="mb-4">
          <label className="text-gray-400 text-sm">Email</label>
          <input
            type="email"
            required
            className="w-full mt-2 p-3 rounded-lg bg-white/10 border border-white/10 focus:border-cyan-400 outline-none"
            placeholder="user@example.com"
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="text-gray-400 text-sm">Password</label>
          <input
            type="password"
            required
            className="w-full mt-2 p-3 rounded-lg bg-white/10 border border-white/10 focus:border-cyan-400 outline-none"
            placeholder="••••••••"
            onChange={e => setForm({ ...form, password: e.target.value })}
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm mb-4">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg font-semibold text-black
          bg-gradient-to-r from-cyan-400 to-blue-500
          hover:scale-105 transition-all duration-300
          hover:shadow-[0_0_25px_rgba(34,211,238,0.6)]
          disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-white/10"></div>
          <span className="px-3 text-gray-400 text-sm">OR</span>
          <div className="flex-grow h-px bg-white/10"></div>
        </div>

        {/* Google Login */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google login failed")}
          />
        </div>
      </form>
    </div>
  );
};

export default Login;
