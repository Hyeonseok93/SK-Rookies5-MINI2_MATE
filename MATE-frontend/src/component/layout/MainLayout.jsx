import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { Box } from '@mui/material';
import ToastMessage from '../common/ToastMessage';
import ConfirmModal from '../common/ConfirmModal';
import { useUiStore } from '@/store/uiStore';

const MainLayout = () => {
  const { toast, hideToast, modal, closeModal } = useUiStore();
  
  const modalData = modal?.data || {};

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>
      <Footer />
      
      {/* 전역 토스트 메시지 그릇 */}
      <ToastMessage 
        open={Boolean(toast)}
        message={toast?.message || ''}
        severity={toast?.type || 'success'}
        onClose={hideToast}
      />

      {/* 전역 컨펌 모달 - lastModal을 사용하여 닫히는 순간 데이터 유지 */}
      <ConfirmModal 
        open={Boolean(modal)}
        title={modalData.title || '확인'}
        message={modalData.message || ''}
        confirmText={modalData.confirmText || '확인'}
        cancelText={modalData.cancelText || '취소'}
        color={modalData.color || 'primary'}
        onConfirm={modalData.onConfirm || (() => {})}
        onClose={closeModal}
      />
    </Box>
  );
};

export default MainLayout;