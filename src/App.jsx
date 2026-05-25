import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import { Toaster } from 'react-hot-toast'

// Auth pages (public)
const AdminLogin = lazy(() => import('./pages/auth/AdminLogin'))
const Login = lazy(() => import('./pages/auth/Login'))
const Signup = lazy(() => import('./pages/auth/Signup'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const SetPassword = lazy(() => import('./pages/auth/SetPassword'))

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const CohortsPage = lazy(() => import('./pages/admin/CohortsPage'))
const CohortDetail = lazy(() => import('./pages/admin/CohortDetail'))
const CoursesPage = lazy(() => import('./pages/admin/CoursesPage'))
const CourseDetail = lazy(() => import('./pages/admin/CourseDetail'))
const TrainersPage = lazy(() => import('./pages/admin/TrainersPage'))
const StudentsPage = lazy(() => import('./pages/admin/StudentsPage'))
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'))
const ReportsPage = lazy(() => import('./pages/admin/ReportsPage'))

// Trainer pages
const TrainerDashboard = lazy(() => import('./pages/trainer/TrainerDashboard'))
const TrainerCoursePage = lazy(() => import('./pages/trainer/TrainerCoursePage'))
const TrainerSessionsPage = lazy(() => import('./pages/trainer/TrainerSessionsPage'))
const TrainerStudentsPage = lazy(() => import('./pages/trainer/TrainerStudentsPage'))
const TrainerAssignmentsPage = lazy(() => import('./pages/trainer/TrainerAssignmentsPage'))
const TrainerSettingsPage = lazy(() => import('./pages/trainer/TrainerSettingsPage'))

// Student pages
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'))
const StudentCoursePage = lazy(() => import('./pages/student/StudentCoursePage'))
const StudentSessionsPage = lazy(() => import('./pages/student/StudentSessionsPage'))
const StudentAssignmentsPage = lazy(() => import('./pages/student/StudentAssignmentsPage'))
const StudentGradesPage = lazy(() => import('./pages/student/StudentGradesPage'))
const StudentSettingsPage = lazy(() => import('./pages/student/StudentSettingsPage'))
const StudentHelpPage = lazy(() => import('./pages/student/StudentHelpPage'))

function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-[#F8F9FC]">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2563EB]"></div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* ── Public routes ── */}
            <Route path="/login" element={<AdminLogin />} />
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
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App