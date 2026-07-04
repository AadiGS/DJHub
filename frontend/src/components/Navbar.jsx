import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            DJ
          </span>
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            DJ Hub
          </span>
        </Link>
      </div>
    </header>
  )
}
