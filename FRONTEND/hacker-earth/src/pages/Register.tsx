import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

declare global {
  interface Window {
    google: any;
  }
}

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [showOtpField, setShowOtpField] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /* ================= OTP REGISTER FLOW ================= */

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await api.post("/auth/register/request-otp", form);
      setSuccessMessage("OTP sent to mail");
      setShowOtpField(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const res = await api.post("/auth/register/verify-otp", {
        email: form.email,
        otp: otp,
      });

      setSuccessMessage("Account created successfully");

      // If backend returns JWT
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        navigate("/");
      } else {
        setTimeout(() => navigate("/login"), 1500);
      }

    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ================= GOOGLE LOGIN FLOW ================= */

  useEffect(() => {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
      auto_select: false,
    });
    console.log("CLIENT ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);


    window.google.accounts.id.renderButton(
      document.getElementById("googleBtn"),
      {
        theme: "outline",
        size: "large",
        width: 350,
        text: "continue_with",
      }
    );
  }, []);

  const handleGoogleResponse = async (response: any) => {
    try {
      const res = await api.post("/api/v1/auth/google/auth", {
        id_token: response.credential,
      });

      // Save JWT from backend
      localStorage.setItem("token", res.data.token);

      navigate("/");
    } catch (err: any) {
      console.error(err);
      setError("Google login failed");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050816] text-white">
      <form
        onSubmit={handleRegister}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 w-[420px] shadow-[0_0_40px_rgba(34,211,238,0.15)]"
      >
        <h2 className="text-3xl font-bold text-center mb-2">
          Create Account
        </h2>

        <p className="text-gray-400 text-center mb-6">
          Start your coding journey today
        </p>

        {/* Name */}
        <div className="mb-4">
          <label className="text-gray-400 text-sm">Name</label>
          <input
            required
            className="w-full mt-2 p-3 rounded-lg bg-white/10 border border-white/10 focus:border-cyan-400 outline-none"
            placeholder="John Doe"
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="text-gray-400 text-sm">Email</label>
          <input
            type="email"
            required
            className="w-full mt-2 p-3 rounded-lg bg-white/10 border border-white/10 focus:border-cyan-400 outline-none"
            placeholder="you@example.com"
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
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
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />
        </div>

        {/* OTP Field */}
        {showOtpField && (
          <div className="mb-6 flex gap-2">
            <input
              type="text"
              placeholder="Enter OTP"
              className="flex-1 p-3 rounded-lg bg-white/10 border border-white/10 focus:border-cyan-400 outline-none"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button
              type="button"
              onClick={handleVerifyOtp}
              className="px-4 rounded-lg bg-green-500 hover:bg-green-600 transition"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        )}

        {successMessage && (
          <p className="text-green-400 text-sm mb-4">
            {successMessage}
          </p>
        )}

        {error && (
          <p className="text-red-400 text-sm mb-4">
            {error}
          </p>
        )}

        {!showOtpField && (
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-black
            bg-gradient-to-r from-cyan-400 to-blue-500
            hover:scale-105 transition-all duration-300
            hover:shadow-[0_0_25px_rgba(34,211,238,0.6)]
            disabled:opacity-50"
          >
            {loading ? "Sending OTP..." : "Register"}
          </button>
        )}

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-white/10"></div>
          <span className="px-3 text-gray-400 text-sm">OR</span>
          <div className="flex-grow h-px bg-white/10"></div>
        </div>

        {/* Google Button */}
        <div id="googleBtn" className="flex justify-center"></div>

        <p className="text-center text-gray-400 mt-6 text-sm">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-cyan-400 cursor-pointer hover:underline"
          >
            Sign in
          </span>
        </p>
      </form>
    </div>
  );
};

export default Register;
