/** Dates and times as the designs show them (§05): "Mon 19 Oct", 24-hour clock. */
export function formatDay(value: string | Date, timeZone?: string): string {
  const date = new Date(value)
  const parts = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone }).formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return `${get('weekday')} ${get('day')} ${get('month')}`
}

export function formatTime(value: string | Date, timeZone?: string): string {
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone }).format(new Date(value))
}

/** "+01:00" for a time zone at the current date. */
function utcOffset(timeZone: string): string {
  const name = new Intl.DateTimeFormat('en-GB', { timeZone, timeZoneName: 'longOffset' })
    .formatToParts(new Date())
    .find((p) => p.type === 'timeZoneName')?.value
  const offset = name?.replace('GMT', '') || '+00:00'
  return offset
}

/** "West Africa Time — Lagos (UTC+01:00)", as on R1.03. */
export function timeZoneLabel(timeZone: string): string {
  const genericRaw = new Intl.DateTimeFormat('en-GB', { timeZone, timeZoneName: 'longGeneric' })
    .formatToParts(new Date())
    .find((p) => p.type === 'timeZoneName')?.value
  const city = timeZone.split('/').at(-1)!.replaceAll('_', ' ')
  // Zones without daylight saving get "Standard" names in some browsers; the designs use the generic form.
  const generic = genericRaw?.replace(' Standard Time', ' Time')
  const name = generic && !generic.startsWith('GMT') ? `${generic} — ${city}` : city
  return `${name} (UTC${utcOffset(timeZone)})`
}

/** All IANA time zones, sorted by UTC offset then name. */
export function timeZoneOptions(): { value: string; label: string }[] {
  const zones = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : ['Africa/Lagos', 'UTC']
  const toMinutes = (offset: string) => {
    const match = offset.match(/([+-])(\d{2}):(\d{2})/)
    return match ? (match[1] === '-' ? -1 : 1) * (Number(match[2]) * 60 + Number(match[3])) : 0
  }
  return zones
    .map((zone) => ({ value: zone, label: timeZoneLabel(zone), offset: toMinutes(utcOffset(zone)) }))
    .sort((a, b) => a.offset - b.offset || a.label.localeCompare(b.label))
    .map(({ value, label }) => ({ value, label }))
}

export function browserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Lagos'
  } catch {
    return 'Africa/Lagos'
  }
}
