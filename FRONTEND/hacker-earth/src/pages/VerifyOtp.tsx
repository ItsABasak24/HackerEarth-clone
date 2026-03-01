import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState("");

  const handleVerify = async () => {
    try {
      await api.post("/auth/register/verify-otp", {
        email,
        otp: Number(otp),
      });

      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-10">
      <h2>Verify OTP</h2>

      <input placeholder="Enter OTP" onChange={e => setOtp(e.target.value)} />
      <button onClick={handleVerify}>Verify</button>
    </div>
  );
};

export default VerifyOtp;
