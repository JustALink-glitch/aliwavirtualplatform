import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FileText,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  Settings,
  TriangleAlert,
  UserCog,
  Users,
  UsersRound,
} from 'lucide-react'
import type { Area, Role } from '@/lib/roles'

export interface NavItem {
  label: string
  /** Path relative to the area root. Empty string is the area home. */
  path: string
  icon: LucideIcon
  /** First Figma screen for this item, e.g. "O1.01". */
  screen: string
  /** Pinned to the bottom of the sidebar. */
  bottom?: boolean
  /** Roles that can't see this item. */
  hiddenFor?: Role[]
}

/** Sidebars from Development Reference V1 §04. */
export const navigation: Record<Area, NavItem[]> = {
  admin: [
    { label: 'Overview', path: '', icon: LayoutDashboard, screen: 'O1.01' },
    { label: 'Programmes', path: 'programmes', icon: FolderKanban, screen: 'A1' },
    { label: 'Cohorts', path: 'cohorts', icon: UsersRound, screen: 'A3' },
    { label: 'Participants', path: 'participants', icon: Users, screen: 'B1' },
    { label: 'Needs attention', path: 'needs-attention', icon: TriangleAlert, screen: 'D1' },
    { label: 'Trainers', path: 'trainers', icon: UserCog, screen: 'B2' },
    { label: 'Courses & sessions', path: 'courses', icon: BookOpen, screen: 'A2 · C1' },
    { label: 'Reports', path: 'reports', icon: FileText, screen: 'E1' },
    { label: 'Settings', path: 'settings', icon: Settings, screen: 'F1', bottom: true },
  ],
  trainer: [
    { label: 'Dashboard', path: '', icon: LayoutDashboard, screen: 'T2.01' },
    { label: 'My cohorts', path: 'cohorts', icon: UsersRound, screen: 'T3.04' },
    { label: 'Grade assignments', path: 'grading', icon: ClipboardCheck, screen: 'T6.01' },
    { label: 'My sessions', path: 'sessions', icon: CalendarDays, screen: 'T3.01' },
    { label: 'My participants', path: 'participants', icon: Users, screen: 'T7.01' },
    // Hidden for assistants by default; the org setting (F1.04) can switch it on later.
    { label: 'Session reports', path: 'reports', icon: FileText, screen: 'T5.03', hiddenFor: ['assistant_trainer'] },
    { label: 'Settings', path: 'settings', icon: Settings, screen: 'T9.01', bottom: true },
  ],
  participant: [
    { label: 'Dashboard', path: '', icon: LayoutDashboard, screen: 'P2.01' },
    { label: 'My courses', path: 'courses', icon: BookOpen, screen: 'P3.01' },
    { label: 'Sessions', path: 'sessions', icon: CalendarDays, screen: 'P4.01' },
    { label: 'Assignments', path: 'assignments', icon: ClipboardCheck, screen: 'P5.01' },
    { label: 'Grades & feedback', path: 'grades', icon: GraduationCap, screen: 'P6.01' },
    { label: 'Settings', path: 'settings', icon: Settings, screen: 'P8.01', bottom: true },
  ],
}

export function navFor(area: Area, role: Role): NavItem[] {
  return navigation[area].filter((item) => !item.hiddenFor?.includes(role))
}
