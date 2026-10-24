import { createBrowserRouter, Navigate, type RouteObject } from 'react-router'
import { RequireArea } from '@/auth/RequireArea'
import { AppShell } from '@/components/shell/AppShell'
import { StatePanel } from '@/components/StatePanel'
import { AdminAssignmentsPage } from '@/pages/assignments/AdminAssignmentsPage'
import { AssignmentFormPage } from '@/pages/assignments/AssignmentFormPage'
import { AssignmentPage } from '@/pages/assignments/AssignmentPage'
import { GradeScalesPage } from '@/pages/assignments/GradeScalesPage'
import { SubmissionPage } from '@/pages/assignments/SubmissionPage'
import { TrainerAssignmentsPage } from '@/pages/assignments/TrainerAssignmentsPage'
import { AdminCertificatePage } from '@/pages/admin/completion/CertificatePage'
import { CertificatesPage } from '@/pages/admin/completion/CertificatesPage'
import { OutcomesPage } from '@/pages/admin/completion/OutcomesPage'
import { AttentionRulesPage } from '@/pages/admin/settings/AttentionRulesPage'
import { CompletionSettingsPage } from '@/pages/admin/settings/CompletionSettingsPage'
import { SettingsComingSoon, SettingsLayout } from '@/pages/admin/settings/SettingsLayout'
import { settingsMenu } from '@/pages/admin/settings/settingsMenu'
import { MyCertificatePage, ProgressPage } from '@/pages/participant/ProgressPage'
import { InterventionsPage, NeedsAttentionPage } from '@/pages/admin/attention/NeedsAttentionPage'
import { SessionFeedbackPage } from '@/pages/feedback/SessionFeedbackPage'
import { MyParticipantsPage, TrainerParticipantPage } from '@/pages/trainer/MyParticipantsPage'
import { DashboardPage } from '@/pages/participant/DashboardPage'
import { FeedbackPage, GradesPage } from '@/pages/participant/GradesPage'
import { CoursePage, MyCoursesPage } from '@/pages/participant/MyCoursesPage'
import { MySessionPage, MySessionsPage } from '@/pages/participant/MySessionsPage'
import { SettingsPage } from '@/pages/participant/SettingsPage'
import { MyAssignmentPage } from '@/pages/participant/MyAssignmentPage'
import { MyAssignmentsPage } from '@/pages/participant/MyAssignmentsPage'
import type { Area } from '@/lib/roles'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { ParticipantsPage } from '@/pages/admin/people/ParticipantsPage'
import { ImportParticipantsPage } from '@/pages/admin/participants/ImportParticipantsPage'
import { ParticipantDetailPage } from '@/pages/admin/participants/ParticipantDetailPage'
import { CohortCourses, CohortLayout, CohortOverview, CohortParticipants, CohortSessions, CohortTrainers } from '@/pages/admin/programmes/CohortDetailPage'
import { EditCohortPage, NewCohortPage } from '@/pages/admin/programmes/CohortFormPage'
import { CohortsPage } from '@/pages/admin/programmes/CohortsPage'
import { CoursesPage } from '@/pages/admin/programmes/CoursesPage'
import { AttendanceHistoryPage } from '@/pages/admin/sessions/AttendanceHistoryPage'
import { AttendancePage } from '@/pages/admin/sessions/AttendancePage'
import { EditSessionPage } from '@/pages/admin/sessions/EditSessionPage'
import { ScheduleSessionPage } from '@/pages/admin/sessions/ScheduleSessionPage'
import { SessionDetailPage } from '@/pages/admin/sessions/SessionDetailPage'
import { SessionsPage } from '@/pages/admin/sessions/SessionsPage'
import { NewCoursePage } from '@/pages/admin/programmes/NewCoursePage'
import { ProgrammeDetailPage } from '@/pages/admin/programmes/ProgrammeDetailPage'
import { EditProgrammePage, NewProgrammePage } from '@/pages/admin/programmes/ProgrammeFormPage'
import { ProgrammesPage } from '@/pages/admin/programmes/ProgrammesPage'
import { TrainerDetailPage } from '@/pages/admin/people/TrainerDetailPage'
import { TrainersPage } from '@/pages/admin/people/TrainersPage'
import { ForgotPasswordPage } from '@/pages/onboarding/ForgotPasswordPage'
import { InvitationPage } from '@/pages/onboarding/InvitationPage'
import { OrganisationPage } from '@/pages/onboarding/OrganisationPage'
import { ResetPasswordPage } from '@/pages/onboarding/ResetPasswordPage'
import { SignUpPage } from '@/pages/onboarding/SignUpPage'
import { WorkspaceReadyPage } from '@/pages/onboarding/WorkspaceReadyPage'
import { SignInPage } from '@/pages/SignInPage'
import { navigation } from './navigation'

/** Screens that are built; everything else in the sidebar shows a placeholder. */
const built: Partial<Record<Area, RouteObject[]>> = {
  admin: [
    { path: 'needs-attention', element: <NeedsAttentionPage /> },
    { path: 'needs-attention/interventions', element: <InterventionsPage /> },
    { path: 'trainers', element: <TrainersPage /> },
    { path: 'trainers/:id', element: <TrainerDetailPage /> },
    { path: 'participants', element: <ParticipantsPage /> },
    { path: 'participants/import', element: <ImportParticipantsPage /> },
    { path: 'participants/certificates', element: <CertificatesPage /> },
    { path: 'participants/certificates/:id', element: <AdminCertificatePage /> },
    { path: 'participants/outcomes', element: <OutcomesPage /> },
    { path: 'participants/:id', element: <ParticipantDetailPage /> },
    { path: 'programmes', element: <ProgrammesPage /> },
    { path: 'programmes/new', element: <NewProgrammePage /> },
    { path: 'programmes/:id', element: <ProgrammeDetailPage /> },
    { path: 'programmes/:id/edit', element: <EditProgrammePage /> },
    { path: 'courses', element: <SessionsPage /> },
    { path: 'courses/library', element: <CoursesPage /> },
    { path: 'courses/sessions/new', element: <ScheduleSessionPage /> },
    { path: 'courses/sessions/:id', element: <SessionDetailPage /> },
    { path: 'courses/sessions/:id/edit', element: <EditSessionPage /> },
    { path: 'courses/sessions/:id/attendance', element: <AttendancePage /> },
    { path: 'courses/sessions/:id/attendance/history', element: <AttendanceHistoryPage /> },
    { path: 'courses/sessions/:id/feedback', element: <SessionFeedbackPage area="admin" /> },
    { path: 'courses/new', element: <NewCoursePage /> },
    { path: 'courses/assignments', element: <AdminAssignmentsPage /> },
    { path: 'courses/assignments/grading-scales', element: <GradeScalesPage /> },
    { path: 'courses/assignments/:id', element: <AssignmentPage area="admin" /> },
    { path: 'courses/assignments/:id/submissions/:memberId', element: <SubmissionPage area="admin" /> },
    { path: 'cohorts', element: <CohortsPage /> },
    { path: 'cohorts/new', element: <NewCohortPage /> },
    { path: 'cohorts/:id/edit', element: <EditCohortPage /> },
    {
      path: 'cohorts/:id',
      element: <CohortLayout />,
      children: [
        { index: true, element: <CohortOverview /> },
        { path: 'participants', element: <CohortParticipants /> },
        { path: 'sessions', element: <CohortSessions /> },
        { path: 'courses', element: <CohortCourses /> },
        { path: 'trainers', element: <CohortTrainers /> },
      ],
    },
    {
      path: 'settings',
      element: <SettingsLayout />,
      children: [
        { index: true, element: <Navigate to="completion" replace /> },
        { path: 'completion', element: <CompletionSettingsPage /> },
        { path: 'attention-rules', element: <AttentionRulesPage /> },
        ...settingsMenu
          .flatMap((s) => s.items)
          .filter((i) => i.path !== 'completion' && i.path !== 'attention-rules')
          .map((i) => ({ path: i.path, element: <SettingsComingSoon path={i.path} /> })),
      ],
    },
  ],
  trainer: [
    { path: 'grading', element: <TrainerAssignmentsPage /> },
    { path: 'grading/new', element: <AssignmentFormPage mode="new" /> },
    { path: 'grading/:id', element: <AssignmentPage area="trainer" /> },
    { path: 'grading/:id/edit', element: <AssignmentFormPage mode="edit" /> },
    { path: 'grading/:id/submissions/:memberId', element: <SubmissionPage area="trainer" /> },
    { path: 'sessions/:id/feedback', element: <SessionFeedbackPage area="trainer" /> },
    { path: 'participants', element: <MyParticipantsPage /> },
    { path: 'participants/:id', element: <TrainerParticipantPage /> },
  ],
  participant: [
    { index: true, element: <DashboardPage /> },
    { path: 'courses', element: <MyCoursesPage /> },
    { path: 'courses/:id', element: <CoursePage /> },
    { path: 'sessions', element: <MySessionsPage /> },
    { path: 'sessions/:id', element: <MySessionPage /> },
    { path: 'settings', element: <SettingsPage /> },
    { path: 'assignments', element: <MyAssignmentsPage /> },
    { path: 'assignments/:id', element: <MyAssignmentPage /> },
    { path: 'grades', element: <GradesPage /> },
    { path: 'grades/progress', element: <ProgressPage /> },
    { path: 'grades/certificate', element: <MyCertificatePage /> },
    { path: 'grades/:id', element: <FeedbackPage /> },
    // The link in the certificate email.
    { path: 'certificate', element: <Navigate to="/participant/grades/certificate" replace /> },
  ],
}

function areaRoutes(area: Area): RouteObject {
  const ready = built[area] ?? []
  return {
    path: `/${area}`,
    element: (
      <RequireArea area={area}>
        <AppShell area={area} />
      </RequireArea>
    ),
    children: [
      ...ready,
      ...navigation[area]
        .filter((item) => !ready.some((route) => route.path === item.path || (item.path === '' && route.index)))
        .map((item) => ({
          ...(item.path ? { path: item.path } : { index: true }),
          element: <PlaceholderPage title={item.label} screen={item.screen} />,
        })),
    ],
  }
}

export const routes: RouteObject[] = [
  { path: '/', element: <Navigate to="/sign-in" replace /> },
  { path: '/sign-in', element: <SignInPage /> },
  // Admin sign-up (R1)
  { path: '/signup', element: <SignUpPage /> },
  { path: '/signup/organisation', element: <OrganisationPage /> },
  { path: '/signup/ready', element: <WorkspaceReadyPage /> },
  // Account recovery, all roles (S1)
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  // Staff and participant invitations (T1 / P1)
  { path: '/invite/:token', element: <InvitationPage /> },
  areaRoutes('admin'),
  areaRoutes('trainer'),
  areaRoutes('participant'),
  { path: '*', element: <StatePanel kind="no-results" title="Page not found" description="Check the address, or go back." /> },
]

export const router = createBrowserRouter(routes)
