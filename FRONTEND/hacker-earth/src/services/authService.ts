import api from "./api";

// Register
export const registerUser = async (email: string, password: string) => {
  const res = await api.post("/auth/register", {
    email,
    password,
  });
  return res.data;
};

// Verify OTP
export const verifyOtp = async (email: string, otp: string) => {
  const res = await api.post("/auth/verify-otp", {
    email,
    otp,
  });
  return res.data;
};

// Login
export const loginUser = async (email: string, password: string) => {
  const res = await api.post("/auth/login", {
    email,
    password,
  });

  // Save JWT
  localStorage.setItem("token", res.data.access_token);

  return res.data;
};

// Get Profile
export const getProfile = async () => {
  const token = localStorage.getItem("token");

  const res = await api.get("/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
