import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getBranches } from '../api/client'

export default function BranchSelect() {
  const [branches, setBranches] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    getBranches()
      .then((data) => {
        setBranches(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Select your branch</h1>
      <p className="mb-6 text-sm text-slate-500">Choose your year/branch to browse study materials.</p>

      {status === 'loading' && <p className="text-slate-500">Loading branches…</p>}
      {status === 'error' && (
        <p className="text-red-600">Couldn't load branches. Is the API running at 127.0.0.1:8000?</p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {branches.map((branch) => (
          <Link
            key={branch.id}
            to={`/branch/${branch.id}`}
            state={{ branchName: branch.name, branchCode: branch.code }}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition active:scale-[0.98] hover:border-indigo-300 hover:shadow-md"
          >
            <p className="text-base font-semibold text-slate-900">{branch.name}</p>
            <p className="text-xs font-medium uppercase tracking-wide text-indigo-500">{branch.code}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
