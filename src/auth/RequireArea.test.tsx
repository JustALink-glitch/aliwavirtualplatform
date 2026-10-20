import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Role } from '@/lib/roles'
import { RequireArea } from './RequireArea'

const useAuthMock = vi.fn()
vi.mock('./useAuth', () => ({ useAuth: () => useAuthMock() }))

function signedInAs(role: Role) {
  return {
    state: {
      status: 'signed-in',
      session: {},
      me: {
        user: { id: 'u1', email: 'ada@aliwa.org' },
        membership: { id: 'm1', organisationId: 'o1', role },
        organisation: { id: 'o1', name: 'ALIWA Foundation', timeZone: 'Africa/Lagos' },
      },
    },
    signOut: vi.fn(),
  }
}

function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      { path: '/sign-in', element: <p>Sign-in page</p> },
      { path: '/signup/organisation', element: <p>Organisation step</p> },
      { path: '/admin', element: <RequireArea area="admin"><p>Admin area</p></RequireArea> },
      { path: '/participant', element: <RequireArea area="participant"><p>Participant area</p></RequireArea> },
    ],
    { initialEntries: [path] },
  )
  render(<RouterProvider router={router} />)
}

describe('RequireArea', () => {
  beforeEach(() => useAuthMock.mockReset())

  it('sends signed-out users to sign-in', async () => {
    useAuthMock.mockReturnValue({ state: { status: 'signed-out' }, signOut: vi.fn() })
    renderAt('/admin')
    expect(await screen.findByText('Sign-in page')).toBeInTheDocument()
  })

  it('lets an admin into the admin area', async () => {
    useAuthMock.mockReturnValue(signedInAs('admin'))
    renderAt('/admin')
    expect(await screen.findByText('Admin area')).toBeInTheDocument()
  })

  it('redirects a participant away from the admin area to their own', async () => {
    useAuthMock.mockReturnValue(signedInAs('participant'))
    renderAt('/admin')
    expect(await screen.findByText('Participant area')).toBeInTheDocument()
    expect(screen.queryByText('Admin area')).not.toBeInTheDocument()
  })

  it('resumes organisation set-up for an account without one (R1.03a)', async () => {
    useAuthMock.mockReturnValue({ state: { status: 'no-access', reason: 'no_organisation' }, signOut: vi.fn() })
    renderAt('/admin')
    expect(await screen.findByText('Organisation step')).toBeInTheDocument()
  })

  it('explains when access has ended', async () => {
    useAuthMock.mockReturnValue({ state: { status: 'no-access', reason: 'access_ended' }, signOut: vi.fn() })
    renderAt('/participant')
    expect(await screen.findByText('Your access has ended')).toBeInTheDocument()
  })
})
