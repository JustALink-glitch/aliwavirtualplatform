import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import { Toaster } from 'react-hot-toast'

// Auth pages (public)
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import ForgotPassword from './pages/auth/ForgotPassword'
import SetPassword from './pages/auth/SetPassword'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import CohortsPage from './pages/admin/CohortsPage'
import CohortDetail from './pages/admin/CohortDetail'
import CoursesPage from './pages/admin/CoursesPage'
import CourseDetail from './pages/admin/CourseDetail'
import TrainersPage from './pages/admin/TrainersPage'
import StudentsPage from './pages/admin/StudentsPage'
import SettingsPage from './pages/admin/SettingsPage'
import ReportsPage from './pages/admin/ReportsPage'

// Trainer pages
import TrainerDashboard from './pages/trainer/TrainerDashboard'
import TrainerCoursePage from './pages/trainer/TrainerCoursePage'
import TrainerSessionsPage from './pages/trainer/TrainerSessionsPage'
import TrainerStudentsPage from './pages/trainer/TrainerStudentsPage'
import TrainerAssignmentsPage from './pages/trainer/TrainerAssignmentsPage'
import TrainerPerformancePage from './pages/trainer/TrainerPerformancePage'
import TrainerSettingsPage from './pages/trainer/TrainerSettingsPage'

// Student pages
import StudentDashboard from './pages/student/StudentDashboard'
import StudentCoursePage from './pages/student/StudentCoursePage'
import StudentSessionsPage from './pages/student/StudentSessionsPage'
import StudentAssignmentsPage from './pages/student/StudentAssignmentsPage'
import StudentGradesPage from './pages/student/StudentGradesPage'
import StudentSettingsPage from './pages/student/StudentSettingsPage'
import StudentHelpPage from './pages/student/StudentHelpPage'

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ── Public routes ── */}
          <Route path="/login" element={<Login portalType="admin" />} />
          <Route path="/login/trainer" element={<Login portalType="trainer" />} />
          <Route path="/login/student" element={<Login portalType="student" />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/set-password" element={<SetPassword />} />

          {/* ── Admin routes ── */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/cohorts" element={
            <ProtectedRoute allowedRoles={['admin']}><CohortsPage /></ProtectedRoute>
          } />
          <Route path="/admin/cohorts/:id" element={
            <ProtectedRoute allowedRoles={['admin']}><CohortDetail /></ProtectedRoute>
          } />
          <Route path="/admin/courses" element={
            <ProtectedRoute allowedRoles={['admin']}><CoursesPage /></ProtectedRoute>
          } />
          <Route path="/admin/courses/:id" element={
            <ProtectedRoute allowedRoles={['admin']}><CourseDetail /></ProtectedRoute>
          } />
          <Route path="/admin/trainers" element={
            <ProtectedRoute allowedRoles={['admin']}><TrainersPage /></ProtectedRoute>
          } />
          <Route path="/admin/students" element={
            <ProtectedRoute allowedRoles={['admin']}><StudentsPage /></ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute allowedRoles={['admin']}><SettingsPage /></ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute allowedRoles={['admin']}><ReportsPage /></ProtectedRoute>
          } />

          {/* ── Trainer routes ── */}
          <Route path="/trainer/dashboard" element={
            <ProtectedRoute allowedRoles={['trainer']}><TrainerDashboard /></ProtectedRoute>
          } />
          <Route path="/trainer/course" element={
            <ProtectedRoute allowedRoles={['trainer']}><TrainerCoursePage /></ProtectedRoute>
          } />
          <Route path="/trainer/sessions" element={
            <ProtectedRoute allowedRoles={['trainer']}><TrainerSessionsPage /></ProtectedRoute>
          } />
          <Route path="/trainer/students" element={
            <ProtectedRoute allowedRoles={['trainer']}><TrainerStudentsPage /></ProtectedRoute>
          } />
          <Route path="/trainer/assignments" element={
            <ProtectedRoute allowedRoles={['trainer']}><TrainerAssignmentsPage /></ProtectedRoute>
          } />
          <Route path="/trainer/performance" element={
            <ProtectedRoute allowedRoles={['trainer']}><TrainerPerformancePage /></ProtectedRoute>
          } />
          <Route path="/trainer/settings" element={
            <ProtectedRoute allowedRoles={['trainer']}><TrainerSettingsPage /></ProtectedRoute>
          } />

          {/* ── Student routes ── */}
          <Route path="/student/dashboard" element={
            <ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>
          } />
          <Route path="/student/course" element={
            <ProtectedRoute allowedRoles={['student']}><StudentCoursePage /></ProtectedRoute>
          } />
          <Route path="/student/sessions" element={
            <ProtectedRoute allowedRoles={['student']}><StudentSessionsPage /></ProtectedRoute>
          } />
          <Route path="/student/assignments" element={
            <ProtectedRoute allowedRoles={['student']}><StudentAssignmentsPage /></ProtectedRoute>
          } />
          <Route path="/student/grades" element={
            <ProtectedRoute allowedRoles={['student']}><StudentGradesPage /></ProtectedRoute>
          } />
          <Route path="/student/settings" element={
            <ProtectedRoute allowedRoles={['student']}><StudentSettingsPage /></ProtectedRoute>
          } />
          <Route path="/student/help" element={
            <ProtectedRoute allowedRoles={['student']}><StudentHelpPage /></ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App