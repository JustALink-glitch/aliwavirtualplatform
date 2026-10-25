import clsx from 'clsx'
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router'
import { SearchIcon } from '@/components/ui/icons'
import { PageHeader, Panel } from '@/components/ui/Page'
import type { Area } from '@/lib/roles'
import { useSearch, type SearchGroup } from './data'
import { kindIcon } from './icons'

const placeholders: Record<Area, string> = {
  admin: 'Search participants, cohorts, courses or trainers',
  trainer: 'Search your participants, cohorts and sessions',
  participant: 'Search your courses and sessions',
}

/** Waits until typing pauses before searching. */
function useDebounced(value: string, ms = 250) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return debounced
}

/** Field, results and keyboard handling, shared by the top bar (G1.02) and the phone page. */
function useSearchBox(onDone?: () => void) {
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const q = useDebounced(text.trim())
  const query = useSearch(q)
  const groups = q.length >= 2 ? (query.data?.groups ?? []) : []
  const flat = groups.flatMap((g) => g.items)
  const [active, setActive] = useState(0)
  const [lastQ, setLastQ] = useState(q)
  if (lastQ !== q) {
    setLastQ(q)
    setActive(0)
  }

  const go = (link: string) => {
    setText('')
    onDone?.()
    navigate(link)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && flat.length) {
      e.preventDefault()
      setActive((i) => (i + 1) % flat.length)
    } else if (e.key === 'ArrowUp' && flat.length) {
      e.preventDefault()
      setActive((i) => (i - 1 + flat.length) % flat.length)
    } else if (e.key === 'Enter' && flat[active]) {
      e.preventDefault()
      go(flat[active].link)
    } else if (e.key === 'Escape') {
      setText('')
      onDone?.()
      e.currentTarget.blur()
    }
  }

  const status =
    text.trim().length < 2
      ? null
      : query.isError
        ? 'Search isn’t working right now. Try again.'
        : !query.data || query.isFetching
          ? 'Searching…'
          : groups.length
            ? null
            : `No matches for “${q}”.`

  return { text, setText, groups, flat, active, setActive, go, onKeyDown, status, showing: text.trim().length >= 2 }
}

function Results({
  groups,
  flat,
  active,
  setActive,
  go,
  status,
  listId,
}: {
  groups: SearchGroup[]
  flat: SearchGroup['items']
  active: number
  setActive: (i: number) => void
  go: (link: string) => void
  status: string | null
  listId: string
}) {
  return (
    <div id={listId} role="listbox" aria-label="Search results" className="flex flex-col py-1.5">
      {groups.map((g) => {
        const Icon = kindIcon[g.kind]
        return (
          <div key={g.kind} role="group" aria-label={g.label} className="flex flex-col">
            <p className="px-4 pt-2.5 pb-1 text-caption text-secondary">{g.label}</p>
            {g.items.map((item) => {
              const index = flat.indexOf(item)
              return (
                <div
                  key={`${g.kind}-${item.id}`}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === active}
                  onPointerDown={(e) => e.preventDefault()}
                  onPointerMove={() => setActive(index)}
                  onClick={() => go(item.link)}
                  className={clsx('flex cursor-pointer items-center gap-3 px-4 py-2', index === active && 'bg-surface-hover')}
                >
                  <Icon size={16} className="shrink-0 text-icon" />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-body text-primary">{item.title}</span>
                    {item.subtitle && <span className="truncate text-caption text-secondary">{item.subtitle}</span>}
                  </span>
                </div>
              )
            })}
          </div>
        )
      })}
      {status && <p className="px-4 py-3 text-body text-secondary">{status}</p>}
    </div>
  )
}

/** G1.02 Search in the top bar. ⌘K or Ctrl K jumps here. */
export function GlobalSearch({ area }: { area: Area }) {
  const ref = useRef<HTMLInputElement>(null)
  const listId = useId()
  const [focused, setFocused] = useState(false)
  const box = useSearchBox(() => ref.current?.blur())

  useEffect(() => {
    function onKey(event: globalThis.KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        ref.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const open = focused && box.showing
  return (
    <div className="relative w-[400px] min-w-0 max-xl:w-[320px]">
      <label className="flex h-9 items-center gap-2 rounded-md border border-default bg-surface-subtle pr-2 pl-3 focus-within:shadow-[var(--shadow-focus)]">
        <SearchIcon size={16} className="shrink-0 text-icon" />
        <input
          ref={ref}
          type="search"
          role="combobox"
          aria-label="Search"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && box.flat.length ? `${listId}-${box.active}` : undefined}
          placeholder={placeholders[area]}
          value={box.text}
          onChange={(e) => box.setText(e.target.value)}
          onKeyDown={box.onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="min-w-0 flex-1 bg-transparent text-body text-primary outline-none placeholder:text-muted"
        />
        <kbd className="rounded-sm border border-default bg-surface px-1.5 py-0.5 font-sans text-[11px] leading-[14px] font-medium text-secondary">⌘K</kbd>
      </label>
      {open && (
        <div className="absolute top-[calc(100%+8px)] -left-11 z-30 w-[504px] max-w-[calc(100vw-32px)] rounded-lg border border-default bg-surface shadow-[var(--shadow-overlay)]">
          <Results listId={listId} {...box} />
          {box.flat.length > 0 && <p className="border-t border-default px-4 py-2.5 text-caption text-secondary">↑↓ to move · Enter to open · Esc to close</p>}
        </div>
      )}
    </div>
  )
}

/** /:area/search — G1.02 on phones. */
export function SearchPage({ area }: { area: Area }) {
  const listId = useId()
  const box = useSearchBox()
  return (
    <>
      <PageHeader title="Search" />
      <label className="flex h-11 items-center gap-2 rounded-md border border-default bg-surface pr-2 pl-3 focus-within:shadow-[var(--shadow-focus)]">
        <SearchIcon size={18} className="shrink-0 text-icon" />
        <input
          type="search"
          role="combobox"
          aria-label="Search"
          aria-expanded={box.showing}
          aria-controls={listId}
          aria-autocomplete="list"
          // The person came here to type.
          autoFocus
          placeholder={placeholders[area]}
          value={box.text}
          onChange={(e) => box.setText(e.target.value)}
          onKeyDown={box.onKeyDown}
          className="min-w-0 flex-1 bg-transparent text-body-large text-primary outline-none placeholder:text-muted"
        />
      </label>
      {box.showing && (
        <Panel className="p-0!">
          <Results listId={listId} {...box} />
        </Panel>
      )}
    </>
  )
}
