import { describe, expect, it } from 'vitest'
import { parseCsv, readParticipantCsv } from './csv'

describe('parseCsv', () => {
  it('handles quotes, escaped quotes, CRLF and a BOM', () => {
    expect(parseCsv('\uFEFFa,b\r\n"x, y","say ""hi"""\r\n')).toEqual([
      ['a', 'b'],
      ['x, y', 'say "hi"'],
    ])
  })
  it('detects semicolons and skips blank lines', () => {
    expect(parseCsv('a;b\n\n1;2')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ])
  })
})

describe('readParticipantCsv', () => {
  it('maps columns in any order and case', () => {
    const { rows, error } = readParticipantCsv('Email,Full Name\namara@example.com,Amara Okafor\n')
    expect(error).toBeNull()
    expect(rows).toEqual([{ full_name: 'Amara Okafor', email: 'amara@example.com', phone: '' }])
  })
  it('explains a missing header', () => {
    expect(readParticipantCsv('Amara,amara@example.com').error).toContain('full_name')
  })
})
