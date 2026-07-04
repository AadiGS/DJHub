import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getBranches, getSubject } from '../api/client'
import Breadcrumb from '../components/Breadcrumb'

const TYPE_ORDER = ['Notes', 'Short Notes', 'PPT', 'Textbook', 'Lab Manual', 'Practical Code']

const TYPE_STYLES = {
  Notes: 'bg-sky-50 text-sky-700 border-sky-200',
  'Short Notes': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PPT: 'bg-amber-50 text-amber-700 border-amber-200',
  Textbook: 'bg-blue-50 text-blue-700 border-blue-200',
  'Lab Manual': 'bg-violet-50 text-violet-700 border-violet-200',
  'Practical Code': 'bg-cyan-50 text-cyan-700 border-cyan-200',
}

function groupByType(materials) {
  const groups = {}
  for (const material of materials) {
    if (!groups[material.type]) groups[material.type] = []
    groups[material.type].push(material)
  }
  return TYPE_ORDER.filter((type) => groups[type]?.length).map((type) => ({
    type,
    materials: groups[type],
  }))
}

function MaterialGroupCard({ heading, materials }) {
  const groups = groupByType(materials)

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-base font-semibold text-slate-900">{heading}</h3>

      {groups.length === 0 && <p className="text-sm text-slate-400">No materials yet.</p>}

      <div className="flex flex-col gap-3">
        {groups.map(({ type, materials: typedMaterials }) => (
          <div key={type}>
            <span
              className={`mb-2 inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${TYPE_STYLES[type]}`}
            >
              {type}
            </span>
            <div className="flex flex-col gap-2">
              {typedMaterials.map((material) => (
                <a
                  key={material.id}
                  href={material.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition active:scale-[0.98] hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  {material.title}
                  <span aria-hidden className="text-slate-400">↗</span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function MaterialList() {
  const { subjectId } = useParams()

  const [subject, setSubject] = useState(null)
  const [branch, setBranch] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    setStatus('loading')
    Promise.all([getSubject(subjectId), getBranches()])
      .then(([subjectData, branches]) => {
        setSubject(subjectData)
        setBranch(branches.find((b) => b.id === subjectData.branch_id) ?? null)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [subjectId])

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Breadcrumb
        items={[
          { label: 'Branches', to: '/' },
          ...(branch ? [{ label: branch.name, to: `/branch/${branch.id}` }] : []),
          ...(subject ? [{ label: `Sem ${subject.semester}`, to: `/branch/${subject.branch_id}/sem/${subject.semester}` }] : []),
          { label: subject?.name ?? 'Materials' },
        ]}
      />

      <h1 className="mb-6 text-2xl font-bold text-slate-900">{subject?.name ?? 'Study Materials'}</h1>

      {status === 'loading' && <p className="text-slate-500">Loading materials…</p>}
      {status === 'error' && <p className="text-red-600">Couldn't load materials.</p>}
      {status === 'ready' && !subject.has_theory && !subject.has_lab && subject.pyqs.length === 0 && (
        <p className="text-slate-500">No content added for this subject yet.</p>
      )}

      {status === 'ready' && subject.pyqs.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo-500">
            Previous Year Papers
          </h2>
          <div className="flex flex-col gap-2">
            {subject.pyqs.map((pyq) => (
              <a
                key={pyq.id}
                href={pyq.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition active:scale-[0.98] hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
              >
                {pyq.exam_type} {pyq.year}
                <span aria-hidden className="text-slate-400">↗</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {status === 'ready' && subject.has_theory && (
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo-500">Theory</h2>
          {subject.modules.length === 0 ? (
            <p className="text-slate-500">No modules added yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {subject.modules.map((module) => (
                <MaterialGroupCard
                  key={module.id}
                  heading={`Module ${module.position}: ${module.title}`}
                  materials={module.materials}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {status === 'ready' && subject.has_lab && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo-500">Practicals</h2>
          {subject.experiments.length === 0 ? (
            <p className="text-slate-500">No experiments added yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {subject.experiments.map((experiment) => (
                <MaterialGroupCard
                  key={experiment.id}
                  heading={`Exp ${experiment.experiment_number}: ${experiment.title}`}
                  materials={experiment.materials}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
