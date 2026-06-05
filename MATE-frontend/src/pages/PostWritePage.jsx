import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Stack, Divider, 
  FormLabel, Chip, Card, CardContent, 
  Container, Paper, Autocomplete, MenuItem, LinearProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CodeIcon from '@mui/icons-material/Code';
import DescriptionIcon from '@mui/icons-material/Description';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

// 공통 컴포넌트
import Breadcrumb from '../component/common/Breadcrumb';
import CustomButton from '../component/common/Button';
import { postApi } from '../api/postApi';
import { useUiStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { TECH_STACK_OPTIONS } from '../constants/techStacks';

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

  const handleTechStacksChange = (event, newValue) => {
    const processedValue = newValue.map(opt => typeof opt === 'string' ? opt : (opt.inputValue || opt));
    setFormData({ ...formData, techStacks: processedValue });
  };

  // 진행 방식 한글 -> 영문 매핑 (v1.1 규격)
  const mapOnOffline = (value) => {
    const map = { '온라인': 'ONLINE', '오프라인': 'OFFLINE', '온/오프라인': 'BOTH' };
    return map[value] || 'ONLINE';
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
        onOffline: mapOnOffline(formData.onOffline),
        recruitCount: Number(formData.recruitCount) + 1, // 본인 포함 전체 정원으로 변환
        status: 'RECRUITING' // 초기 상태 설정
      };

      const response = await postApi.createPost(payload);
      
      const newPostId = response?.id || response?.projectId;
      showToast('모집글이 성공적으로 등록되었습니다! 🚀', 'success');
      navigate(`/posts/${newPostId}`);
    } catch (err) {
      console.error('등록 실패:', err);
      showToast(err.error?.message || '등록 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100vh', pt: '100px', pb: 10 }}>
      {isSubmitting && <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2000 }} />}
      <Container maxWidth="lg">
        <Breadcrumb items={[{ label: '홈', path: '/' }, { label: '프로젝트 탐색', path: '/posts' }, { label: '모집글 작성' }]} />
        
        <Box sx={{ mt: 3, mb: 5 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: '#111827' }}>🚀 모집글 작성</Typography>
          <Typography variant="body1" sx={{ color: '#6B7280', fontWeight: 500 }}>함께할 팀원을 찾는 모집글을 작성해 보세요.</Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
          <Box sx={{ flex: 8 }}>
            <Stack spacing={4}>
              {/* 1. 기본 정보 섹션 */}
              <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: '1px solid #EEEEEE', borderTop: '4px solid #6C63FF' }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 4 }}><DescriptionIcon sx={{ color: '#6C63FF' }} /><Typography variant="h6" sx={{ fontWeight: 900 }}>기본 정보</Typography></Stack>
                <Box sx={{ mb: 4 }}>
                  <FormLabel sx={{ fontWeight: 800, mb: 1.5, display: 'block', color: '#374151' }}>모집 유형 *</FormLabel>
                  <Stack direction="row" spacing={2}>
                    {['PROJECT', 'STUDY'].map((type) => (
                      <Box key={type} onClick={() => setFormData({...formData, category: type})} sx={{ flex: 1, p: 2, borderRadius: 3, cursor: 'pointer', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, transition: '0.2s', borderColor: formData.category === type ? '#6C63FF' : '#F3F4F6', bgcolor: formData.category === type ? '#F5F3FF' : 'white', color: formData.category === type ? '#6C63FF' : '#6B7280', fontWeight: 800 }}>
                        {formData.category === type ? <RadioButtonCheckedIcon /> : <RadioButtonUncheckedIcon />}
                        <Typography sx={{ fontWeight: 800 }}>{type === 'PROJECT' ? '💻 프로젝트' : '📚 스터디'}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
                <Box>
                  <FormLabel sx={{ fontWeight: 800, mb: 1.5, display: 'block', color: '#374151' }}>제목 *</FormLabel>
                  <TextField fullWidth value={formData.title} onChange={handleChange('title')} placeholder="함께하고 싶은 열정이 느껴지는 제목을 지어주세요! (5글자 이상)" variant="outlined" sx={inputStyle} />
                </Box>
              </Paper>

              {/* 2. 모집 조건 섹션 */}
              <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: '1px solid #EEEEEE' }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 4 }}><GroupAddIcon sx={{ color: '#6C63FF' }} /><Typography variant="h6" sx={{ fontWeight: 900 }}>모집 조건</Typography></Stack>
                <Stack spacing={4}>
                  <Stack direction="row" spacing={3}>
                    <Box sx={{ flex: 0.7 }}><FormLabel sx={{ fontWeight: 800, mb: 1.5, display: 'block', color: '#374151' }}>모집 인원 *</FormLabel><TextField fullWidth type="number" value={formData.recruitCount} onChange={handleChange('recruitCount')} placeholder="본인 제외 인원 (명)" sx={inputStyle} /></Box>
                    <Box sx={{ flex: 1.3 }}>
                      <FormLabel sx={{ fontWeight: 800, mb: 1.5, display: 'block', color: '#374151' }}>마감 일자 *</FormLabel>
                      <Stack direction="row" spacing={1}>
                        <TextField select fullWidth value={dateParts.year} onChange={handleDateChange('year')} sx={inputStyle}>{years.map(y => <MenuItem key={y} value={y}>{y}년</MenuItem>)}</TextField>
                        <TextField select fullWidth value={dateParts.month} onChange={handleDateChange('month')} sx={inputStyle}>{availableMonths.map(m => <MenuItem key={m} value={m}>{m}월</MenuItem>)}</TextField>
                        <TextField select fullWidth value={dateParts.day} onChange={handleDateChange('day')} sx={inputStyle}>{availableDays.map(d => <MenuItem key={d} value={d}>{d}일</MenuItem>)}</TextField>
                      </Stack>
                    </Box>
                  </Stack>
                  <Box>
                    <FormLabel sx={{ fontWeight: 800, mb: 1.5, display: 'block', color: '#374151' }}>진행 방식 *</FormLabel>
                    <Stack direction="row" sx={{ bgcolor: '#F3F4F6', borderRadius: 3, p: 0.5 }}>{['온라인', '오프라인', '온/오프라인'].map((m) => ( <Box key={m} onClick={() => setFormData({...formData, onOffline: m})} sx={{ flex: 1, py: 1.5, textAlign: 'center', cursor: 'pointer', borderRadius: 2.5, bgcolor: formData.onOffline === m ? 'white' : 'transparent', color: formData.onOffline === m ? '#6C63FF' : '#6B7280', fontWeight: 800, transition: '0.2s', boxShadow: formData.onOffline === m ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}>{m}</Box> ))}</Stack>
                  </Box>
                  <Box><FormLabel sx={{ fontWeight: 800, mb: 1.5, display: 'block', color: '#374151' }}>기술 스택 *</FormLabel><Autocomplete multiple freeSolo value={formData.techStacks} onChange={handleTechStacksChange} options={TECH_STACK_OPTIONS} renderInput={(params) => <TextField {...params} placeholder="스택 선택 또는 입력" sx={inputStyle} />} renderTags={(val, getTagProps) => val.map((opt, i) => { const { key, ...p } = getTagProps({ index: i }); return <Chip key={key} label={opt} {...p} sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', fontWeight: 800 }} />; })} /></Box>
                </Stack>
              </Paper>

              {/* 3. 상세 소개 섹션 */}
              <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: '1px solid #EEEEEE' }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 4 }}><CodeIcon sx={{ color: '#6C63FF' }} /><Typography variant="h6" sx={{ fontWeight: 900 }}>상세 소개</Typography></Stack>
                <TextField multiline rows={12} fullWidth value={formData.content} onChange={handleChange('content')} placeholder="프로젝트의 목적, 방식, 커리큘럼 등을 자세히 적어주세요. 🚀" sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F9FAFB', borderRadius: 1.5, p: 3, lineHeight: 1.6 } }} />
              </Paper>

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

const inputStyle = { '& .MuiOutlinedInput-root': { bgcolor: '#F9FAFB', borderRadius: 3, fontWeight: 600, '& fieldset': { border: '1px solid #E5E7EB' } } };

export default PostWritePage;
