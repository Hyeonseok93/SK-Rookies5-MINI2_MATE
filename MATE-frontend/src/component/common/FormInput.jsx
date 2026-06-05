// components/common/FormInput.jsx

export default function FormInput({
  label, type = 'text', placeholder, value,
  onChange, status, message, required,
}) {
  const borderColor = {
    default: '#E5E7EB',
    focus:   '#6C63FF',
    success: '#10B981',
    error:   '#EF4444',
  }[status || 'default']

  const messageColor = { success: '#10B981', error: '#EF4444' }[status]

  return (
    <div style={s.wrap}>
      {label && (
        <label style={s.label}>
          {label} {required && <span style={s.req}>*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{ ...s.input, borderColor }}
      />
      {message && (
        <div style={{ ...s.message, color: messageColor }}>
          {status === 'success' ? '✓' : '✗'} {message}
        </div>
      )}
    </div>
  )
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: 12, fontWeight: 700, color: '#1A1A2E' },
  req: { color: '#EF4444', fontSize: 11 },
  input: {
    height: 40, border: '1.5px solid #E5E7EB', borderRadius: 10,
    padding: '0 14px', fontSize: 13, color: '#1A1A2E',
    background: '#FAFAFA', outline: 'none', width: '100%',
    fontFamily: 'inherit',
  },
  message: { fontSize: 11, marginTop: 2 },
}