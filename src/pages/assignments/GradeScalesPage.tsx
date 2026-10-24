import { PageHeader, Panel, PanelHeader } from '@/components/ui/Page'

const examples = [
  {
    scale: 'Points',
    value: '72',
    suffix: '/ 100',
    hint: 'Points · out of 100',
  },
  { scale: 'Percentage', value: '86%', hint: 'Percentage' },
  { scale: 'Letter grade', value: 'B', hint: 'Letter grade · A to F' },
  { scale: 'Pass / Fail', value: 'Pass', hint: 'Pass / Fail' },
]

const rubric = [
  { criterion: 'Problem framing', score: 3 },
  { criterion: 'Evidence from users', score: 4 },
  { criterion: 'Recommendations', score: 3 },
  { criterion: 'Presentation', score: 2 },
]

/** /admin/courses/assignments/grading-scales — C4.04 Grades by scale (desktop reference). */
export function GradeScalesPage() {
  const total = rubric.reduce((t, r) => t + r.score, 0)
  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: 'Courses & sessions', to: '/admin/courses' },
          { label: 'Assignments', to: '/admin/courses/assignments' },
          { label: 'How grades appear' },
        ]}
        title="How grades appear"
        description="Trainers choose a scale per assignment. Admins and participants see the grade in that scale. These are examples."
      />
      <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1">
        {examples.map((e) => (
          <Panel key={e.scale} className="gap-1">
            <h2 className="text-heading-section text-primary">{e.scale}</h2>
            <p className="flex items-baseline gap-2 pt-1">
              <span className="text-metric-large text-primary">{e.value}</span>
              {e.suffix && <span className="text-body text-secondary">{e.suffix}</span>}
            </p>
            <p className="text-caption text-secondary">{e.hint}</p>
          </Panel>
        ))}
      </div>
      <Panel aria-labelledby="rubric-title">
        <PanelHeader id="rubric-title" title="Rubric" description="Each criterion is scored 1–4; the total shows on the submission." />
        <table className="w-full">
          <thead>
            <tr className="bg-surface-subtle text-caption text-secondary">
              <th scope="col" className="rounded-l-md px-3 py-2 text-left font-normal">
                Criterion
              </th>
              <th scope="col" className="rounded-r-md px-3 py-2 text-right font-normal">
                Score
              </th>
            </tr>
          </thead>
          <tbody>
            {rubric.map((r) => (
              <tr key={r.criterion} className="border-b border-default">
                <td className="px-3 py-2.5 text-body text-primary">{r.criterion}</td>
                <td className="px-3 py-2.5 text-right text-body-strong text-primary tabular-nums">{r.score} / 4</td>
              </tr>
            ))}
            <tr>
              <td className="px-3 py-2.5 text-body-strong text-primary">Total</td>
              <td className="px-3 py-2.5 text-right text-body-strong text-primary tabular-nums">
                {total} / {rubric.length * 4}
              </td>
            </tr>
          </tbody>
        </table>
      </Panel>
    </>
  )
}
