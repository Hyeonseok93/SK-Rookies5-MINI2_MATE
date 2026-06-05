import React from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Typography, Box, Stack 
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CustomButton from './Button';

const ConfirmModal = ({ open, title, message, onConfirm, onClose, confirmText = '확인', cancelText = '취소', color = 'primary' }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: { borderRadius: 5, p: 2, minWidth: '380px' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pt: 3 }}>
        <WarningAmberIcon sx={{ color: color === 'error' ? '#EF4444' : '#6C63FF', fontSize: 32 }} />
        <Typography variant="h6" sx={{ fontWeight: 900, color: '#111827' }}>{title}</Typography>
      </DialogTitle>
      
      <DialogContent sx={{ py: 1 }}>
        <Typography variant="body1" sx={{ color: '#6B7280', fontWeight: 500, lineHeight: 1.6 }}>
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1.5 }}>
        <CustomButton 
          variant={color === 'error' ? 'danger' : 'primary'}
          onClick={() => {
            onConfirm();
            onClose();
          }}
          sx={{ flex: 1, height: 48, fontWeight: 900 }}
        >
          {confirmText}
        </CustomButton>
        <CustomButton 
          variant="secondary" 
          onClick={onClose}
          sx={{ flex: 1, height: 48 }}
        >
          {cancelText}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmModal;
