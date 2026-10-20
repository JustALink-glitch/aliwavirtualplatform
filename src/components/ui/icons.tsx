import type { SVGProps } from 'react'

/**
 * Synqop icon set (Figma: Design System › Icons, linear style, 24px grid).
 * Paths are exported from the Figma components; colour follows `currentColor`
 * so they recolour with text tokens, as the components intend.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Icon({ size = 24, children, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      {children}
    </svg>
  )
}

/** Icon / check (4:60) */
export const CheckIcon = (props: IconProps) => (
  <Icon {...props}>
    <path
      d="M19.31 5.77C19.72 5.39 20.35 5.41 20.73 5.81C21.11 6.22 21.09 6.85 20.69 7.23L9.04 18.23C8.65 18.59 8.05 18.59 7.67 18.23L3.31 14.12C2.91 13.74 2.89 13.1 3.27 12.7C3.65 12.3 4.29 12.28 4.69 12.66L8.35 16.12L19.31 5.77Z"
      fill="currentColor"
    />
  </Icon>
)

/** Icon / check-circle (4:66) */
export const CheckCircleIcon = (props: IconProps) => (
  <Icon {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15.68 10.74C16.08 10.36 16.11 9.73 15.74 9.32C15.36 8.92 14.73 8.89 14.32 9.26L10.63 12.64L9.68 11.77C9.27 11.39 8.64 11.42 8.26 11.83C7.89 12.24 7.92 12.87 8.32 13.24L9.96 14.74C10.34 15.09 10.93 15.09 11.31 14.74L15.68 10.74Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20C7.58 20 4 16.42 4 12Z"
      fill="currentColor"
    />
  </Icon>
)

/** Icon / arrow-right (4:155) */
export const ArrowRightIcon = (props: IconProps) => (
  <Icon {...props}>
    <path
      d="M21.71 12.7096C22.1 12.3196 22.1 11.6796 21.71 11.2896L17.71 7.28957C17.32 6.89957 16.68 6.89957 16.29 7.28957C15.9 7.67957 15.9 8.31957 16.29 8.70957L18.59 10.9996H3C2.45 10.9996 2 11.4496 2 11.9996C2 12.5496 2.45 12.9996 3 12.9996H18.59L16.29 15.2896C15.9 15.6796 15.9 16.3196 16.29 16.7096C16.68 17.0996 17.32 17.0996 17.71 16.7096L21.71 12.7096Z"
      fill="currentColor"
    />
  </Icon>
)

/** Icon / info-circle (3:76) — also used for field errors */
export const InfoCircleIcon = (props: IconProps) => (
  <Icon {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 6C12.5523 6 13 6.44772 13 7V14C13 14.5523 12.5523 15 12 15C11.4477 15 11 14.5523 11 14V7C11 6.44772 11.4477 6 12 6Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10.75 16.75C10.75 17.4404 11.3096 18 12 18C12.6904 18 13.25 17.4404 13.25 16.75C13.25 16.0596 12.6904 15.5 12 15.5C11.3096 15.5 10.75 16.0596 10.75 16.75Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4Z"
      fill="currentColor"
    />
  </Icon>
)

/** Icon / chevron-down (4:22) */
export const ChevronDownIcon = (props: IconProps) => (
  <Icon {...props}>
    <path
      d="M2.81 8.73L10.63 16.08C11.4 16.81 12.6 16.81 13.37 16.08L21.19 8.73C21.59 8.35 21.61 7.72 21.23 7.31C20.85 6.91 20.22 6.89 19.81 7.27L12 14.63L4.19 7.27C3.78 6.89 3.15 6.91 2.77 7.31C2.39 7.72 2.41 8.35 2.81 8.73Z"
      fill="currentColor"
    />
  </Icon>
)

/** Icon / info-triangle (3:69) — warnings and blocking errors */
export const InfoTriangleIcon = (props: IconProps) => (
  <Icon {...props}>
    <path
      d="M8.73857 3.93156C10.1197 1.35618 13.8809 1.35611 15.262 3.93156L21.5735 15.705C22.8847 18.1512 21.0376 20.9995 18.3118 20.9999H5.68877C2.96284 20.9997 1.1157 18.1513 2.42705 15.705L8.73857 3.93156ZM13.4993 4.87688C12.8724 3.70779 11.1282 3.70785 10.5013 4.87688L4.18974 16.6503C3.63599 17.6837 4.38239 18.9997 5.68877 18.9999H18.3118C19.618 18.9995 20.3644 17.6836 19.8108 16.6503L13.4993 4.87688ZM12.0003 15.4999C12.6905 15.5001 13.2503 16.0597 13.2503 16.7499C13.2503 17.4402 12.6905 17.9998 12.0003 17.9999C11.3099 17.9999 10.7503 17.4403 10.7503 16.7499C10.7503 16.0596 11.3099 15.4999 12.0003 15.4999ZM12.0003 5.99992C12.5525 6.00006 13.0003 6.44772 13.0003 6.99992V13.9999C13.0003 14.5521 12.5525 14.9998 12.0003 14.9999C11.448 14.9999 11.0003 14.5522 11.0003 13.9999V6.99992C11.0003 6.44764 11.448 5.99992 12.0003 5.99992Z"
      fill="currentColor"
    />
  </Icon>
)
