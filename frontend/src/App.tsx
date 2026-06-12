import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import MyCoursesPage from './pages/MyCoursesPage';
import QuizCenterPage from './pages/QuizCenterPage';
import QuizPlayPage from './pages/QuizPlayPage';
import QuizReviewPage from './pages/QuizReviewPage';
import SettingsPage from './pages/SettingsPage';



function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/courses" element={<MyCoursesPage />} />
          <Route path="/employee/quiz" element={<QuizCenterPage />} />
          <Route path="/employee/quiz/play" element={<QuizPlayPage />} />
          <Route path="/employee/quiz/review" element={<QuizReviewPage />} />
          <Route path="/employee/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/register" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;