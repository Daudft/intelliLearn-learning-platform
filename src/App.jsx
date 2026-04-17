import { BrowserRouter, Routes, Route } from "react-router-dom";

// Landing Page
import LandingPage from "./pages/Landing/LandingPage";

// Auth Pages
import SignIn from "./pages/Auth/SignIn";
import SignUp from "./pages/Auth/SignUp";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import VerifyEmail from "./pages/Auth/VerifyEmail";
import ResetPassword from "./pages/Auth/ResetPassword";

// Assessment Pages
import LanguageSelection from "./pages/Assessment/LanguageSelection";
import AssessmentTest from "./pages/Assessment/AssessmentTest";
import AssessmentResult from "./pages/Assessment/AssessmentResult";

// Courses Page  ⬅️ ADD THIS
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

        {/* Assessment Routes */}
        <Route path="/assessment" element={<LanguageSelection />} />
        <Route path="/assessment/test/:language" element={<AssessmentTest />} />
        <Route path="/assessment/result" element={<AssessmentResult />} />

        {/* Courses Route  ⬅️ ADD THIS */}
        <Route path="/courses" element={<Courses />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
