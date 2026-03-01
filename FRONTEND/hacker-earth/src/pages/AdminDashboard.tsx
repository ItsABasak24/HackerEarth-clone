import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

interface PendingProblem {
  problem_id: string;
  title: string;
  description: string;
  difficulty: string;
}

interface SubmissionDay {
  _id: string;     // date
  count: number;   // number of submissions
}

interface Insights {
  total_users: number;
  total_problems: number;
  pending_problems: number;
  total_submissions: number;
  accepted_submissions: number;
  submissions_per_day: SubmissionDay[];
}

const AdminDashboard = () => {
  const [message, setMessage] = useState("");
  const [problems, setProblems] = useState<PendingProblem[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    if (!token) {
      navigate("/admin-login");
      return;
    }
    refreshDashboard();
  }, []);

  const refreshDashboard = async () => {
    try {
      setLoading(true);

      const dashboardRes = await api.get("/admin/dashboard");
      setMessage(dashboardRes.data.msg);

      const pendingRes = await api.get("/admin/pending-problems");
      setProblems(pendingRes.data.problems);

      const insightsRes = await api.get("/admin/insights");
      setInsights(insightsRes.data);

    } catch (error) {
      navigate("/admin-login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin-login");
  };

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const handleApprove = async (problemId: string) => {
    try {
      setActionLoading(problemId);
      await api.post(`/admin/approve/${problemId}`);
      setSuccessMsg("Problem approved successfully");
      await refreshDashboard();
    } catch {
      setSuccessMsg("Failed to approve problem");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (problemId: string) => {
    try {
      setActionLoading(problemId);
      await api.post(`/admin/reject/${problemId}`);
      setSuccessMsg("Problem rejected successfully");
      await refreshDashboard();
    } catch {
      setSuccessMsg("Failed to reject problem");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-10">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* SUCCESS MESSAGE */}
      {successMsg && (
        <div className="mb-6 p-4 bg-green-600 rounded-lg flex justify-between items-center">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)}>✕</button>
        </div>
      )}

      {/* WELCOME */}
      <div className="bg-white/5 p-6 rounded-xl border border-white/10 mb-8">
        <p className="text-lg">{message}</p>
      </div>

      {/* KPI CARDS */}
      {insights && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
          <KpiCard title="Total Users" value={insights.total_users} color="bg-blue-600" />
          <KpiCard title="Total Problems" value={insights.total_problems} color="bg-purple-600" />
          <KpiCard title="Pending Problems" value={insights.pending_problems} color="bg-yellow-600" />
          <KpiCard title="Total Submissions" value={insights.total_submissions} color="bg-green-600" />
          <KpiCard title="Accepted" value={insights.accepted_submissions} color="bg-pink-600" />
        </div>
      )}

      {/* GRAPH SECTION */}
      {insights && (
        <div className="bg-white/5 p-6 rounded-xl border border-white/10 mb-12">
          <h2 className="text-xl font-semibold mb-4">
            Submissions Per Day
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={insights.submissions_per_day}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="_id" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* PENDING PROBLEMS */}
      <h2 className="text-2xl font-semibold mb-6">
        Pending Problems
      </h2>

      {loading ? (
        <p>Loading...</p>
      ) : problems.length === 0 ? (
        <p>No pending problems</p>
      ) : (
        <div className="space-y-6">
          {problems.map((problem) => (
            <div
              key={problem.problem_id}
              className="bg-white/5 p-6 rounded-xl border border-white/10"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-bold">
                  {problem.title}
                </h3>
                <span className="bg-purple-600 px-3 py-1 rounded text-sm">
                  {problem.difficulty}
                </span>
              </div>

              <p className="text-gray-300 mb-4">
                {problem.description}
              </p>

              <div className="flex gap-4">
                <button
                  disabled={actionLoading === problem.problem_id}
                  onClick={() => handleApprove(problem.problem_id)}
                  className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
                >
                  Approve
                </button>

                <button
                  disabled={actionLoading === problem.problem_id}
                  onClick={() => handleReject(problem.problem_id)}
                  className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const KpiCard = ({ title, value, color }: any) => (
  <div className={`${color} p-6 rounded-xl text-center`}>
    <p className="text-sm">{title}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default AdminDashboard;