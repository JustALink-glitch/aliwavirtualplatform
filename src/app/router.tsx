import { createBrowserRouter, Navigate, type RouteObject } from 'react-router'
import { RequireArea } from '@/auth/RequireArea'
import { AppShell } from '@/components/shell/AppShell'
import { StatePanel } from '@/components/StatePanel'
import type { Area } from '@/lib/roles'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { ForgotPasswordPage } from '@/pages/onboarding/ForgotPasswordPage'
import { InvitationPage } from '@/pages/onboarding/InvitationPage'
import { OrganisationPage } from '@/pages/onboarding/OrganisationPage'
import { ResetPasswordPage } from '@/pages/onboarding/ResetPasswordPage'
import { SignUpPage } from '@/pages/onboarding/SignUpPage'
import { WorkspaceReadyPage } from '@/pages/onboarding/WorkspaceReadyPage'
import { SignInPage } from '@/pages/SignInPage'
import { navigation } from './navigation'

function areaRoutes(area: Area): RouteObject {
  return {
    path: `/${area}`,
    element: (
      <RequireArea area={area}>
        <AppShell area={area} />
      </RequireArea>
    ),
    children: navigation[area].map((item) => ({
      ...(item.path ? { path: item.path } : { index: true }),
      element: <PlaceholderPage title={item.label} screen={item.screen} />,
    })),
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
