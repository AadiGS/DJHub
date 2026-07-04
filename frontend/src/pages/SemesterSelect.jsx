import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getBranches } from '../api/client'
import Breadcrumb from '../components/Breadcrumb'

const FE_SEMESTERS = [1, 2]
const SENIOR_SEMESTERS = [3, 4, 5, 6, 7, 8]

export default function SemesterSelect() {
  const { branchId } = useParams()
  const [branch, setBranch] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    getBranches()
      .then((branches) => {
        const match = branches.find((b) => String(b.id) === branchId)
        setBranch(match ?? null)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [branchId])

  const semesters = branch?.code === 'FE' ? FE_SEMESTERS : SENIOR_SEMESTERS

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Breadcrumb
        items={[
          { label: 'Branches', to: '/' },
          { label: branch?.name ?? 'Branch' },
        ]}
      />

      <h1 className="mb-1 text-2xl font-bold text-slate-900">Select semester</h1>
      <p className="mb-6 text-sm text-slate-500">{branch?.name}</p>

      {status === 'loading' && <p className="text-slate-500">Loading…</p>}
      {status === 'error' && <p className="text-red-600">Couldn't load branch details.</p>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {semesters.map((sem) => (
          <Link
            key={sem}
            to={`/branch/${branchId}/sem/${sem}`}
            state={{ branchName: branch?.name, semester: sem }}
            className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm transition active:scale-[0.98] hover:border-indigo-300 hover:shadow-md"
          >
            <p className="text-xl font-bold text-indigo-600">{sem}</p>
            <p className="text-xs text-slate-500">Semester</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
