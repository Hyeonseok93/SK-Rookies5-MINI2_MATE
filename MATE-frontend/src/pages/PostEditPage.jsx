import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, TextField, Stack, Divider, 
  FormLabel, Chip, Card, CardContent, 
  Container, Paper, Autocomplete, MenuItem, LinearProgress
} from '@mui/material';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CodeIcon from '@mui/icons-material/Code';
import DescriptionIcon from '@mui/icons-material/Description';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/Save';
import LockClockIcon from '@mui/icons-material/LockClock';

// 공통 컴포넌트
import Breadcrumb from '../component/common/Breadcrumb';
import CustomButton from '../component/common/Button';
import { postApi } from '../api/postApi';
import { useUiStore } from '../store/uiStore';
import { TECH_STACK_OPTIONS } from '../constants/techStacks';
import { getOnOfflineLabel } from '../utils/statusUtils';

/**
 * 모집글 수정 페이지 (REST API 설계서 v1.1 반영)
 */
const PostEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, openModal } = useUiStore();

  // 오늘 날짜 기준 데이터 생성
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const currentYear = todayDate.getFullYear();
  const currentMonth = todayDate.getMonth() + 1;
  const currentDay = todayDate.getDate();

  const years = Array.from({ length: 11 }, (_, i) => currentYear + i);

  // 1. 상태 관리
  const [formData, setFormData] = useState({
    category: 'PROJECT',
    title: '',
    recruitCount: '',
    techStacks: [],
    endDate: '', 
    onOffline: '온라인',
    content: '',
    status: 'RECRUITING', 
    currentCount: 0 
  });

  const [dateParts, setDateParts] = useState({ year: '', month: '', day: '' });
  const [isLoading, setIsLoading] = useState(true);

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

  // 데이터 불러오기
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const post = await postApi.getPostDetail(id);
        
        setFormData({
          category: post.category || 'PROJECT',
          title: post.title || '',
          recruitCount: post.recruitCount ? post.recruitCount - 1 : '', // 전체 정원에서 본인 제외
          techStacks: post.techStacks || [],
          endDate: post.endDate || '',
          onOffline: getOnOfflineLabel(post.onOffline),
          content: post.content || '',
          status: post.status || 'RECRUITING', 
          currentCount: post.currentCount || 0
        });

        if (post.endDate) {
          const [y, m, d] = post.endDate.split('-').map(Number);
          setDateParts({ year: y || '', month: m || '', day: d || '' });
        }
      } catch (err) {
        console.error('불러오기 실패:', err);
        showToast(err.error?.message || '게시글 정보를 불러오는 데 실패했습니다.', 'error');
        navigate('/posts');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [id, showToast, navigate]);

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

  // 수정 제출 (v1.1: PATCH /api/projects/{id})
  const handleSubmit = async () => {
    if (!formData.title || !formData.recruitCount || formData.techStacks.length === 0 || !formData.content || !formData.endDate) {
      showToast('모든 필수 항목(*)을 입력해주세요.', 'warning');
      return;
    }

    if (formData.title.trim().length < 5) {
      showToast('제목은 5글자 이상 입력해주세요.', 'warning');
      return;
    }

    const totalRecruitCount = Number(formData.recruitCount) + 1;

    if (totalRecruitCount < formData.currentCount) {
      showToast(`전체 정원(${totalRecruitCount}명)은 현재 참여 중인 팀원(${formData.currentCount}명)보다 적을 수 없습니다.`, 'error');
      return;
    }

    try {
      const updateData = {
        category: formData.category,
        title: formData.title,
        content: formData.content,
        recruitCount: totalRecruitCount,
        onOffline: mapOnOffline(formData.onOffline),
        endDate: formData.endDate,
        techStacks: formData.techStacks
      };

      await postApi.updatePost(id, updateData);
      showToast('수정이 완료되었습니다! 🚀', 'success');
      navigate(`/posts/${id}`);
    } catch (err) {
      console.error('수정 실패:', err);
      showToast(err.error?.message || '수정 중 오류가 발생했습니다.', 'error');
    }
  };

  // 조기 마감 (v1.1: PATCH /api/projects/{id}/close)
  const handleClosePost = () => {
    openModal('confirm', {
      title: '모집 조기 마감',
      message: '정말 이 모집글을 조기 마감하시겠습니까? 마감 후에는 재모집 조건을 충족해야 다시 열 수 있습니다.',
      confirmText: '마감하기',
      color: 'primary',
      onConfirm: async () => {
        try {
          await postApi.closePost(id);
          showToast('모집이 마감되었습니다.', 'info');
          navigate(`/posts/${id}`);
        } catch (err) {
          showToast(err.error?.message || '마감 처리 중 오류가 발생했습니다.', 'error');
        }
      }
    });
  };

  // 재모집 (v1.1: PATCH /api/projects/{id}/reopen)
  const handleReopenPost = () => {
    const targetDate = new Date(formData.endDate);
    const totalRecruitCount = Number(formData.recruitCount) + 1;

    if (totalRecruitCount <= formData.currentCount) {
      showToast(`현재 참여 인원(${formData.currentCount}명)보다 많은 전체 정원이 필요합니다.`, 'warning');
      return;
    }

    if (targetDate < todayDate) {
      showToast('마감 일자를 오늘 이후로 설정해주세요.', 'warning');
      return;
    }

    openModal('confirm', {
      title: '재모집 시작',
      message: '설정된 정보로 재모집을 시작하시겠습니까?',
      confirmText: '재모집하기',
      color: 'primary',
      onConfirm: async () => {
        try {
          // 정보 수정 후 재모집 호출
          await postApi.updatePost(id, {
            ...formData,
            recruitCount: totalRecruitCount
          });
          await postApi.reopenPost(id);
          showToast('재모집이 시작되었습니다!', 'success');
          navigate(`/posts/${id}`);
        } catch (err) {
          showToast(err.error?.message || '재모집 처리 중 오류가 발생했습니다.', 'error');
        }
      }
    });
  };

  const handleDelete = () => {
    openModal('confirm', {
      title: '게시글 삭제',
      message: '정말 이 게시글을 삭제하시겠습니까? 삭제된 게시글은 복구할 수 없습니다.',
      confirmText: '삭제하기',
      color: 'error',
      onConfirm: async () => {
        try {
          await postApi.deletePost(id);
          showToast('삭제되었습니다.', 'success');
          navigate('/');
        } catch (err) {
          showToast(err.error?.message || '삭제 중 오류가 발생했습니다.', 'error');
        }
      }
    });
  };

  if (isLoading) return <Box sx={{ mt: 10 }}><LinearProgress /></Box>;

  return (
    <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100vh', pt: '100px', pb: 10 }}>
      <Container maxWidth="lg">
        <Breadcrumb items={[{ label: '홈', path: '/' }, { label: '프로젝트 탐색', path: '/posts' }, { label: '모집글 수정' }]} />
        
        <Box sx={{ mt: 3, mb: 5 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: '#111827' }}>🚀 모집글 수정</Typography>
          <Typography variant="body1" sx={{ color: '#6B7280', fontWeight: 500 }}>기존 모집글의 정보를 수정하거나 상태를 관리하세요.</Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
          <Box sx={{ flex: 8 }}>
            <Stack spacing={4}>
              {/* 1. 기본 정보 섹션 */}
              <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: '1px solid #EEEEEE', borderTop: '4px solid #6C63FF' }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 4 }}>
                  <DescriptionIcon sx={{ color: '#6C63FF' }} />
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>기본 정보</Typography>
                </Stack>
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
                  <TextField fullWidth value={formData.title} onChange={handleChange('title')} placeholder="함께하고 싶은 열정이 느껴지는 제목을 지어주세요! (5글자 이상)" sx={inputStyle} />
                </Box>
              </Paper>

              {/* 2. 모집 조건 섹션 */}
              <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: '1px solid #EEEEEE' }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 4 }}>
                  <GroupAddIcon sx={{ color: '#6C63FF' }} />
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>모집 조건</Typography>
                </Stack>
                <Stack spacing={4}>
                  <Stack direction="row" spacing={3}>
                    <Box sx={{ flex: 0.7 }}><FormLabel sx={{ fontWeight: 800, mb: 1.5, display: 'block', color: '#374151' }}>모집 인원 *</FormLabel><TextField fullWidth type="number" value={formData.recruitCount} onChange={handleChange('recruitCount')} helperText={`현재 참여: ${formData.currentCount}명 (본인 포함)`} placeholder="본인 제외 인원" sx={inputStyle} /></Box>
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
                  <Box><FormLabel sx={{ fontWeight: 800, mb: 1.5, display: 'block', color: '#374151' }}>기술 스택 *</FormLabel><Autocomplete multiple freeSolo value={formData.techStacks} onChange={handleTechStacksChange} options={TECH_STACK_OPTIONS} renderInput={(params) => <TextField {...params} sx={inputStyle} />} renderTags={(val, getTagProps) => val.map((opt, i) => { const { key, ...p } = getTagProps({ index: i }); return <Chip key={key} label={opt} {...p} sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', fontWeight: 800 }} />; })} /></Box>
                </Stack>
              </Paper>

              <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: '1px solid #EEEEEE' }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 4 }}><CodeIcon sx={{ color: '#6C63FF' }} /><Typography variant="h6" sx={{ fontWeight: 900 }}>상세 소개</Typography></Stack>
                <TextField multiline rows={12} fullWidth value={formData.content} onChange={handleChange('content')} sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F9FAFB', borderRadius: 4, p: 3, lineHeight: 1.6 } }} />
              </Paper>

              <Stack direction="row" justifyContent="center" spacing={2} sx={{ pt: 2 }}>
                <CustomButton variant="primary" onClick={handleSubmit} sx={{ px: 4, height: 56, fontWeight: 900 }}><SaveIcon sx={{ mr: 1 }} /> 수정 완료하기</CustomButton>
                {formData.status === 'RECRUITING' ? (
                  <CustomButton variant="contained" onClick={handleClosePost} sx={{ px: 4, height: 56, bgcolor: '#FF9800', color: 'white', fontWeight: 900, '&:hover': { bgcolor: '#F57C00' } }}><LockClockIcon sx={{ mr: 1 }} /> 모집 조기마감</CustomButton>
                ) : (
                  <CustomButton variant="contained" onClick={handleReopenPost} sx={{ px: 4, height: 56, bgcolor: '#22C55E', color: 'white', fontWeight: 900, '&:hover': { bgcolor: '#16A34A' } }}><CheckCircleIcon sx={{ mr: 1 }} /> 재모집 시작하기</CustomButton>
                )}
                <CustomButton variant="secondary" onClick={() => navigate(-1)} sx={{ px: 4, height: 56 }}>취소</CustomButton>
              </Stack>
            </Stack>
          </Box>

          <Box sx={{ flex: 4 }}>
            <Stack spacing={3} sx={{ position: 'sticky', top: '100px' }}>
              <Card elevation={0} sx={{ borderRadius: 5, bgcolor: '#FFF5F5', border: '1px solid #FFEBEB' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography sx={{ fontWeight: 900, mb: 2.5, color: '#E53E3E', display: 'flex', alignItems: 'center', gap: 1 }}>⚠️ 위험 구역</Typography>
                  <CustomButton fullWidth variant="contained" onClick={handleDelete} startIcon={<DeleteOutlineIcon />} sx={{ bgcolor: '#EF4444', color: 'white', fontWeight: 900, height: 50, borderRadius: 3 }}>게시글 삭제</CustomButton>
                  <Typography variant="caption" sx={{ color: '#E53E3E', mt: 1, display: 'block', textAlign: 'center', fontWeight: 600 }}>삭제된 데이터는 복구할 수 없습니다.</Typography>
                </CardContent>
              </Card>
              <Card elevation={0} sx={{ borderRadius: 5, border: '1px solid #EEEEEE' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography sx={{ fontWeight: 900, mb: 3 }}>✅ 수정 체크리스트</Typography>
                  {[ { label: '제목 및 유형 확인', done: formData.title.trim().length > 0 }, { label: '모집 인원 검토', done: (Number(formData.recruitCount) + 1) >= formData.currentCount }, { label: '마감일 설정', done: !!formData.endDate }, { label: '기술 스택 (최소 1개)', done: formData.techStacks.length > 0 } ].map((item, i) => (
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

const inputStyle = { '& .MuiOutlinedInput-root': { bgcolor: '#F9FAFB', borderRadius: 1.5, fontSize: '0.95rem', fontWeight: 600, '& fieldset': { border: '1px solid #E5E7EB' }, '&.Mui-focused fieldset': { borderWidth: '2px', borderColor: '#6366F1' }, '&.Mui-focused': { bgcolor: 'white' } } };

export default PostEditPage;
