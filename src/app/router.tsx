import { createBrowserRouter, Navigate, type RouteObject } from 'react-router'
import { RequireArea } from '@/auth/RequireArea'
import { AppShell } from '@/components/shell/AppShell'
import { StatePanel } from '@/components/StatePanel'
import type { Area } from '@/lib/roles'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
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
  areaRoutes('admin'),
  areaRoutes('trainer'),
  areaRoutes('participant'),
  { path: '*', element: <StatePanel kind="no-results" title="Page not found" description="Check the address, or go back." /> },
]

export const router = createBrowserRouter(routes)
