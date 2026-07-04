import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  createAdmin,
  createExperiment,
  createMaterial,
  createModule,
  createPYQ,
  createSubject,
  deleteAdmin,
  deleteMaterial,
  deletePYQ,
  getAdmins,
  getBranches,
  getSubject,
  getSubjects,
  reorderModules,
  updateMaterial,
  updateModule,
  updatePYQ,
  updateSubject,
} from '../../api/client'
import Modal from '../../components/admin/Modal'

const FE_SEMESTERS = [1, 2]
const SENIOR_SEMESTERS = [3, 4, 5, 6, 7, 8]
const MATERIAL_TYPES = ['Notes', 'Short Notes', 'PPT', 'Textbook', 'Lab Manual', 'Practical Code']
const EXAM_TYPES = ['End Sem', 'TT1', 'TT2']

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'
const labelClass = 'mb-1 block text-sm font-medium text-slate-700'
const primaryButtonClass =
  'rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60'
const errorClass = 'rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600'

function AddSubjectForm({ branchId, semester, onCreated }) {
  const [name, setName] = useState('')
  const [hasTheory, setHasTheory] = useState(true)
  const [hasLab, setHasLab] = useState(false)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await createSubject({
        branch_id: Number(branchId),
        semester: Number(semester),
        name,
        has_theory: hasTheory,
        has_lab: hasLab,
      })
      onCreated()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Subject name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder="e.g. Data Structures"
        />
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={hasTheory} onChange={(e) => setHasTheory(e.target.checked)} />
          Has Theory
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={hasLab} onChange={(e) => setHasLab(e.target.checked)} />
          Has Lab
        </label>
      </div>
      {error && <p className={errorClass}>{error}</p>}
      <button type="submit" disabled={submitting} className={primaryButtonClass}>
        {submitting ? 'Adding…' : 'Add Subject'}
      </button>
    </form>
  )
}

function EditSubjectForm({ subject, onUpdated }) {
  const [name, setName] = useState(subject.name)
  const [hasTheory, setHasTheory] = useState(subject.has_theory)
  const [hasLab, setHasLab] = useState(subject.has_lab)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await updateSubject(subject.id, { name, has_theory: hasTheory, has_lab: hasLab })
      onUpdated()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Subject name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={hasTheory} onChange={(e) => setHasTheory(e.target.checked)} />
          Has Theory
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={hasLab} onChange={(e) => setHasLab(e.target.checked)} />
          Has Lab
        </label>
      </div>
      {error && <p className={errorClass}>{error}</p>}
      <button type="submit" disabled={submitting} className={primaryButtonClass}>
        {submitting ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  )
}

function AddModuleForm({ subjectId, nextModuleNumber, onCreated }) {
  const [title, setTitle] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await createModule({ subject_id: subjectId, title })
      onCreated()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Module title</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="e.g. Stacks and Queues"
        />
        <p className="mt-1 text-xs text-slate-500">
          Will be shown as "Module {nextModuleNumber}: {title || '…'}". Modules are numbered
          automatically based on their order, so add them in chronological order — you can
          reshuffle them later and the numbering will update automatically.
        </p>
      </div>
      {error && <p className={errorClass}>{error}</p>}
      <button type="submit" disabled={submitting} className={primaryButtonClass}>
        {submitting ? 'Adding…' : 'Add Module'}
      </button>
    </form>
  )
}

function EditModuleForm({ module, onUpdated }) {
  const [title, setTitle] = useState(module.title)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await updateModule(module.id, { title })
      onUpdated()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Module title</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-slate-500">Will be shown as "Module {module.position}: {title || '…'}".</p>
      </div>
      {error && <p className={errorClass}>{error}</p>}
      <button type="submit" disabled={submitting} className={primaryButtonClass}>
        {submitting ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  )
}

function AddExperimentForm({ subjectId, onCreated }) {
  const [experimentNumber, setExperimentNumber] = useState('')
  const [title, setTitle] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await createExperiment({
        subject_id: subjectId,
        experiment_number: Number(experimentNumber),
        title,
      })
      onCreated()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Experiment number</label>
        <input
          required
          type="number"
          min="1"
          value={experimentNumber}
          onChange={(e) => setExperimentNumber(e.target.value)}
          className={inputClass}
          placeholder="1"
        />
      </div>
      <div>
        <label className={labelClass}>Title</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="e.g. Implementation of Stacks using Arrays"
        />
      </div>
      {error && <p className={errorClass}>{error}</p>}
      <button type="submit" disabled={submitting} className={primaryButtonClass}>
        {submitting ? 'Adding…' : 'Add Experiment'}
      </button>
    </form>
  )
}

function AddMaterialForm({ modules, experiments, onCreated }) {
  const options = [
    ...modules.map((m) => ({ value: `module:${m.id}`, label: `[Theory] Module ${m.position}: ${m.title}` })),
    ...experiments.map((exp) => ({
      value: `experiment:${exp.id}`,
      label: `[Practical] Exp ${exp.experiment_number}: ${exp.title}`,
    })),
  ]

  const [target, setTarget] = useState(options[0]?.value ?? '')
  const [title, setTitle] = useState('')
  const [type, setType] = useState(MATERIAL_TYPES[0])
  const [fileUrl, setFileUrl] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!target) {
      setError('Select a module or experiment to attach this material to.')
      return
    }
    setSubmitting(true)
    const [kind, id] = target.split(':')
    try {
      await createMaterial({
        title,
        type,
        file_url: fileUrl,
        module_id: kind === 'module' ? Number(id) : null,
        experiment_id: kind === 'experiment' ? Number(id) : null,
      })
      onCreated()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Attach to</label>
        <select required value={target} onChange={(e) => setTarget(e.target.value)} className={inputClass}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Title</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="e.g. Unit 1 Short Notes"
        />
      </div>
      <div>
        <label className={labelClass}>Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
          {MATERIAL_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>OneDrive link</label>
        <input
          required
          type="url"
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          className={inputClass}
          placeholder="https://svkmmumbai-my.sharepoint.com/…"
        />
      </div>
      {error && <p className={errorClass}>{error}</p>}
      <button type="submit" disabled={submitting} className={primaryButtonClass}>
        {submitting ? 'Adding…' : 'Add Material'}
      </button>
    </form>
  )
}

function EditMaterialForm({ material, onUpdated }) {
  const [title, setTitle] = useState(material.title)
  const [type, setType] = useState(material.type)
  const [fileUrl, setFileUrl] = useState(material.file_url)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await updateMaterial(material.id, { title, type, file_url: fileUrl })
      onUpdated()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Title</label>
        <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
          {MATERIAL_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>OneDrive link</label>
        <input
          required
          type="url"
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          className={inputClass}
        />
      </div>
      {error && <p className={errorClass}>{error}</p>}
      <button type="submit" disabled={submitting} className={primaryButtonClass}>
        {submitting ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  )
}

function MaterialRow({ material, onEdit, onDeleted }) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)

  async function handleDelete() {
    if (!window.confirm(`Delete "${material.title}"? This cannot be undone.`)) return
    setDeleting(true)
    setError(null)
    try {
      await deleteMaterial(material.id)
      onDeleted()
    } catch (err) {
      setError(err.message)
      setDeleting(false)
    }
  }

  return (
    <li className="flex items-center justify-between gap-2 py-0.5">
      <span>
        {material.title} <span className="text-slate-400">({material.type})</span>
        {error && <span className="ml-2 text-red-600">{error}</span>}
      </span>
      <span className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => onEdit(material)}
          className="font-medium text-slate-400 hover:text-indigo-600"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="font-medium text-slate-400 hover:text-red-600 disabled:opacity-50"
        >
          {deleting ? '…' : 'Delete'}
        </button>
      </span>
    </li>
  )
}

function AddPYQForm({ subjectId, onCreated }) {
  const [examType, setExamType] = useState(EXAM_TYPES[0])
  const [year, setYear] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await createPYQ({ subject_id: subjectId, exam_type: examType, year: Number(year), file_url: fileUrl })
      onCreated()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Exam</label>
        <select value={examType} onChange={(e) => setExamType(e.target.value)} className={inputClass}>
          {EXAM_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Year</label>
        <input
          required
          type="number"
          min="2000"
          max="2100"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className={inputClass}
          placeholder="2024"
        />
      </div>
      <div>
        <label className={labelClass}>OneDrive link</label>
        <input
          required
          type="url"
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          className={inputClass}
          placeholder="https://svkmmumbai-my.sharepoint.com/…"
        />
      </div>
      {error && <p className={errorClass}>{error}</p>}
      <button type="submit" disabled={submitting} className={primaryButtonClass}>
        {submitting ? 'Adding…' : 'Add PYQ'}
      </button>
    </form>
  )
}

function EditPYQForm({ pyq, onUpdated }) {
  const [examType, setExamType] = useState(pyq.exam_type)
  const [year, setYear] = useState(pyq.year)
  const [fileUrl, setFileUrl] = useState(pyq.file_url)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await updatePYQ(pyq.id, { exam_type: examType, year: Number(year), file_url: fileUrl })
      onUpdated()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Exam</label>
        <select value={examType} onChange={(e) => setExamType(e.target.value)} className={inputClass}>
          {EXAM_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Year</label>
        <input
          required
          type="number"
          min="2000"
          max="2100"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>OneDrive link</label>
        <input
          required
          type="url"
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          className={inputClass}
        />
      </div>
      {error && <p className={errorClass}>{error}</p>}
      <button type="submit" disabled={submitting} className={primaryButtonClass}>
        {submitting ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  )
}

function PYQRow({ pyq, onEdit, onDeleted }) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)

  async function handleDelete() {
    if (!window.confirm(`Delete "${pyq.exam_type} ${pyq.year}"? This cannot be undone.`)) return
    setDeleting(true)
    setError(null)
    try {
      await deletePYQ(pyq.id)
      onDeleted()
    } catch (err) {
      setError(err.message)
      setDeleting(false)
    }
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-3">
      <span className="text-sm font-medium text-slate-900">
        {pyq.exam_type} {pyq.year}
        {error && <span className="ml-2 text-xs font-normal text-red-600">{error}</span>}
      </span>
      <span className="flex shrink-0 gap-2 text-xs">
        <button type="button" onClick={() => onEdit(pyq)} className="font-medium text-slate-400 hover:text-indigo-600">
          Edit
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="font-medium text-slate-400 hover:text-red-600 disabled:opacity-50"
        >
          {deleting ? '…' : 'Delete'}
        </button>
      </span>
    </div>
  )
}

function ManageAdminsSection({ branches }) {
  const [admins, setAdmins] = useState([])
  const [status, setStatus] = useState('idle')
  const [listError, setListError] = useState(null)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [branchId, setBranchId] = useState('')
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function refreshAdmins() {
    setStatus('loading')
    getAdmins()
      .then((data) => {
        setAdmins(data)
        setStatus('ready')
      })
      .catch((err) => {
        setListError(err.message)
        setStatus('error')
      })
  }

  useEffect(() => {
    refreshAdmins()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)
    try {
      await createAdmin({ username, password, branch_id: Number(branchId) })
      setUsername('')
      setPassword('')
      setBranchId('')
      refreshAdmins()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRevoke(admin) {
    if (!window.confirm(`Revoke access for "${admin.username}"? This cannot be undone.`)) return
    setListError(null)
    try {
      await deleteAdmin(admin.id)
      refreshAdmins()
    } catch (err) {
      setListError(err.message)
    }
  }

  const branchAdmins = admins.filter((a) => a.role === 'branch_admin')

  return (
    <div className="mb-8 rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
      <h2 className="mb-3 text-base font-semibold text-slate-900">Manage Branch Admins</h2>

      <form onSubmit={handleSubmit} className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className={labelClass}>Username</label>
          <input
            required
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputClass}
            placeholder="it_admin"
          />
        </div>
        <div className="flex-1">
          <label className={labelClass}>Password</label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex-1">
          <label className={labelClass}>Branch</label>
          <select required value={branchId} onChange={(e) => setBranchId(e.target.value)} className={inputClass}>
            <option value="">Select branch…</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={submitting} className={primaryButtonClass}>
          {submitting ? 'Adding…' : 'Add Admin'}
        </button>
      </form>
      {formError && <p className={`mb-4 ${errorClass}`}>{formError}</p>}

      {status === 'loading' && <p className="text-sm text-slate-500">Loading admins…</p>}
      {status === 'error' && <p className="text-sm text-red-600">Couldn't load admins.</p>}
      {listError && status !== 'error' && <p className={`mb-2 ${errorClass}`}>{listError}</p>}
      {status === 'ready' && branchAdmins.length === 0 && (
        <p className="text-sm text-slate-500">No branch admins yet.</p>
      )}
      {status === 'ready' && branchAdmins.length > 0 && (
        <div className="flex flex-col gap-2">
          {branchAdmins.map((admin) => {
            const branch = branches.find((b) => b.id === admin.branch_id)
            return (
              <div
                key={admin.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{admin.username}</p>
                  <p className="text-xs text-slate-500">{branch?.name ?? `Branch #${admin.branch_id}`}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRevoke(admin)}
                  className="text-xs font-medium text-slate-400 hover:text-red-600"
                >
                  Revoke Access
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [branches, setBranches] = useState([])
  const [branchId, setBranchId] = useState(user?.branch_id ? String(user.branch_id) : '')
  const [semester, setSemester] = useState('')

  const [subjects, setSubjects] = useState([])
  const [subjectsStatus, setSubjectsStatus] = useState('idle')

  const [selectedSubjectId, setSelectedSubjectId] = useState(null)
  const [subjectDetail, setSubjectDetail] = useState(null)
  const [detailStatus, setDetailStatus] = useState('idle')

  const [activeModal, setActiveModal] = useState(null)
  const [editingSubject, setEditingSubject] = useState(null)
  const [editingModule, setEditingModule] = useState(null)
  const [editingMaterial, setEditingMaterial] = useState(null)
  const [editingPYQ, setEditingPYQ] = useState(null)
  const [reordering, setReordering] = useState(false)
  const [reorderError, setReorderError] = useState(null)

  useEffect(() => {
    getBranches().then(setBranches).catch(() => {})
  }, [])

  const selectedBranch = branches.find((b) => b.id === Number(branchId))
  const semesterOptions = selectedBranch?.code === 'FE' ? FE_SEMESTERS : SENIOR_SEMESTERS

  function refreshSubjects() {
    if (!branchId || !semester) return
    setSubjectsStatus('loading')
    getSubjects(branchId, semester)
      .then((data) => {
        setSubjects(data)
        setSubjectsStatus('ready')
      })
      .catch(() => setSubjectsStatus('error'))
  }

  useEffect(() => {
    if (branchId && semester) refreshSubjects()
    else setSubjects([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId, semester])

  function refreshSubjectDetail(subjectId = selectedSubjectId) {
    if (!subjectId) return
    setDetailStatus('loading')
    getSubject(subjectId)
      .then((data) => {
        setSubjectDetail(data)
        setDetailStatus('ready')
      })
      .catch(() => setDetailStatus('error'))
  }

  async function moveModule(moduleId, direction) {
    if (!subjectDetail) return
    const modules = subjectDetail.modules
    const index = modules.findIndex((m) => m.id === moduleId)
    const swapWith = direction === 'up' ? index - 1 : index + 1
    if (swapWith < 0 || swapWith >= modules.length) return

    const reordered = [...modules]
    ;[reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]]

    setReordering(true)
    setReorderError(null)
    try {
      await reorderModules(subjectDetail.id, reordered.map((m) => m.id))
      refreshSubjectDetail(subjectDetail.id)
    } catch (err) {
      setReorderError(err.message)
    } finally {
      setReordering(false)
    }
  }

  function handleBranchChange(e) {
    setBranchId(e.target.value)
    setSemester('')
    setSelectedSubjectId(null)
    setSubjectDetail(null)
  }

  function handleSemesterChange(e) {
    setSemester(e.target.value)
    setSelectedSubjectId(null)
    setSubjectDetail(null)
  }

  function selectSubject(subjectId) {
    setSelectedSubjectId(subjectId)
    refreshSubjectDetail(subjectId)
  }

  function handleLogout() {
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500">
            {user?.sub} · <span className="font-medium text-indigo-600">{user?.role}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Log out
        </button>
      </div>

      {user?.role === 'superadmin' && <ManageAdminsSection branches={branches} />}

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Branch</label>
          <select value={branchId} onChange={handleBranchChange} disabled={user?.role === 'branch_admin'} className={inputClass}>
            <option value="">Select branch…</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Semester</label>
          <select value={semester} onChange={handleSemesterChange} disabled={!branchId} className={inputClass}>
            <option value="">Select semester…</option>
            {semesterOptions.map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {branchId && semester && (
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Subjects</h2>
            <button
              type="button"
              onClick={() => setActiveModal('subject')}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              + Add Subject
            </button>
          </div>

          {subjectsStatus === 'loading' && <p className="text-sm text-slate-500">Loading…</p>}
          {subjectsStatus === 'error' && <p className="text-sm text-red-600">Couldn't load subjects.</p>}
          {subjectsStatus === 'ready' && subjects.length === 0 && (
            <p className="text-sm text-slate-500">No subjects yet — add the first one.</p>
          )}

          <div className="flex flex-col gap-2">
            {subjects.map((s) => (
              <div
                key={s.id}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 shadow-sm transition ${
                  selectedSubjectId === s.id
                    ? 'border-indigo-400 bg-indigo-50'
                    : 'border-slate-200 bg-white hover:border-indigo-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => selectSubject(s.id)}
                  className="flex flex-1 items-center justify-between text-left"
                >
                  <span className="font-medium text-slate-900">{s.name}</span>
                  <span className="flex gap-1.5 text-xs">
                    {s.has_theory && (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-700">Theory</span>
                    )}
                    {s.has_lab && (
                      <span className="rounded-full bg-violet-50 px-2 py-0.5 font-medium text-violet-700">Lab</span>
                    )}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingSubject(s)
                    setActiveModal('editSubject')
                  }}
                  aria-label={`Edit ${s.name}`}
                  className="ml-3 shrink-0 text-xs font-medium text-slate-400 hover:text-indigo-600"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedSubjectId && (
        <div className="flex flex-col gap-6">
          {detailStatus === 'loading' && <p className="text-sm text-slate-500">Loading subject content…</p>}
          {detailStatus === 'error' && <p className="text-sm text-red-600">Couldn't load subject content.</p>}

          {detailStatus === 'ready' && subjectDetail && (
            <>
              <section>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-500">
                    Previous Year Papers
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveModal('pyq')}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    + Add PYQ
                  </button>
                </div>
                {subjectDetail.pyqs.length === 0 ? (
                  <p className="text-sm text-slate-400">No PYQs yet.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {subjectDetail.pyqs.map((pyq) => (
                      <PYQRow
                        key={pyq.id}
                        pyq={pyq}
                        onEdit={(p) => {
                          setEditingPYQ(p)
                          setActiveModal('editPYQ')
                        }}
                        onDeleted={() => refreshSubjectDetail()}
                      />
                    ))}
                  </div>
                )}
              </section>

              {subjectDetail.has_theory && (
                <section>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-500">Theory</h3>
                    <button
                      type="button"
                      onClick={() => setActiveModal('module')}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      + Add Module
                    </button>
                  </div>
                  {subjectDetail.modules.length === 0 && (
                    <p className="text-sm text-slate-400">No modules yet.</p>
                  )}
                  {reorderError && <p className={`mb-2 ${errorClass}`}>{reorderError}</p>}
                  <div className="flex flex-col gap-2">
                    {subjectDetail.modules.map((m, i) => (
                      <div key={m.id} className="rounded-lg border border-slate-200 bg-white p-3">
                        <div className="mb-1 flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-900">
                            Module {m.position}: {m.title}
                          </p>
                          <div className="flex shrink-0 items-center gap-2 text-xs">
                            <button
                              type="button"
                              onClick={() => moveModule(m.id, 'up')}
                              disabled={reordering || i === 0}
                              aria-label={`Move Module ${m.position} up`}
                              className="text-slate-400 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              onClick={() => moveModule(m.id, 'down')}
                              disabled={reordering || i === subjectDetail.modules.length - 1}
                              aria-label={`Move Module ${m.position} down`}
                              className="text-slate-400 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              ▼
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingModule(m)
                                setActiveModal('editModule')
                              }}
                              className="font-medium text-slate-400 hover:text-indigo-600"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                        <ul className="text-xs text-slate-500">
                          {m.materials.map((mat) => (
                            <MaterialRow
                              key={mat.id}
                              material={mat}
                              onEdit={(material) => {
                                setEditingMaterial(material)
                                setActiveModal('editMaterial')
                              }}
                              onDeleted={() => refreshSubjectDetail()}
                            />
                          ))}
                          {m.materials.length === 0 && <li className="text-slate-400">No materials yet.</li>}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {subjectDetail.has_lab && (
                <section>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-500">Practicals</h3>
                    <button
                      type="button"
                      onClick={() => setActiveModal('experiment')}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      + Add Experiment
                    </button>
                  </div>
                  {subjectDetail.experiments.length === 0 && (
                    <p className="text-sm text-slate-400">No experiments yet.</p>
                  )}
                  <div className="flex flex-col gap-2">
                    {subjectDetail.experiments.map((exp) => (
                      <div key={exp.id} className="rounded-lg border border-slate-200 bg-white p-3">
                        <p className="mb-1 text-sm font-medium text-slate-900">
                          Exp {exp.experiment_number}: {exp.title}
                        </p>
                        <ul className="text-xs text-slate-500">
                          {exp.materials.map((mat) => (
                            <MaterialRow
                              key={mat.id}
                              material={mat}
                              onEdit={(material) => {
                                setEditingMaterial(material)
                                setActiveModal('editMaterial')
                              }}
                              onDeleted={() => refreshSubjectDetail()}
                            />
                          ))}
                          {exp.materials.length === 0 && <li className="text-slate-400">No materials yet.</li>}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {(subjectDetail.modules.length > 0 || subjectDetail.experiments.length > 0) && (
                <button
                  type="button"
                  onClick={() => setActiveModal('material')}
                  className={`${primaryButtonClass} self-start`}
                >
                  + Add Material
                </button>
              )}
            </>
          )}
        </div>
      )}

      {activeModal === 'subject' && (
        <Modal title="Add Subject" onClose={() => setActiveModal(null)}>
          <AddSubjectForm
            branchId={branchId}
            semester={semester}
            onCreated={() => {
              refreshSubjects()
              setActiveModal(null)
            }}
          />
        </Modal>
      )}

      {activeModal === 'editSubject' && editingSubject && (
        <Modal title="Edit Subject" onClose={() => setActiveModal(null)}>
          <EditSubjectForm
            subject={editingSubject}
            onUpdated={() => {
              refreshSubjects()
              if (selectedSubjectId === editingSubject.id) refreshSubjectDetail(editingSubject.id)
              setActiveModal(null)
            }}
          />
        </Modal>
      )}

      {activeModal === 'module' && subjectDetail && (
        <Modal title="Add Module" onClose={() => setActiveModal(null)}>
          <AddModuleForm
            subjectId={subjectDetail.id}
            nextModuleNumber={subjectDetail.modules.length + 1}
            onCreated={() => {
              refreshSubjectDetail()
              setActiveModal(null)
            }}
          />
        </Modal>
      )}

      {activeModal === 'editModule' && editingModule && (
        <Modal title="Edit Module" onClose={() => setActiveModal(null)}>
          <EditModuleForm
            module={editingModule}
            onUpdated={() => {
              refreshSubjectDetail()
              setActiveModal(null)
            }}
          />
        </Modal>
      )}

      {activeModal === 'experiment' && subjectDetail && (
        <Modal title="Add Experiment" onClose={() => setActiveModal(null)}>
          <AddExperimentForm
            subjectId={subjectDetail.id}
            onCreated={() => {
              refreshSubjectDetail()
              setActiveModal(null)
            }}
          />
        </Modal>
      )}

      {activeModal === 'material' && subjectDetail && (
        <Modal title="Add Material" onClose={() => setActiveModal(null)}>
          <AddMaterialForm
            modules={subjectDetail.modules}
            experiments={subjectDetail.experiments}
            onCreated={() => {
              refreshSubjectDetail()
              setActiveModal(null)
            }}
          />
        </Modal>
      )}

      {activeModal === 'editMaterial' && editingMaterial && (
        <Modal title="Edit Material" onClose={() => setActiveModal(null)}>
          <EditMaterialForm
            material={editingMaterial}
            onUpdated={() => {
              refreshSubjectDetail()
              setActiveModal(null)
            }}
          />
        </Modal>
      )}

      {activeModal === 'pyq' && subjectDetail && (
        <Modal title="Add PYQ" onClose={() => setActiveModal(null)}>
          <AddPYQForm
            subjectId={subjectDetail.id}
            onCreated={() => {
              refreshSubjectDetail()
              setActiveModal(null)
            }}
          />
        </Modal>
      )}

      {activeModal === 'editPYQ' && editingPYQ && (
        <Modal title="Edit PYQ" onClose={() => setActiveModal(null)}>
          <EditPYQForm
            pyq={editingPYQ}
            onUpdated={() => {
              refreshSubjectDetail()
              setActiveModal(null)
            }}
          />
        </Modal>
      )}
    </div>
  )
}
