import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { StatePanel } from '@/components/StatePanel'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { BookOpenIcon, PlusIcon } from '@/components/ui/icons'
import { EmptyState, FilterChips, PageHeader, Panel } from '@/components/ui/Page'
import { SearchField } from '@/components/ui/SearchField'
import { Cell, Row, Stacked, Table, TableFooter, type Column } from '@/components/ui/Table'
import { plural } from '@/lib/format'
import { paginate } from '@/lib/paginate'
import { initials } from '@/lib/people'
import { useCourses, useProgrammes } from './data'

const columns: Column[] = [
  { label: 'Course' },
  { label: 'Cohorts', width: 240, hideBelow: 'lg' },
  { label: 'Lead trainer', width: 220 },
  { label: 'Sessions per cohort', width: 160, align: 'right', hideBelow: 'xl' },
]

/** /admin/courses — A2.01 Courses, A2.01e empty. */
export function CoursesPage() {
  const courses = useCourses()
  const programmes = useProgrammes()
  const navigate = useNavigate()
  const location = useLocation()
  const created = (location.state as { created?: string } | null)?.created
  const [programme, setProgramme] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const all = useMemo(() => courses.data ?? [], [courses.data])
  const liveProgrammes = (programmes.data?.programmes ?? []).filter((p) => p.status !== 'archived')
  const term = search.trim().toLowerCase()
  const visible = all.filter((c) => (programme === 'all' || c.programme.id === programme) && (!term || c.name.toLowerCase().includes(term)))
  const paged = paginate(visible, page)

  const newButton = (
    <Button
      icon={<PlusIcon size={16} />}
      onClick={() => navigate(programme !== 'all' ? `new?programme=${programme}` : 'new')}
      disabled={liveProgrammes.length === 0}
      title={liveProgrammes.length === 0 ? 'Create a programme first' : undefined}
    >
      New course
    </Button>
  )

  return (
    <>
      <PageHeader title="Courses & sessions" description="Courses belong to a programme and run in each of its cohorts." actions={all.length > 0 ? newButton : undefined} />
      {created && (
        <AlertBanner tone="success" title={`${created} was added`}>
          Cohorts you ticked now run it, with its lead trainer.
        </AlertBanner>
      )}

      {courses.isPending || programmes.isPending ? (
        <Panel aria-busy="true" aria-label="Loading courses" className="h-[240px]">
          <span className="sr-only">Loading courses</span>
        </Panel>
      ) : courses.isError ? (
        <Panel>
          <StatePanel kind="error" title="Couldn’t load courses" description="Check your connection and try again." action={{ label: 'Try again', onClick: () => void courses.refetch() }} />
        </Panel>
      ) : all.length === 0 ? (
        <Panel className="py-16">
          <EmptyState
            icon={<BookOpenIcon size={24} />}
            title="No courses yet"
            body={
              liveProgrammes.length === 0
                ? 'Courses belong to a programme. Create a programme first, then add its courses.'
                : 'Courses hold sessions, assignments and resources. Add one to a programme, then it can run in that programme’s cohorts.'
            }
            actions={
              liveProgrammes.length === 0 ? (
                <Button icon={<PlusIcon size={16} />} onClick={() => navigate('/admin/programmes/new')}>
                  New programme
                </Button>
              ) : (
                newButton
              )
            }
          />
        </Panel>
      ) : (
        <>
          <div className="flex items-center gap-3 max-md:flex-col max-md:items-stretch">
            <FilterChips
              label="Programme"
              value={programme}
              onChange={(value) => {
                setProgramme(value)
                setPage(1)
              }}
              options={[
                { value: 'all', label: 'All programmes', count: all.length },
                ...liveProgrammes
                  .filter((p) => all.some((c) => c.programme.id === p.id))
                  .map((p) => ({ value: p.id, label: p.name, count: all.filter((c) => c.programme.id === p.id).length })),
              ]}
            />
            <div className="flex-1" />
            <SearchField aria-label="Search courses" placeholder="Search courses" value={search} onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }} />
          </div>
          <Panel className="gap-0 max-md:py-2">
            {visible.length === 0 ? (
              <StatePanel kind="no-results" title="No courses match" description="Try another name, or choose All programmes." />
            ) : (
              <Table columns={columns}>
                {paged.rows.map((course) => (
                  <Row key={course.id} to={`/admin/programmes/${course.programme.id}`}>
                    <Cell>
                      <Stacked primary={course.name} secondary={course.programme.name} />
                    </Cell>
                    <Cell hideBelow="lg">
                      <Stacked
                        primary={course.cohorts.length ? plural(course.cohorts.length, 'cohort') : 'Not running yet'}
                        muted={course.cohorts.length === 0}
                        secondary={course.cohorts.map((c) => c.name).join(' · ') || undefined}
                      />
                    </Cell>
                    <Cell>
                      {course.defaultLead ? (
                        <span className="flex min-w-0 items-center gap-2">
                          <Avatar initials={initials(course.defaultLead.name)} seed={course.defaultLead.id} />
                          <span className="truncate text-body-strong">{course.defaultLead.name}</span>
                        </span>
                      ) : (
                        <span className="text-muted">Not assigned</span>
                      )}
                    </Cell>
                    <Cell align="right" hideBelow="xl" className="text-body-strong">
                      {course.plannedSessions ?? '—'}
                    </Cell>
                  </Row>
                ))}
              </Table>
            )}
            <TableFooter summary={plural(visible.length, 'course')} page={paged.page} pageCount={paged.pageCount} onPage={setPage} />
          </Panel>
        </>
      )}
    </>
  )
}
