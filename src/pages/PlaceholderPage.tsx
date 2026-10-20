/** Stand-in for a screen that hasn't been built yet. Shows which Figma frames it maps to. */
export function PlaceholderPage({ title, screen }: { title: string; screen: string }) {
  return (
    <section>
      <h1 className="text-page-title text-primary">{title}</h1>
      <p className="mt-1 text-body text-muted">Not built yet · Figma {screen}</p>
    </section>
  )
}
