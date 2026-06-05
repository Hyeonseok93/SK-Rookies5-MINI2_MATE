// components/common/Pagination.jsx
import React from 'react';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div style={s.wrap}>
      {/* 처음으로 */}
      <button
        style={s.btn}
        onClick={() => onPageChange(0)}
        disabled={page === 0}
        title="처음으로"
      >
        {"|◀"}
      </button>

      {/* 이전 */}
      <button
        style={s.btn}
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        title="이전"
      >
        {"◀"}
      </button>

      {/* 페이지 번호 */}
      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i}
          style={i === page ? s.btnActive : s.btn}
          onClick={() => onPageChange(i)}
        >
          {i + 1}
        </button>
      ))}

      {/* 다음 */}
      <button
        style={s.btn}
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages - 1}
        title="다음"
      >
        {"▶"}
      </button>

      {/* 마지막으로 */}
      <button
        style={s.btn}
        onClick={() => onPageChange(totalPages - 1)}
        disabled={page === totalPages - 1}
        title="마지막으로"
      >
        {"▶|"}
      </button>
    </div>
  );
}

const s = {
  wrap: { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center',
    gap: 6, 
    marginTop: 40 
  },
  btn: {
    width: 36, 
    height: 36, 
    borderRadius: 8,
    border: '1px solid #E5E7EB', 
    background: '#fff',
    color: '#6B7280', 
    cursor: 'pointer', 
    fontSize: 12,
    fontWeight: 700,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 0.2s',
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed'
    },
    '&:hover': {
      borderColor: '#6C63FF',
      color: '#6C63FF'
    }
  },
  btnActive: {
    width: 36, 
    height: 36, 
    borderRadius: 8,
    border: '1px solid #6C63FF', 
    background: '#6C63FF',
    color: '#fff', 
    cursor: 'default', 
    fontSize: 13,
    fontWeight: 800,
    boxShadow: '0 4px 10px rgba(108,99,255,0.2)'
  },
};
