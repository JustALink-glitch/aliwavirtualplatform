/** F1.01 Organisation type. Free to change later; only shown in Synqop. */
export const ORGANISATION_TYPES = [
  'Skills development',
  'Fellowship',
  'Bootcamp',
  'Accelerator or incubator',
  'NGO or foundation programme',
  'University or college',
  'Corporate training',
  'Government programme',
  'Other',
]

// ISO 3166 codes; names come from the browser so they read naturally.
const CODES =
  'NG GH KE ZA EG RW UG TZ ET SN CI CM MA TN DZ ZM ZW BW NA MW MZ AO CD BJ TG BF ML NE SL LR GM GN MU SD SS SO GB IE US CA BR MX AR CL CO PE DE FR NL BE ES PT IT CH AT SE NO DK FI PL CZ RO GR TR AE SA QA KW BH OM JO LB IL IN PK BD LK NP CN JP KR SG MY ID PH TH VN AU NZ'.split(
    ' ',
  )

export function countryOptions(): { value: string; label: string }[] {
  let names: Intl.DisplayNames | null = null
  try {
    names = new Intl.DisplayNames(['en-GB'], { type: 'region' })
  } catch {
    names = null
  }
  return CODES.map((code) => ({ value: code, label: names?.of(code) ?? code })).sort((a, b) => a.label.localeCompare(b.label))
}
