import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PreMeetingCheck from './PreMeetingCheck'

// Mock global fetch for speed check
globalThis.fetch = vi.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ status: 'pong' })
  })
)

describe('PreMeetingCheck Component', () => {
  const mockSession = {
    id: 'test-session-123',
    title: 'Chemistry 101 - Live',
    date: '2026-05-19',
    time: '10:00 AM',
    duration: '1.5 hours'
  }

  const mockUser = {
    id: 'student-456',
    name: 'Test Student',
    role: 'student'
  }

  it('renders modal header and session metadata correctly', () => {
    const handleClose = vi.fn()
    const handleProceed = vi.fn()

    render(
      <PreMeetingCheck
        session={mockSession}
        currentUser={mockUser}
        onClose={handleClose}
        onProceed={handleProceed}
      />
    )

    // Check header banner
    expect(screen.getByText(/Pre-Meeting System Check/i)).toBeInTheDocument()
    expect(screen.getByText(/Chemistry 101/i)).toBeInTheDocument()

    // Check actionable advice checklist
    expect(screen.getByText(/Use a wired connection/i)).toBeInTheDocument()
    expect(screen.getByText(/Ethernet is more stable than Wi-Fi/i)).toBeInTheDocument()
  })

  it('allows clicking cancel button', () => {
    const handleClose = vi.fn()
    const handleProceed = vi.fn()

    render(
      <PreMeetingCheck
        session={mockSession}
        currentUser={mockUser}
        onClose={handleClose}
        onProceed={handleProceed}
      />
    )

    const cancelBtn = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelBtn)
    expect(handleClose).toHaveBeenCalledOnce()
  })
})
