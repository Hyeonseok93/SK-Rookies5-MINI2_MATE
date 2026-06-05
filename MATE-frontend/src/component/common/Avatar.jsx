// components/common/Avatar.jsx

export default function Avatar({ name = '?', size = 'md', src }) {
  const colors = [
    'linear-gradient(135deg, #6366F1 0%, #A78BFA 100%)', // Indigo to Violet
    'linear-gradient(135deg, #F43F5E 0%, #FB7185 100%)', // Rose
    'linear-gradient(135deg, #10B981 0%, #34D399 100%)', // Emerald
    'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)', // Amber
  ]
  const colorIndex = name.charCodeAt(0) % colors.length
  const bg = colors[colorIndex]
  const sizes = { sm: 24, md: 32, lg: 48, xl: 110 }
  const fontSize = { sm: 12, md: 16, lg: 22, xl: 48 }
  const sz = sizes[size] || sizes.md

  if (src) return (
    <img src={src} alt={name}
      style={{ width: sz, height: sz, borderRadius: '50%', objectFit: 'cover' }} />
  )

  return (
    <div style={{
      width: sz, height: sz, borderRadius: '50%',
      background: bg, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: fontSize[size] || fontSize.md, 
      fontWeight: 800, 
      flexShrink: 0,
      fontFamily: "'Pretendard', 'Inter', sans-serif",
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
      textShadow: '0 2px 4px rgba(0,0,0,0.2)'
    }}>
      {name[0].toUpperCase()}
    </div>
  )
}