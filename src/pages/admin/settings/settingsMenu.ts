import {
  BellIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClipboardIcon,
  FileIcon,
  GridIcon,
  HomeIcon,
  InfoCircleIcon,
  InfoTriangleIcon,
  UserGroupIcon,
  UserIcon,
} from '@/components/ui/icons'
import type { NavIcon } from '@/app/navigation'

type Item = { label: string; path: string; icon: NavIcon; screen: string }

/** F1 side menu, in the order of the designs. */
export const settingsMenu: { group: string; items: Item[] }[] = [
  {
    group: 'Organisation',
    items: [
      { label: 'Organisation details', path: 'organisation', icon: HomeIcon, screen: 'F1.01' },
      { label: 'Members & roles', path: 'members', icon: UserGroupIcon, screen: 'F1.02' },
      { label: 'Plan & billing', path: 'billing', icon: FileIcon, screen: 'F1.03' },
      { label: 'Data & privacy', path: 'privacy', icon: InfoCircleIcon, screen: 'F1.10' },
    ],
  },
  {
    group: 'Programmes',
    items: [
      { label: 'Programme setup', path: 'programme-setup', icon: GridIcon, screen: 'F1.04' },
      { label: 'Completion & certificates', path: 'completion', icon: CheckCircleIcon, screen: 'F1.05' },
      { label: 'Needs attention rules', path: 'attention-rules', icon: InfoTriangleIcon, screen: 'F1.06' },
      { label: 'Attendance & Zoom', path: 'attendance', icon: CalendarIcon, screen: 'F1.07' },
      { label: 'Session reports', path: 'session-reports', icon: ClipboardIcon, screen: 'F1.08' },
    ],
  },
  {
    group: 'Your account',
    items: [
      { label: 'Profile & password', path: 'profile', icon: UserIcon, screen: 'G1.04' },
      { label: 'Notifications', path: 'notifications', icon: BellIcon, screen: 'F1.09' },
    ],
  },
]
