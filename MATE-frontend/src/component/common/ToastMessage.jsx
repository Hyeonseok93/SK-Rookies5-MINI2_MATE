import React from 'react';
import { Snackbar, Alert, Typography, Box } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';

/**
 * 프로젝트 디자인 시스템에 맞춘 공용 토스트 메시지 컴포넌트
 * @param {boolean} open - 표시 여부
 * @param {string} message - 표시할 메시지
 * @param {'success' | 'error' | 'info' | 'warning'} severity - 메시지 종류
 * @param {function} onClose - 닫기 이벤트 핸들러
 */
const ToastMessage = ({ open, message, severity = 'success', onClose }) => {
  const getIcon = () => {
    switch (severity) {
      case 'success': return <CheckCircleOutlineIcon sx={{ fontSize: 28 }} />;
      case 'error': return <ErrorOutlineIcon sx={{ fontSize: 28 }} />;
      case 'warning': return <ReportProblemOutlinedIcon sx={{ fontSize: 28 }} />;
      default: return <InfoOutlinedIcon sx={{ fontSize: 28 }} />;
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ mt: 8 }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        icon={getIcon()}
        sx={{
          width: '100%',
          minWidth: { xs: '300px', sm: '400px' },
          borderRadius: 4,
          bgcolor: '#ffffff',
          color: 'text.primary',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: '1px solid',
          borderColor: 
            severity === 'success' ? 'success.light' : 
            severity === 'error' ? 'error.light' : 
            severity === 'warning' ? 'warning.light' : 'info.light',
          px: 3,
          py: 1.5,
          alignItems: 'center',
          '& .MuiAlert-message': {
            width: '100%',
          },
          '& .MuiAlert-icon': {
            mr: 2,
            color: 
              severity === 'success' ? 'success.main' : 
              severity === 'error' ? 'error.main' : 
              severity === 'warning' ? 'warning.main' : 'info.main',
          }
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1rem', mb: 0.2 }}>
            {severity === 'success' && 'Success'}
            {severity === 'error' && 'Error'}
            {severity === 'warning' && 'Warning'}
            {severity === 'info' && 'Notice'}
          </Typography>
          <Typography sx={{ fontWeight: 500, fontSize: '0.9rem', opacity: 0.8 }}>
            {message}
          </Typography>
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default ToastMessage;
