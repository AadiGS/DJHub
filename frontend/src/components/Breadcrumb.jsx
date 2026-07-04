import { Link } from 'react-router-dom'

// items: [{ label, to }] — omit `to` on the last (current) item
export default function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-sm text-slate-500">
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-slate-300">/</span>}
            {isLast || !item.to ? (
              <span className="font-medium text-slate-700">{item.label}</span>
            ) : (
              <Link to={item.to} state={item.state} className="hover:text-indigo-600">
                {item.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
