import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Paper, TextField, Button,
  Radio, RadioGroup, FormControlLabel, FormControl,
  Stack, IconButton, Divider, LinearProgress, Avatar
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';

import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import Breadcrumb from '../component/common/Breadcrumb';
import postApi from '../api/postApi';
import authApi from '../api/authApi'; 
import { POSITION_OPTIONS } from '../constants/techStacks';

const PostApplyPage = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuthStore(); 
  const { showToast } = useUiStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [postInfo, setPostInfo] = useState({
    title: '',
    isOwner: false,
    isApplied: false,
    status: '모집중'
  });

  const [formData, setFormData] = useState({
    position: '',
    content: '',
    link: '',
    contact: ''
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // v1.1 규격에 맞춰 상세 정보와 유저 지원 내역을 병렬로 확인
        const [postData, myApplies] = await Promise.all([
          postApi.getPostDetail(id),
          isLoggedIn ? authApi.getMyApplications() : Promise.resolve([])
        ]);
        
        if (postData) {
          // 본인 글 여부 확인 (userId(FE)와 ownerId(API) 비교)
          const isOwner = user && postData.ownerId && Number(user.userId) === Number(postData.ownerId);

          if (isOwner) {
            showToast('본인이 작성한 공고에는 지원할 수 없습니다.', 'error');
            navigate(`/posts/${id}`, { replace: true });
            return;
          }

          // 지원 여부 확인 (설계서 v1.1: 내 지원 목록에 현재 프로젝트 ID가 있는지 체크)
          const alreadyApplied = myApplies && myApplies.some(apply => 
            Number(apply.projectId || apply.id) === Number(id)
          );

          setPostInfo({
            title: postData.title,
            isOwner: isOwner,
            isApplied: alreadyApplied,
            status: postData.status
          });
        }
      } catch (error) {
        console.error("데이터 로드 중 에러 발생", error);
        setPostInfo(prev => ({ ...prev, title: "정보를 불러올 수 없습니다." }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [id, user, isLoggedIn, navigate, showToast]);

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || postInfo.isApplied || postInfo.isOwner) return;

    setIsSubmitting(true);
    try {
      await postApi.applyToPost(id, formData);
      showToast('지원이 성공적으로 완료되었습니다!', 'success');
      
      // 지원 완료 후 마이페이지의 '신청 현황' 탭으로 이동
      navigate('/mypage', { 
        state: { 
          activeTab: 1, 
          scrollTo: 'activity' 
        } 
      }); 
    } catch (err) {
      console.error("제출 오류:", err);
      const errorMessage = err.error?.message || '제출 중 오류가 발생했습니다. 다시 시도해주세요.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Box sx={{ width: '100%', mt: '100px' }}><LinearProgress /></Box>;

  const SectionTitle = ({ number, title, required }) => (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
      <Avatar sx={{ width: 30, height: 30, bgcolor: '#6366F1', fontSize: '0.95rem', fontWeight: 900, boxShadow: '0 4px 10px rgba(99, 102, 241, 0.2)' }}>
        {number}
      </Avatar>
      <Typography sx={{ fontWeight: 900, color: '#111827', fontSize: '1.15rem', letterSpacing: '-0.01em' }}>
        {title} {required && <Box component="span" sx={{ color: '#ef5350', ml: 0.5, fontWeight: 900 }}>*</Box>}
      </Typography>
    </Stack>
  );

  return (
    <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100vh', pt: '100px', pb: 10 }}>
      <Container maxWidth="md">
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'white', border: '1px solid #E5E7EB', '&:hover': { bgcolor: '#F3F4F6', borderColor: '#D1D5DB' } }}>
            <ArrowBackIosNewIcon sx={{ fontSize: 14, color: '#4B5563' }} />
          </IconButton>
          <Breadcrumb items={[{ label: '홈', path: '/' }, { label: '상세보기', path: `/posts/${id}` }, { label: '지원하기' }]} />
        </Stack>

        <Paper elevation={0} sx={{ p: { xs: 4, md: 7 }, borderRadius: 8, border: '1px solid #F0F0F0', bgcolor: 'white', boxShadow: '0 20px 40px rgba(0,0,0,0.02)' }}>
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <AssignmentIcon sx={{ color: '#6366F1', fontSize: 44, mb: 2, filter: 'drop-shadow(0 4px 6px rgba(99, 102, 241, 0.3))' }} />
            <Typography variant="overline" sx={{ color: '#6366F1', fontWeight: 900, letterSpacing: 3, display: 'block', mb: 1, fontSize: '0.8rem' }}>
              PROJECT APPLICATION
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#111827', mb: 4, letterSpacing: '-0.02em' }}>지원서 작성</Typography>
            
            <Box sx={{ p: 3, bgcolor: '#F5F7FF', borderRadius: 5, border: '1px dashed #C7D2FE', width: '100%', maxWidth: '600px', mx: 'auto' }}>
              <Typography variant="body2" sx={{ color: '#6366F1', fontWeight: 800, mb: 1 }}>🚀 현재 지원 중인 공고</Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#1F2937', lineHeight: 1.4 }}>{postInfo.title?.replace(/\[.*?\]/g, '').trim()}</Typography>
            </Box>
          </Box>

          <Stack component="form" spacing={7} onSubmit={handleSubmit}>
            <FormControl required disabled={postInfo.isApplied} sx={{ width: '100%' }}>
              <SectionTitle number="1" title="어떤 분야에 지원하시나요?" required />
              <RadioGroup row value={formData.position} onChange={handleChange('position')} sx={{ gap: 2, justifyContent: 'center' }}>
                {POSITION_OPTIONS.map((pos) => {
                  const isSelected = formData.position === pos.value;
                  return (
                    <FormControlLabel 
                      key={pos.value} 
                      value={pos.value} 
                      control={<Radio sx={{ display: 'none' }} />} 
                      label={
                        <Box sx={{ 
                          px: 3.5, py: 1.8, borderRadius: 4, border: '2px solid',
                          fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.01em',
                          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                          cursor: 'pointer',
                          userSelect: 'none',
                          bgcolor: 'white', 
                          color: '#4B5563', 
                          borderColor: '#E5E7EB',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                          '&:hover': { bgcolor: '#F9FAFB', borderColor: '#D1D5DB' },
                          ...(isSelected && {
                            bgcolor: '#6366F1',
                            color: 'white',
                            borderColor: '#6366F1',
                            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
                            transform: 'translateY(-2px)'
                          }),
                          ...(postInfo.isApplied && {
                            bgcolor: '#F3F4F6',
                            color: '#9CA3AF',
                            borderColor: '#E5E7EB',
                            cursor: 'not-allowed',
                            boxShadow: 'none',
                            '&:hover': { bgcolor: '#F3F4F6' }
                          })
                        }}>
                          {pos.label}
                        </Box>
                      }
                      sx={{ m: 0 }}
                    />
                  );
                })}
              </RadioGroup>
            </FormControl>

            <Divider sx={{ borderColor: '#F0F0F0' }} />

            <Box>
              <SectionTitle number="2" title="자기소개 및 지원 동기" required />
              <TextField
                fullWidth multiline rows={8}
                disabled={postInfo.isApplied}
                placeholder="함께하고 싶은 이유와 본인의 강점을 자유롭게 적어주세요. (경험, 열정, 협업 스타일 등)"
                value={formData.content}
                onChange={handleChange('content')}
                helperText={`${formData.content.length} / 500자 (최소 10자)`}
                FormHelperTextProps={{ sx: { textAlign: 'right', fontWeight: 700, fontSize: '0.85rem', color: formData.content.length < 10 ? '#ef5350' : '#9CA3AF', mt: 1 } }}
                sx={inputStyle}
              />
            </Box>

            <Box>
              <SectionTitle number="3" title="참고 링크" />
              <TextField
                fullWidth
                disabled={postInfo.isApplied}
                placeholder="깃허브, 블로그, 포트폴리오 사이트 주소 (https://...)"
                value={formData.link}
                onChange={handleChange('link')}
                sx={inputStyle}
              />
            </Box>

            <Box>
              <SectionTitle number="4" title="소통 채널" required />
              <TextField
                fullWidth
                disabled={postInfo.isApplied}
                placeholder="카카오톡 아이디 또는 오픈채팅방 링크"
                value={formData.contact}
                onChange={handleChange('contact')}
                sx={inputStyle}
              />
            </Box>

            <Stack direction="row" spacing={2.5} justifyContent="center" sx={{ pt: 3 }}>
              <Button 
                type="submit" 
                variant="contained" 
                size="large" 
                disabled={isSubmitting || postInfo.isApplied || formData.content.length < 10 || !formData.position || !formData.contact}
                startIcon={postInfo.isApplied ? <CheckCircleIcon /> : <SendIcon />}
                sx={{ 
                  px: 9, py: 2.2, borderRadius: 5, fontWeight: 900, fontSize: '1.1rem',
                  bgcolor: postInfo.isApplied ? '#10B981' : '#6366F1',
                  boxShadow: '0 12px 24px rgba(99, 102, 241, 0.25)',
                  transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': { bgcolor: postInfo.isApplied ? '#059669' : '#4F46E5', transform: 'translateY(-3px)', boxShadow: '0 15px 30px rgba(99, 102, 241, 0.35)' },
                  '&:disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF', boxShadow: 'none' }
                }}
              >
                {postInfo.isApplied ? '이미 지원 완료' : (isSubmitting ? '제출 중...' : '지원서 제출하기')}
              </Button>
              <Button 
                variant="outlined" 
                size="large" 
                onClick={() => navigate(-1)}
                sx={{ px: 7, py: 2.2, borderRadius: 5, fontWeight: 800, fontSize: '1rem', color: '#6B7280', borderColor: '#E5E7EB', '&:hover': { border: '1px solid #9CA3AF', bgcolor: '#F9FAFB' } }}
              >
                취소
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

const inputStyle = {
  '& .MuiOutlinedInput-root': {
    bgcolor: '#F9FAFB',
    borderRadius: 5,
    fontSize: '1rem',
    fontWeight: 600,
    color: '#1F2937',
    transition: '0.2s all',
    wordBreak: 'break-all',
    padding: '20px 35px', 
    '& fieldset': { borderColor: '#E5E7EB', transition: '0.2s' },
    '&:hover fieldset': { borderColor: '#C7D2FE' },
    '&.Mui-focused fieldset': { borderWidth: '2px', borderColor: '#6366F1' },
    '&.Mui-focused': { bgcolor: 'white', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.05)' },
    '&.Mui-disabled': { bgcolor: '#F3F4F6', color: '#9CA3AF' }
  },
  '& .MuiOutlinedInput-input': {
    padding: '4px 0px', 
  },
  '& .MuiInputBase-input::placeholder': {
    fontSize: '0.95rem',
    fontWeight: 500,
    color: '#9CA3AF',
    opacity: 1
  }
};

export default PostApplyPage;
