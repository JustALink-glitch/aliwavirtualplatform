import {
  BookOpenIcon,
  CalendarIcon,
  ChartIcon,
  CheckCircleIcon,
  ClipboardIcon,
  FileIcon,
  GridIcon,
  InfoTriangleIcon,
  MailIcon,
  UserGroupIcon,
  UserIcon,
} from '@/components/ui/icons'
import type { NavIcon } from '@/app/navigation'
import type { SearchKind } from './data'

export const eventIcons: Record<string, NavIcon> = {
  attention_flags: InfoTriangleIcon,
  report_overdue: InfoTriangleIcon,
  attendance_missing: InfoTriangleIcon,
  zoom_review: UserIcon,
  participant_left: UserIcon,
  certificate_eligible: CheckCircleIcon,
  import_finished: UserGroupIcon,
  report_ready: FileIcon,
  invitation_accepted: MailIcon,
  invitation_renewal_requested: MailIcon,
  grade_saved: ChartIcon,
  session_changed: CalendarIcon,
  session_starting: CalendarIcon,
  assignment_due: ClipboardIcon,
  new_resource: BookOpenIcon,
  report_due: ClipboardIcon,
}

export const kindIcon: Record<SearchKind, NavIcon> = {
  participants: UserIcon,
  trainers: UserIcon,
  cohorts: UserGroupIcon,
  courses: BookOpenIcon,
  programmes: GridIcon,
  sessions: CalendarIcon,
  interventions: ClipboardIcon,
}
