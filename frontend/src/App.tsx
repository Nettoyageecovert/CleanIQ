import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PreferencesProvider } from './context/PreferencesContext';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployerDashboardPage from './pages/EmployerDashboardPage';
import MyCoursesPage from './pages/MyCoursesPage';
import QuizCenterPage from './pages/QuizCenterPage';
import QuizPlayPage from './pages/QuizPlayPage';
import QuizReviewPage from './pages/QuizReviewPage';
import SettingsPage from './pages/SettingsPage';
import EmployerSettingsPage from './pages/EmployerSettingsPage';
import EmployeeAnalyticsPage from './pages/EmployeeAnalyticsPage';
import CourseManagementPage from './pages/CourseManagementPage';
import QuizCreatorPage from './pages/QuizCreatorPage';
import EmployerAnalyticsPage from './pages/EmployerAnalyticsPage';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center theme-page">
      Loading session...
    </div>
  );
}

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  const homePath = user?.role === 'employer' ? '/employer/dashboard' : '/employee/dashboard';
  const employeeFallback = user?.role === 'employer' ? '/employer/dashboard' : '/login';
  const employerFallback = user?.role === 'employee' ? '/employee/dashboard' : '/admin/login';

  return (
    <Routes>
      <Route path="/" element={<Navigate to={homePath} replace />} />
      <Route path="/register" element={user ? <Navigate to={homePath} replace /> : <RegisterPage />} />
      <Route path="/login" element={user ? <Navigate to={homePath} replace /> : <LoginPage />} />
      <Route path="/admin/login" element={user ? <Navigate to={homePath} replace /> : <AdminLoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route path="/employee/dashboard" element={user?.role === 'employee' ? <EmployeeDashboard /> : <Navigate to={employeeFallback} replace />} />
      <Route path="/employee/courses" element={user?.role === 'employee' ? <MyCoursesPage /> : <Navigate to={employeeFallback} replace />} />
      <Route path="/employee/quiz" element={user?.role === 'employee' ? <QuizCenterPage /> : <Navigate to={employeeFallback} replace />} />
      <Route path="/employee/quiz/play/:quizId" element={user?.role === 'employee' ? <QuizPlayPage /> : <Navigate to={employeeFallback} replace />} />
      <Route path="/employee/quiz/review/:attemptId" element={user?.role === 'employee' ? <QuizReviewPage /> : <Navigate to={employeeFallback} replace />} />
      <Route path="/employee/analytics" element={user?.role === 'employee' ? <EmployeeAnalyticsPage /> : <Navigate to={employeeFallback} replace />} />
      <Route path="/employee/settings" element={user?.role === 'employee' ? <SettingsPage /> : <Navigate to={employeeFallback} replace />} />

      <Route path="/employer/dashboard" element={user?.role === 'employer' ? <EmployerDashboardPage /> : <Navigate to={employerFallback} replace />} />
      <Route path="/employer/courses" element={user?.role === 'employer' ? <CourseManagementPage /> : <Navigate to={employerFallback} replace />} />
      <Route path="/employer/quiz-creator" element={user?.role === 'employer' ? <QuizCreatorPage /> : <Navigate to={employerFallback} replace />} />
      <Route path="/employer/quiz-creator/:quizId" element={user?.role === 'employer' ? <QuizCreatorPage /> : <Navigate to={employerFallback} replace />} />
      <Route path="/employer/analytics" element={user?.role === 'employer' ? <EmployerAnalyticsPage /> : <Navigate to={employerFallback} replace />} />
      <Route path="/employer/settings" element={user?.role === 'employer' ? <EmployerSettingsPage /> : <Navigate to={employerFallback} replace />} />

      <Route path="*" element={<Navigate to={homePath} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <PreferencesProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </PreferencesProvider>
    </AuthProvider>
  );
}

export default App;
