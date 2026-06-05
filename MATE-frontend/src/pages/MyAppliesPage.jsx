import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Box, Typography, Paper, Stack, 
  Divider, Chip, LinearProgress, IconButton, Tooltip
} from '@mui/material';

// Icons
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

// API & Store & Utils
import { authApi } from '../api/authApi';
import { postApi } from '../api/postApi';
import { useUiStore } from '../store/uiStore';
import Breadcrumb from '../component/common/Breadcrumb';
import CustomButton from '../component/common/Button';
import Avatar from '../component/common/Avatar';

const MyAppliesPage = () => {
  const navigate = useNavigate();
  const { showToast, openModal } = useUiStore();
  
  const [applies, setApplies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 데이터 로드 함수
  const fetchApplies = useCallback(async () => {
    setIsLoading(true);
    try {
      // 설계서 v1.1: GET /api/users/me/applications
      const data = await authApi.getMyApplications();
      setApplies(data || []);
    } catch (err) {
      console.error("Fetch applies error:", err);
      showToast(err.error?.message || '지원 내역을 불러오는데 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchApplies();
  }, [fetchApplies]);

  // 지원 취소 핸들러
  const handleCancelApplication = (applyId) => {
    openModal('confirm', {
      title: '지원 취소 확인',
      message: '정말로 이 프로젝트 지원을 취소하시겠습니까? 취소 후에는 복구할 수 없습니다.',
      confirmText: '지원 취소',
      color: 'error',
      onConfirm: async () => {
        try {
          // 설계서 v1.1: DELETE /api/applications/{id}
          await postApi.cancelApplication(applyId);
          showToast('지원이 성공적으로 취소되었습니다.', 'success');
          fetchApplies(); // 목록 새로고침
        } catch (err) {
          console.error("Cancel apply error:", err);
          showToast(err.error?.message || '지원 취소 중 오류가 발생했습니다.', 'error');
        }
      }
    });
  };

  // 날짜 포맷팅
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.split('T')[0].replace(/-/g, '.');
  };

  if (isLoading) return <Box sx={{ width: '100%', mt: '100px' }}><LinearProgress /></Box>;

  return (
    <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100vh', pt: '100px', pb: 10 }}>
      <Container maxWidth="lg">
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'white', border: '1px solid #E5E7EB' }}>
            <ArrowBackIosNewIcon sx={{ fontSize: 14, color: '#4B5563' }} />
          </IconButton>
          <Breadcrumb items={[{ label: '홈', path: '/' }, { label: '마이페이지', path: '/mypage' }, { label: '내 신청 현황' }]} />
        </Stack>

        <Box sx={{ mb: 5 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#111827', mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <AssignmentTurnedInIcon color="primary" sx={{ fontSize: 40 }} /> 내 신청 현황
          </Typography>
          <Typography variant="body1" sx={{ color: '#6B7280', fontWeight: 500 }}>
            내가 참여 신청한 프로젝트와 스터디의 진행 상태를 확인하세요.
          </Typography>
        </Box>

        <Stack spacing={3}>
          {applies.length > 0 ? (
            applies.map((apply) => (
              <ApplyCard 
                key={apply.id || apply.applyId} 
                apply={apply} 
                onCancel={() => handleCancelApplication(apply.id || apply.applyId)}
                onTitleClick={() => navigate(`/posts/${apply.projectId}`)}
                formatDate={formatDate}
              />
            ))
          ) : (
            <Paper elevation={0} sx={{ py: 15, textAlign: 'center', borderRadius: 6, border: '1px dashed #E5E7EB', bgcolor: 'white' }}>
              <AssignmentTurnedInIcon sx={{ fontSize: 60, color: '#E5E7EB', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 700 }}>아직 신청한 내역이 없습니다.</Typography>
              <CustomButton 
                variant="primary" 
                onClick={() => navigate('/#new-opportunities')} 
                sx={{ mt: 3, px: 4 }}
              >
                멋진 팀 찾아보기
              </CustomButton>
            </Paper>
          )}
        </Stack>
      </Container>
    </Box>
  );
};

// 내부 카드 컴포넌트
const ApplyCard = ({ apply, onCancel, onTitleClick, formatDate }) => {
  const statusConfig = {
    PENDING: { label: '대기 중', color: '#D97706', bg: '#FFFBEB', icon: <AccessTimeIcon sx={{ fontSize: 16 }} /> },
    ACCEPTED: { label: '승인됨', color: '#10B981', bg: '#ECFDF5', icon: <CheckCircleOutlineIcon sx={{ fontSize: 16 }} /> },
    REJECTED: { label: '거절됨', color: '#EF4444', bg: '#FEF2F2', icon: <HighlightOffIcon sx={{ fontSize: 16 }} /> }
  };

  const config = statusConfig[apply.status] || statusConfig.PENDING;

  return (
    <Paper elevation={0} sx={{ 
      p: { xs: 3, md: 4 }, borderRadius: 5, border: '1px solid #F0F0F0', bgcolor: 'white',
      transition: '0.2s', '&:hover': { boxShadow: '0 12px 24px rgba(0,0,0,0.04)', transform: 'translateY(-2px)' }
    }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
            <Chip 
              icon={config.icon}
              label={config.label} 
              sx={{ fontWeight: 900, bgcolor: config.bg, color: config.color, borderRadius: 1.5, height: 28 }} 
            />
            <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 700 }}>
              신청일: {formatDate(apply.createdAt)}
            </Typography>
          </Stack>

          <Typography 
            variant="h6" 
            onClick={onTitleClick}
            sx={{ fontWeight: 900, color: '#111827', mb: 2, cursor: 'pointer', '&:hover': { color: '#6366F1', textDecoration: 'underline' } }}
          >
            {apply.projectTitle}
          </Typography>

          <Box sx={{ p: 2.5, bgcolor: '#F9FAFB', borderRadius: 3, border: '1px solid #F3F4F6' }}>
            <Typography variant="caption" sx={{ color: '#6366F1', fontWeight: 900, display: 'block', mb: 1, letterSpacing: '0.05em' }}>
              MY MESSAGE
            </Typography>
            <Typography variant="body2" sx={{ color: '#4B5563', fontWeight: 500, lineHeight: 1.6 }}>
              {apply.message}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ minWidth: { md: '200px' }, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 2 }}>
          <Box sx={{ textAlign: { md: 'right' } }}>
            <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 800, display: 'block', mb: 0.5 }}>지원 분야</Typography>
            <Typography variant="body2" sx={{ fontWeight: 900, color: '#111827' }}>{apply.applicantPosition || '포지션 미지정'}</Typography>
          </Box>
          
          <Stack direction="row" spacing={1}>
            {apply.status === 'PENDING' && (
              <Tooltip title="지원을 취소합니다">
                <IconButton 
                  onClick={onCancel}
                  sx={{ color: '#EF4444', bgcolor: '#FEF2F2', '&:hover': { bgcolor: '#FEE2E2' }, borderRadius: 2 }}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Tooltip>
            )}
            <CustomButton 
              variant="secondary" 
              onClick={onTitleClick}
              sx={{ fontWeight: 800, borderRadius: 2, px: 3 }}
            >
              공고 보기
            </CustomButton>
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
};

export default MyAppliesPage;
