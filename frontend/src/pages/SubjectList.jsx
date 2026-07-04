import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getBranches, getSubjects } from '../api/client'
import Breadcrumb from '../components/Breadcrumb'

export default function SubjectList() {
  const { branchId, semester } = useParams()
  const [branch, setBranch] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    setStatus('loading')
    Promise.all([getBranches(), getSubjects(branchId, semester)])
      .then(([branches, subjectList]) => {
        setBranch(branches.find((b) => String(b.id) === branchId) ?? null)
        setSubjects(subjectList)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [branchId, semester])

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Breadcrumb
        items={[
          { label: 'Branches', to: '/' },
          { label: branch?.name ?? 'Branch', to: `/branch/${branchId}` },
          { label: `Sem ${semester}` },
        ]}
      />

      <h1 className="mb-1 text-2xl font-bold text-slate-900">Subjects</h1>
      <p className="mb-6 text-sm text-slate-500">
        {branch?.name} · Semester {semester}
      </p>

      {status === 'loading' && <p className="text-slate-500">Loading subjects…</p>}
      {status === 'error' && <p className="text-red-600">Couldn't load subjects.</p>}
      {status === 'ready' && subjects.length === 0 && (
        <p className="text-slate-500">No subjects found for this semester yet.</p>
      )}

      <div className="flex flex-col gap-3">
        {subjects.map((subject) => (
          <Link
            key={subject.id}
            to={`/subject/${subject.id}`}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition active:scale-[0.98] hover:border-indigo-300 hover:shadow-md"
          >
            <p className="text-base font-semibold text-slate-900">{subject.name}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
