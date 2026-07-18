import React, { useState, useEffect } from 'react';
import { Box, Typography, Stack, Card, CardContent, Container, LinearProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// 공통 컴포넌트
import Breadcrumb from '../component/common/Breadcrumb';
import CustomButton from '../component/common/Button';
import { postApi } from '../api/postApi';
import { useUiStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import ProjectFormFields from '../component/common/ProjectFormFields';
import { getApiErrorMessage } from '../utils/apiUtils';
import { toApiOnOffline } from '../utils/statusUtils';

/**
 * 모집글 작성 페이지 (REST API 설계서 v1.1 반영)
 */
const PostWritePage = () => {
  const navigate = useNavigate();
  const { showToast } = useUiStore();
  const { user: currentUser } = useAuthStore();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 오늘 날짜 기준 데이터 생성
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
  const years = Array.from({ length: 11 }, (_, i) => currentYear + i);
  
  // 1. 상태 관리
  const [formData, setFormData] = useState({
    category: 'PROJECT',
    title: '',
    recruitCount: '',
    techStacks: [],
    endDate: '', 
    onOffline: '온라인',
    content: ''
  });

  const [dateParts, setDateParts] = useState({ year: '', month: '', day: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 날짜 선택 가용 범위 계산
  const availableMonths = dateParts.year === currentYear
    ? Array.from({ length: 12 - currentMonth + 1 }, (_, i) => currentMonth + i)
    : Array.from({ length: 12 }, (_, i) => i + 1);

  const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();
  const availableDays = (() => {
    const selYear = parseInt(dateParts.year);
    const selMonth = parseInt(dateParts.month);
    if (!selYear || !selMonth) return Array.from({ length: 31 }, (_, i) => i + 1);
    const totalDays = getDaysInMonth(selYear, selMonth);
    if (selYear === currentYear && selMonth === currentMonth) {
      return Array.from({ length: totalDays - currentDay + 1 }, (_, i) => currentDay + i);
    }
    return Array.from({ length: totalDays }, (_, i) => i + 1);
  })();

  const handleChange = (field) => (e) => {
    let value = e.target.value;
    if (field === 'recruitCount' && value !== '') {
      value = Math.max(1, parseInt(value) || 1);
    }
    setFormData({ ...formData, [field]: value });
  };

  const handleDateChange = (part) => (e) => {
    const newVal = e.target.value;
    const newDateParts = { ...dateParts, [part]: newVal };
    setDateParts(newDateParts);

    if (newDateParts.year && newDateParts.month && newDateParts.day) {
      const formattedDate = `${newDateParts.year}-${String(newDateParts.month).padStart(2, '0')}-${String(newDateParts.day).padStart(2, '0')}`;
      setFormData(prev => ({ ...prev, endDate: formattedDate }));
    }
  };

  // 등록 제출 (v1.1: POST /api/projects)
  const handleSubmit = async () => {
    if (!formData.title || !formData.recruitCount || formData.techStacks.length === 0 || !formData.content || !formData.endDate) {
      showToast('모든 필수 항목(*)을 입력해주세요.', 'warning');
      return;
    }

    if (formData.title.trim().length < 5) {
      showToast('제목은 5글자 이상 입력해주세요.', 'warning');
      return;
    }

      // 💡 모집 인원 최대 제한 (본인 포함 +1 해서 보내므로 19명까지)
    if (Number(formData.recruitCount) > 19) {
      showToast('모집 인원은 본인 제외 최대 19명까지 가능합니다.', 'warning');
      return;
    }

    if (!currentUser) {
      showToast('로그인이 필요합니다.', 'error');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        ownerId: currentUser.userId, // v1.1 규격: ownerId 명시
        onOffline: toApiOnOffline(formData.onOffline),
        recruitCount: Number(formData.recruitCount) + 1, // 본인 포함 전체 정원으로 변환
        status: 'RECRUITING' // 초기 상태 설정
      };

      const response = await postApi.createPost(payload);
      
      const newPostId = response?.id || response?.projectId;
      showToast('모집글이 성공적으로 등록되었습니다! 🚀', 'success');
      navigate(`/posts/${newPostId}`);
    } catch (err) {
      console.error('등록 실패:', err);
      showToast(getApiErrorMessage(err, '등록 중 오류가 발생했습니다.'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100vh', pt: '100px', pb: 10 }}>
      {isSubmitting && <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2000 }} />}
      <Container maxWidth="lg">
        <Breadcrumb items={[{ label: '홈', path: '/' }, { label: '프로젝트 탐색', path: '/#new-opportunities' }, { label: '모집글 작성' }]} />
        
        <Box sx={{ mt: 3, mb: 5 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: '#111827' }}>🚀 모집글 작성</Typography>
          <Typography variant="body1" sx={{ color: '#6B7280', fontWeight: 500 }}>함께할 팀원을 찾는 모집글을 작성해 보세요.</Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
          <Box sx={{ flex: 8 }}>
            <Stack spacing={4}>
              <ProjectFormFields formData={formData} setFormData={setFormData} dateParts={dateParts} onChange={handleChange} onDateChange={handleDateChange} years={years} months={availableMonths} days={availableDays} />

              <Stack direction="row" justifyContent="center" spacing={2} sx={{ pt: 2 }}>
                <CustomButton variant="primary" onClick={handleSubmit} disabled={isSubmitting} sx={{ px: 6, height: 56, fontWeight: 900 }}>🚀 모집글 등록하기</CustomButton>
                <CustomButton variant="secondary" onClick={() => navigate(-1)} sx={{ px: 6, height: 56 }}>취소</CustomButton>
              </Stack>
            </Stack>
          </Box>

          <Box sx={{ flex: 4 }}>
            <Stack spacing={3} sx={{ position: 'sticky', top: '100px' }}>
              <Card elevation={0} sx={{ borderRadius: 5, bgcolor: '#EEF2FF', border: '1px solid #E0E7FF' }}>
                <CardContent sx={{ p: 4 }}><Typography sx={{ fontWeight: 900, mb: 2.5, color: '#4F46E5', display: 'flex', alignItems: 'center', gap: 1 }}>💡 작성 꿀팁</Typography><Stack spacing={2}><Box><Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E1B4B' }}>목표를 구체적으로!</Typography><Typography variant="body2" sx={{ color: '#4338CA', mt: 0.5 }}>'무엇'을 '어떻게' 만들지 구체적일수록 매력적인 공고가 됩니다.</Typography></Box></Stack></CardContent>
              </Card>
              <Card elevation={0} sx={{ borderRadius: 5, border: '1px solid #EEEEEE' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography sx={{ fontWeight: 900, mb: 3 }}>✅ 등록 전 체크리스트</Typography>
                  {[ { label: '모집 유형 및 제목', done: !!formData.category && formData.title.trim().length > 0 }, { label: '모집 인원 및 마감일', done: Number(formData.recruitCount) > 0 && !!formData.endDate }, { label: '기술 스택 (최소 1개)', done: formData.techStacks.length > 0 }, { label: '상세 내용 작성', done: formData.content.trim().length > 0 } ].map((item, i) => (
                    <Stack key={i} direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                      <CheckCircleIcon sx={{ fontSize: 22, color: item.done ? '#22C55E' : '#E5E7EB' }} />
                      <Typography variant="body2" sx={{ fontWeight: item.done ? 800 : 500, color: item.done ? '#1F2937' : '#9CA3AF' }}>{item.label}</Typography>
                    </Stack>
                  ))}
                </CardContent>
              </Card>
            </Stack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default PostWritePage;
