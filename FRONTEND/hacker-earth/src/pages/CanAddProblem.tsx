import { useEffect, useState } from "react";
import api from "../services/api";

const Problems = () => {
  const [canAdd, setCanAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkEligibility();
  }, []);

  const checkEligibility = async () => {
    try {
      const res = await api.get("/can-add-problem");
      setCanAdd(res.data.allowed);
    } catch (error) {
      console.error("Eligibility check failed", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Problems</h2>

      {canAdd && (
        <button onClick={() => window.location.href = "/submit-problem"}>
          Request New Problem
        </button>
      )}
    </div>
  );
};

export default Problems;