// components/common/Tag.jsx

export default function Tag({ label }) {
  return (
    <span style={s.tag}>{label}</span>
  )
}

const s = {
  tag: {
    fontSize: 11, fontWeight: 600, padding: '4px 10px',
    borderRadius: 99, background: '#EDE9FF', color: '#6C63FF',
    display: 'inline-block',
  },
}