import { Routes, Route } from "react-router-dom";
import CodeEditorPage from "./pages/CodeEditorPage";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import AuthCallback from "./pages/AuthCallback";
import ProblemsPage from "./pages/ProblemsPage";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layout/MainLayout";
import SubmitProblem from "./pages/SubmitProblem";
function App() {
  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <Routes>

        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* ================= PROTECTED ROUTES WITH NAVBAR ================= */}
        <Route
  path="/admin-dashboard"
  element={
    <ProtectedRoute requireAdmin>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Explore />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Profile />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <MainLayout>
                <EditProfile />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
           path="/problems"
  element={
    <ProtectedRoute>
      <MainLayout>
        <ProblemsPage />
      </MainLayout>
    </ProtectedRoute>
  }
        />

      <Route
  path="/submit-problem"
  element={
    <ProtectedRoute>
      <MainLayout>
        <SubmitProblem />
      </MainLayout>
    </ProtectedRoute>
  }
/>

        <Route
          path="/developer"
          element={
            <ProtectedRoute>
              <MainLayout>
                <div className="p-10">Developer Page</div>
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
  path="/problems/:id"
  element={
    <ProtectedRoute>
      <MainLayout>
        <CodeEditorPage />
      </MainLayout>
    </ProtectedRoute>
  }
/>


        <Route
          path="/discuss"
          element={
            <ProtectedRoute>
              <MainLayout>
                <div className="p-10">Discuss Page</div>
              </MainLayout>
            </ProtectedRoute>
          }
        />

      </Routes>
    </div>
  );
}

export default App;
