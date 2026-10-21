/**
 * Minimal CSV reader for participant imports (B1.03): RFC 4180 quoting, comma or semicolon,
 * CRLF or LF, optional BOM. Returns rows as arrays of strings.
 */
export function parseCsv(input: string): string[][] {
  const text = input.replace(/^\uFEFF/, '')
  const firstLine = text.split(/\r?\n/, 1)[0] ?? ''
  const delimiter = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ';' : ','
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else quoted = false
      } else field += ch
    } else if (ch === '"' && field === '') quoted = true
    else if (ch === delimiter) {
      row.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else field += ch
  }
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''))
}

export interface ParticipantRow {
  full_name: string
  email: string
  phone: string
}

const HEADERS: Record<keyof ParticipantRow, string[]> = {
  full_name: ['full_name', 'full name', 'name', 'fullname'],
  email: ['email', 'email address', 'e-mail'],
  phone: ['phone', 'phone number', 'mobile', 'telephone'],
}

/** Reads the header row and maps columns. Errors are written for the admin. */
export function readParticipantCsv(input: string): { rows: ParticipantRow[]; error: string | null } {
  const table = parseCsv(input)
  if (table.length === 0) return { rows: [], error: 'The file is empty.' }
  const header = table[0]!.map((h) => h.trim().toLowerCase())
  const index = (key: keyof ParticipantRow) => header.findIndex((h) => HEADERS[key].includes(h))
  const nameAt = index('full_name')
  const emailAt = index('email')
  const phoneAt = index('phone')
  if (nameAt === -1 || emailAt === -1) {
    return { rows: [], error: 'The first row must name the columns: full_name, email and (optionally) phone.' }
  }
  const rows = table.slice(1).map((cells) => ({
    full_name: (cells[nameAt] ?? '').trim(),
    email: (cells[emailAt] ?? '').trim(),
    phone: phoneAt === -1 ? '' : (cells[phoneAt] ?? '').trim(),
  }))
  if (rows.length === 0) return { rows, error: 'The file has a header row but no participants.' }
  return { rows, error: null }
}

export const CSV_TEMPLATE = 'full_name,email,phone\nAmara Okafor,amara.okafor@example.com,+234 803 555 0142\n'
