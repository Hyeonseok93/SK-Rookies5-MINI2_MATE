// components/common/Breadcrumb.jsx

import { Link } from 'react-router-dom'

export default function Breadcrumb({ items = [] }) {
  return (
    <div style={s.wrap}>
      {items.map((item, i) => (
        <span key={i} style={s.item}>
          {i > 0 && <span style={s.sep}>&gt;</span>}
          {item.path ? (
            <Link to={item.path} style={s.link}>{item.label}</Link>
          ) : (
            <span style={s.current}>{item.label}</span>
          )}
        </span>
      ))}
    </div>
  )
}

const s = {
  wrap: { display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16 },
  item: { display: 'flex', alignItems: 'center', gap: 4 },
  sep: { fontSize: 11, color: '#9CA3AF' },
  link: { fontSize: 12, color: '#9CA3AF', textDecoration: 'none' },
  current: { fontSize: 12, color: '#6B7280', fontWeight: 500 },
}