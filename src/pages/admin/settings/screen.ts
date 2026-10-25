/** Desktop layout (Tailwind `lg`, 1024px and up). */
export const isWideScreen = () => typeof window === 'undefined' || typeof window.matchMedia !== 'function' || window.matchMedia('(min-width: 1024px)').matches
