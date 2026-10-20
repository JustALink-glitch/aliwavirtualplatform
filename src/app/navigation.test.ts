import { describe, expect, it } from 'vitest'
import { areaForRole, homePath } from '@/lib/roles'
import { navFor, navigation } from './navigation'

describe('roles', () => {
  it('lands each role on its area home (§03)', () => {
    expect(homePath('owner')).toBe('/admin')
    expect(homePath('admin')).toBe('/admin')
    expect(homePath('trainer')).toBe('/trainer')
    expect(homePath('assistant_trainer')).toBe('/trainer')
    expect(homePath('participant')).toBe('/participant')
  })

  it('never puts a participant in a staff area', () => {
    expect(areaForRole('participant')).toBe('participant')
  })
})

describe('navigation', () => {
  it('hides session reports from assistant trainers by default', () => {
    expect(navFor('trainer', 'trainer').map((i) => i.label)).toContain('Session reports')
    expect(navFor('trainer', 'assistant_trainer').map((i) => i.label)).not.toContain('Session reports')
  })

  it('has unique paths per area and exactly one home', () => {
    for (const items of Object.values(navigation)) {
      const paths = items.map((i) => i.path)
      expect(new Set(paths).size).toBe(paths.length)
      expect(paths.filter((p) => p === '')).toHaveLength(1)
    }
  })
})
