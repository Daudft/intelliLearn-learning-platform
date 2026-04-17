import { BrowserRouter, Routes, Route } from "react-router-dom";

// Landing Page
import LandingPage from "./pages/Landing/LandingPage";

// Auth Pages
import SignIn from "./pages/Auth/SignIn";
import SignUp from "./pages/Auth/SignUp";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import VerifyEmail from "./pages/Auth/VerifyEmail";
import ResetPassword from "./pages/Auth/ResetPassword";
import LearningStylePage from "./pages/Auth/LearningStylePage";
import ExperienceLevelPage from "./pages/Auth/ExperienceLevelPage";

// Assessment Pages
import LanguageSelection from "./pages/Assessment/LanguageSelection";
import AssessmentTest from "./pages/Assessment/AssessmentTest";
import AssessmentResult from "./pages/Assessment/AssessmentResult";
import Dashboard from "./pages/Dashboard/Dashboard";

// User Pages
import ProfilePage from "./pages/Profile/ProfilePage";
import ActivityHistoryPage from "./pages/ActivityHistory/ActivityHistoryPage";

// Dashboard Pages
import ProgressDashboard from "./pages/Dashboard/ProgressDashboard";

// Learning Pages
import PathwayVisualization from "./pages/Learning/PathwayVisualization";
import TaskPage from "./pages/Learning/TaskPage";

// Admin Pages
import AdminConsole from "./pages/Admin/AdminConsole";

// Courses Page
import Courses from "./pages/courses";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Landing */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/learning-style" element={<LearningStylePage />} />
        <Route path="/experience-level" element={<ExperienceLevelPage />} />

        {/* Assessment Routes */}
        <Route path="/assessment" element={<LanguageSelection />} />
        <Route path="/assessment/test/:language" element={<AssessmentTest />} />
        <Route path="/assessment/result" element={<AssessmentResult />} />

        {/* User Routes */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/activity-history" element={<ActivityHistoryPage />} />

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/progress-dashboard" element={<ProgressDashboard />} />

        {/* Learning Routes */}
        <Route path="/learning-path" element={<PathwayVisualization />} />
        <Route path="/learning/:language/:taskId" element={<TaskPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminConsole />} />

        {/* Courses Route */}
        <Route path="/courses" element={<Courses />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
