// components/common/Badge.jsx

export default function Badge({ status }) {
  const map = {
    RECRUITING:    { label: '모집중',   bg: '#DCFCE7', color: '#166534' },
    DEADLINE_SOON: { label: '마감임박', bg: '#FEF3C7', color: '#92400E' },
    CLOSED:        { label: '마감됨',   bg: '#F3F4F6', color: '#6B7280' },
    LEADER:        { label: '방장',     bg: '#EDE9FF', color: '#6C63FF' },
    MEMBER:        { label: '멤버',     bg: '#F3F4F6', color: '#6B7280' },
    NOTICE:        { label: '공지',     bg: '#EDE9FF', color: '#6C63FF' },
    PENDING:       { label: '대기중',   bg: '#FEF3C7', color: '#92400E' },
    APPROVED:      { label: '승인됨',   bg: '#DCFCE7', color: '#166534' },
    REJECTED:      { label: '거절됨',   bg: '#FEE2E2', color: '#991B1B' },
  }

  const { label, bg, color } = map[status] || { label: status, bg: '#F3F4F6', color: '#6B7280' }

  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '3px 10px',
      borderRadius: 99, background: bg, color,
    }}>
      {label}
    </span>
  )
}