import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import AdminDashboard from './pages/admin/AdminDashboard'
import CohortsPage from './pages/admin/CohortsPage'
import CohortDetail from './pages/admin/CohortDetail'
import CoursesPage from './pages/admin/CoursesPage'
import CourseDetail from './pages/admin/CourseDetail'
import TrainersPage from './pages/admin/TrainersPage'
import StudentsPage from './pages/admin/StudentsPage'
import SettingsPage from './pages/admin/SettingsPage'
import ReportsPage from './pages/admin/ReportsPage'
import ForgotPassword from './pages/auth/ForgotPassword'
import SetPassword from './pages/auth/SetPassword'
import TrainerDashboard from './pages/trainer/TrainerDashboard'
import TrainerCoursePage from './pages/trainer/TrainerCoursePage'
import TrainerSessionsPage from './pages/trainer/TrainerSessionsPage'
import TrainerStudentsPage from './pages/trainer/TrainerStudentsPage'
import TrainerAssignmentsPage from './pages/trainer/TrainerAssignmentsPage'
import TrainerPerformancePage from './pages/trainer/TrainerPerformancePage'
import TrainerSettingsPage from './pages/trainer/TrainerSettingsPage'
import StudentDashboard from './pages/student/StudentDashboard'
import StudentCoursePage from './pages/student/StudentCoursePage'
import StudentSessionsPage from './pages/student/StudentSessionsPage'
import StudentAssignmentsPage from './pages/student/StudentAssignmentsPage'
import StudentGradesPage from './pages/student/StudentGradesPage'
import StudentSettingsPage from './pages/student/StudentSettingsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/cohorts" element={<CohortsPage />} />
        <Route path="/admin/cohorts/:id" element={<CohortDetail />} />
        <Route path="/admin/courses" element={<CoursesPage />} />
        <Route path="/admin/courses/:id" element={<CourseDetail />} />
        <Route path="/admin/trainers" element={<TrainersPage />} />
        <Route path="/admin/students" element={<StudentsPage />} />
        <Route path="/admin/settings" element={<SettingsPage />} />
        <Route path="/admin/reports" element={<ReportsPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/set-password" element={<SetPassword />} />
<Route path="/trainer/dashboard" element={<TrainerDashboard />} />
<Route path="/trainer/course" element={<TrainerCoursePage />} />
<Route path="/trainer/sessions" element={<TrainerSessionsPage />} />
<Route path="/trainer/students" element={<TrainerStudentsPage />} />
<Route path="/trainer/assignments" element={<TrainerAssignmentsPage />} />
<Route path="/trainer/performance" element={<TrainerPerformancePage />} />
<Route path="/trainer/settings" element={<TrainerSettingsPage />} />
<Route path="/student/dashboard" element={<StudentDashboard />} />
<Route path="/student/course" element={<StudentCoursePage />} />
<Route path="/student/sessions" element={<StudentSessionsPage />} />
<Route path="/student/assignments" element={<StudentAssignmentsPage />} />
<Route path="/student/grades" element={<StudentGradesPage />} />
<Route path="/student/settings" element={<StudentSettingsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App