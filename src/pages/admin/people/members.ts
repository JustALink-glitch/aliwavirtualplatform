import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Role } from '@/lib/roles'

export type MemberStatus = 'invited' | 'active' | 'deactivated'

export interface Member {
  id: string
  email: string
  firstName: string
  lastName: string
  role: Role
  status: MemberStatus
  invitedAt: string | null
  joinedAt: string | null
  /** The live invitation link's expiry, if one exists. */
  invitationExpiresAt: string | null
  /** Live cohorts and courses this person teaches (trainers). */
  teaching: { cohorts: { id: string; name: string }[]; courses: { id: string; name: string }[] }
}

export interface MemberDetail extends Member {
  invitedBy: string | null
}

export interface HistoryEntry {
  action: 'member.invited' | 'member.invitation_resent' | 'member.invitation_renewed' | 'member.joined' | string
  at: string
  actor: string | null
}

export const TRAINER_ROLES: Role[] = ['trainer', 'assistant_trainer']

export const memberKeys = {
  all: ['members'] as const,
  list: (roles: Role[]) => ['members', 'list', roles.join(',')] as const,
  detail: (id: string) => ['members', 'detail', id] as const,
}

export function useMembers(roles: Role[]) {
  return useQuery({
    queryKey: memberKeys.list(roles),
    queryFn: ({ signal }) => api<{ members: Member[] }>(`/v1/members?role=${roles.join(',')}`, { signal }),
    select: (data) => data.members,
  })
}

export function useMember(id: string) {
  return useQuery({
    queryKey: memberKeys.detail(id),
    queryFn: ({ signal }) => api<{ member: MemberDetail; history: HistoryEntry[] }>(`/v1/members/${id}`, { signal }),
    retry: (count, error) => (error as { status?: number }).status !== 404 && count < 2,
  })
}

export interface InviteInput {
  email: string
  firstName: string
  lastName: string
  role: Exclude<Role, 'owner'>
}

export function useInviteMember() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: InviteInput) => api<{ member: Member; emailSent: boolean }>('/v1/members', { method: 'POST', body: input }),
    onSuccess: () => client.invalidateQueries({ queryKey: memberKeys.all }),
  })
}

export function useResendInvitation(id: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: () => api<{ member: Member; emailSent: boolean }>(`/v1/members/${id}/invitation`, { method: 'POST' }),
    onSuccess: () => client.invalidateQueries({ queryKey: memberKeys.all }),
  })
}

export function useRevokeInvitation(id: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: () => api<null>(`/v1/members/${id}/invitation`, { method: 'DELETE' }),
    onSuccess: () => {
      client.removeQueries({ queryKey: memberKeys.detail(id) })
      return client.invalidateQueries({ queryKey: memberKeys.list(TRAINER_ROLES) })
    },
  })
}

export const fullNameOf = (member: Pick<Member, 'firstName' | 'lastName'>) => `${member.firstName} ${member.lastName}`.trim()

/** The live link has passed its 72 hours. */
export const invitationExpired = (member: Pick<Member, 'status' | 'invitationExpiresAt'>, now = Date.now()) =>
  member.status === 'invited' && (!member.invitationExpiresAt || Date.parse(member.invitationExpiresAt) <= now)

export interface StaffMember extends Member {
  lastActiveAt: string | null
}

const STAFF_ROLES: Role[] = ['owner', 'admin', 'trainer', 'assistant_trainer']

/** F1.02 everyone who can sign in as staff, except people who were removed. */
export function useStaff() {
  return useQuery({
    queryKey: [...memberKeys.all, 'staff'],
    queryFn: ({ signal }) => api<{ members: StaffMember[] }>(`/v1/members?role=${STAFF_ROLES.join(',')}&status=current`, { signal }),
    select: (data) => data.members,
  })
}

export function useChangeRole() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) => api<{ member: unknown }>(`/v1/members/${id}/role`, { method: 'PATCH', body: { role } }),
    onSuccess: () => client.invalidateQueries({ queryKey: memberKeys.all }),
  })
}

export function useRemoveMember() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api<null>(`/v1/members/${id}`, { method: 'DELETE' }),
    onSuccess: () => client.invalidateQueries({ queryKey: memberKeys.all }),
  })
}

/** Resend or cancel by id, for lists where each row has its own invitation (F1.02). */
export function useInvitationAction() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'resend' | 'cancel' }) =>
      api<{ emailSent?: boolean } | null>(`/v1/members/${id}/invitation`, { method: action === 'resend' ? 'POST' : 'DELETE' }),
    onSuccess: () => client.invalidateQueries({ queryKey: memberKeys.all }),
  })
}
