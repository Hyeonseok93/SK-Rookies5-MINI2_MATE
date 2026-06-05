import React from 'react';
import { Button as MuiButton } from '@mui/material';

/**
 * 공통 커스텀 버튼 컴포넌트
 * @param {Object} props - MUI Button의 모든 props를 상속받습니다.
 * @param {string} variant - 'primary' | 'secondary' | 'ghost' | 'danger' (기존 커스텀 타입 지원용)
 */
const CustomButton = ({ 
  children, 
  variant = 'primary', 
  sx = {}, 
  ...props 
}) => {
  
  // 기존 커스텀 variant를 MUI 스타일로 매핑
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          bgcolor: '#6C63FF',
          color: '#fff',
          '&:hover': { bgcolor: '#5A52E5' },
          boxShadow: '0 4px 14px rgba(108,99,255,0.35)',
        };
      case 'secondary':
        return {
          bgcolor: '#fff',
          color: '#6B7280',
          border: '1.5px solid #E5E7EB',
          '&:hover': { bgcolor: '#F9FAFB', borderColor: '#D1D5DB' },
        };
      case 'ghost':
        return {
          bgcolor: 'transparent',
          color: '#6B7280',
          border: 'none',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
        };
      case 'danger':
        return {
          bgcolor: '#EF4444',
          color: '#fff',
          '&:hover': { bgcolor: '#DC2626' },
        };
      default:
        return {};
    }
  };

  return (
    <MuiButton
      sx={{
        borderRadius: 99,
        textTransform: 'none',
        fontWeight: 600,
        px: 3,
        py: 1,
        ...getVariantStyles(),
        ...sx,
      }}
      {...props} // component={Link}, to 등 모든 props 전달
    >
      {children}
    </MuiButton>
  );
};

export default CustomButton;
