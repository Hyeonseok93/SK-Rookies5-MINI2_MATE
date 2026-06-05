import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Box, Typography, Paper, Divider, 
  LinearProgress, Stack, Chip, Avatar
} from '@mui/material';

// Icons
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupsIcon from '@mui/icons-material/Groups';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

// 공통 컴포넌트
import Breadcrumb from '../component/common/Breadcrumb';
import CustomButton from '../component/common/Button'; 
import postApi from '../api/postApi';
import authApi from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { POSITION_OPTIONS } from '../constants/techStacks';
import { getDynamicStatus, getOnOfflineLabel } from '../utils/statusUtils';

/**
 * 모집글 상세 페이지 (REST API 설계서 v1.1 반영)
 */
const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user: currentUser } = useAuthStore();
  const { showToast, openModal } = useUiStore();

  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // v1.1 규격에 맞춰 상세 데이터와 내 지원 내역을 병렬로 로드
        const [postData, myApplies] = await Promise.all([
          postApi.getPostDetail(id),
          isLoggedIn ? authApi.getMyApplications() : Promise.resolve([])
        ]);

        if (postData) {
          setPost(postData);
          
          // 로그인 상태인 경우 지원 내역 리스트에서 현재 프로젝트 ID 확인
          if (isLoggedIn && myApplies) {
            const alreadyApplied = myApplies.some(apply => 
              Number(apply.projectId || apply.id) === Number(id)
            );
            setHasApplied(alreadyApplied);
          }
        }
      } catch (err) {
        console.error("데이터 로드 실패:", err);
        // 404 에러 발생 시 에러 페이지로 이동
        if (err.status === 404 || err.response?.status === 404) {
          navigate('/error', { 
            state: { 
              status: 404, 
              code: 'PROJECT_NOT_FOUND',
              message: '해당 프로젝트를 찾을 수 없거나 이미 삭제되었습니다.' 
            },
            replace: true 
          });
        } else {
          showToast(err.error?.message || '정보를 불러오지 못했습니다.', 'error');
          navigate('/posts');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, isLoggedIn, showToast, navigate]);

  // 게시글 삭제 핸들러 (v1.1: DELETE /api/projects/{id})
  const handleDeletePost = () => {
    openModal('confirm', {
      title: '게시글 삭제',
      message: '정말로 이 게시글을 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.',
      confirmText: '삭제하기',
      color: 'error',
      onConfirm: async () => {
        try {
          await postApi.deletePost(id);
          showToast('게시글이 삭제되었습니다.', 'success');
          navigate('/');
        } catch (err) {
          console.error("삭제 실패:", err);
          showToast(err.error?.message || '게시글 삭제 중 오류가 발생했습니다.', 'error');
        }
      }
    });
  };

  const handleApplyClick = () => {
    if (!isLoggedIn) {
      showToast('로그인이 필요한 서비스입니다.', 'warning');
      navigate('/login', { state: { from: `/posts/${id}/apply` } });
      return;
    }
    
    // 본인 글 여부 체크 (ID 기반 비교)
    if (currentUser && post && Number(currentUser.userId) === Number(post.ownerId)) {
      showToast('본인이 작성한 공고에는 지원할 수 없습니다.', 'error');
      return;
    }

    navigate(`/posts/${id}/apply`);
  };

  if (isLoading) return <Box sx={{ width: '100%', mt: '100px' }}><LinearProgress /></Box>;
  if (!post) return <Typography sx={{ mt: 20, textAlign: 'center', fontWeight: 700 }}>데이터를 찾을 수 없습니다.</Typography>;

  // v1.1 기반 데이터 바인딩
  const dynamicStatus = getDynamicStatus(post);
  const recruitCount = post.recruitCount || 1;
  const currentCount = post.currentCount || 0;
  const progress = (currentCount / recruitCount) * 100;
  const remainingCount = Math.max(0, recruitCount - currentCount);

  // 제목 정제 (태그 제거)
  const cleanTitle = post.title.replace(/\[.*?\]/g, '').trim();

  // 본인 글 여부 확인 (서업 flag 또는 ID 비교)
  const isOwner = post.owner === true || (currentUser && Number(currentUser.userId) === Number(post.ownerId));

  // 💡 [이미지 경로 최적화 함수] 
  // 슬래시가 겹치거나 누락되는 문제를 방지합니다.
  const getProfileImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = "http://localhost:8080";
    const formattedPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${formattedPath}`;
  };

  return (
    <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100vh', pt: '100px', pb: 10 }}>
      <Container maxWidth="lg">
        <Breadcrumb items={[
          { label: '홈', path: '/' }, 
          { label: '프로젝트 탐색', path: '/posts' }, 
          { label: '상세 보기' }
        ]} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4, mt: 2 }}>
          
          {/* [좌측 본문 영역] */}
          <Box sx={{ flex: 8 }}>
            <Stack spacing={4}>
              <Paper elevation={0} sx={{ p: { xs: 4, sm: 6 }, borderRadius: 8, borderTop: '6px solid #6C63FF', border: '1px solid #F0F0F0', bgcolor: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Chip 
                    label={post.category === 'PROJECT' ? 'PROJECT' : 'STUDY'} 
                    sx={{ 
                      bgcolor: post.category === 'PROJECT' ? '#EEF2FF' : '#FFF7ED', 
                      color: post.category === 'PROJECT' ? '#6366F1' : '#EA580C', 
                      fontWeight: 900, borderRadius: '12px', height: 32, px: 2, fontSize: '0.85rem'
                    }} 
                  />
                </Box>

                <Typography variant="h3" sx={{ 
                  fontWeight: 900, mb: 4, color: '#111827', letterSpacing: '-0.02em', lineHeight: 1.3, textAlign: 'center' 
                }}>
                  {cleanTitle}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, mb: 5 }}>
                  <Typography variant="body2" sx={{ 
                    color: dynamicStatus === 'RECRUITING' ? '#22C55E' : (dynamicStatus === 'DEADLINE_SOON' ? '#F59E0B' : '#EF4444'), 
                    fontWeight: 900, display: 'flex', alignItems: 'center', gap: 0.5 
                  }}>
                    <span style={{ fontSize: '1.2rem' }}>●</span> 
                    {dynamicStatus === 'RECRUITING' ? '모집중' : (dynamicStatus === 'DEADLINE_SOON' ? '마감임박' : '모집종료')}
                  </Typography>
                </Box>

                <Divider sx={{ mb: 5 }} />

                <Stack direction="row" spacing={1.2} justifyContent="center" sx={{ mb: 5, flexWrap: 'wrap' }}>
                  {post.techStacks?.map(stack => (
                    <Chip key={stack} label={stack} sx={{ bgcolor: '#F3F4F6', color: '#374151', fontWeight: 800, px: 0.5, borderRadius: 2 }} />
                  ))}
                </Stack>

                <Stack direction="row" spacing={2} sx={{ mb: 4, width: '100%' }}>
                  {[
                    { icon: <GroupsIcon />, label: '모집 인원', value: `${recruitCount}명`, color: '#6366F1', bgColor: '#EEF2FF' },
                    { icon: <LocationOnIcon />, label: '진행 방식', value: getOnOfflineLabel(post.onOffline), color: '#10B981', bgColor: '#ECFDF5' },
                    { icon: <CalendarMonthIcon />, label: '모집 마감', value: post.endDate, color: '#F59E0B', bgColor: '#FFFBEB' },
                  ].map((info, index) => (
                    <Box key={index} sx={{ 
                      flex: 1, p: { xs: 2, sm: 3 }, borderRadius: 5, bgcolor: '#F9FAFB', border: '1px solid #F3F4F6',
                      textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 12px 24px rgba(0,0,0,0.06)', bgcolor: 'white' }
                    }}>
                      <Box sx={{ width: { xs: 40, sm: 54 }, height: { xs: 40, sm: 54 }, borderRadius: { xs: '12px', sm: '18px' }, bgcolor: info.bgColor, color: info.color, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
                        {React.cloneElement(info.icon, { sx: { fontSize: { xs: 20, sm: 28 } } })}
                      </Box>
                      <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 800, display: 'block', mb: 0.5, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                        {info.label}
                      </Typography>
                      <Typography sx={{ fontWeight: 900, color: '#1F2937', fontSize: { xs: '0.85rem', sm: '1.1rem' } }}>
                        {info.value}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>

              <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: 6, border: '1px solid #EEEEEE', bgcolor: 'white' }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 6, height: 24, bgcolor: '#6C63FF', borderRadius: 1 }} />
                  프로젝트 소개
                </Typography>
                <Typography sx={{ color: '#374151', lineHeight: 1.9, whiteSpace: 'pre-line', fontSize: '1.05rem', fontWeight: 500 }}>
                  {post.content}
                </Typography>
              </Paper>
            </Stack>
          </Box>

          {/* [우측 사이드바 영역] */}
          <Box sx={{ flex: 4 }}>
            <Stack spacing={3} sx={{ position: 'sticky', top: '100px' }}>
              
              <Paper elevation={0} sx={{ 
                p: 4, borderRadius: 6, background: 'linear-gradient(135deg, #6C63FF 0%, #4834D4 100%)', color: 'white',
                boxShadow: '0 20px 40px rgba(108, 99, 255, 0.25)'
              }}>
                <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 800, mb: 1.5, letterSpacing: '0.05em' }}>CURRENT STATUS</Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>
                  {currentCount} <span style={{ fontSize: '1.4rem', opacity: 0.8, fontWeight: 700 }}>/ {recruitCount} Joiners</span>
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, fontWeight: 700, bgcolor: 'rgba(255,255,255,0.15)', py: 1, px: 2, borderRadius: 2, display: 'inline-block' }}>
                  {dynamicStatus !== 'CLOSED' ? `🚀 ${remainingCount}명 더 모집 중!` : '🎉 모집이 완료되었습니다'}
                </Typography>

                <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', height: 10, borderRadius: 10, mb: 4, overflow: 'hidden' }}>
                  <Box sx={{ bgcolor: 'white', height: '100%', width: `${progress}%`, transition: 'width 0.8s ease' }} />
                </Box>

                <CustomButton 
                  fullWidth onClick={handleApplyClick}
                  disabled={dynamicStatus === 'CLOSED' || isOwner || hasApplied}
                  sx={{ 
                    bgcolor: 'white', color: '#6C63FF', height: 60, borderRadius: 4, fontWeight: 900, fontSize: '1.15rem',
                    '&:hover': { bgcolor: '#F3F4F6' },
                    '&:disabled': { bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }
                  }}
                >
                  {isOwner ? '작성하신 공고입니다' : hasApplied ? '이미 지원 완료' : (dynamicStatus === 'CLOSED' ? '모집 종료' : '지금 지원하기')}
                </CustomButton>
              </Paper>

              <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid #EEEEEE', bgcolor: 'white' }}>
                <Typography variant="body2" sx={{ color: '#9CA3AF', fontWeight: 900, mb: 3, letterSpacing: '0.05em' }}>PROJECT OWNER</Typography>
                <Stack direction="row" spacing={2.5} alignItems="center" sx={{ mb: isOwner ? 3 : 0 }}>
                  <Avatar 
                    src={getProfileImageUrl(post.ownerProfileImg || post.ownerProfileImageUrl)} 
                    sx={{ width: 64, height: 64, bgcolor: '#6C63FF', fontSize: '1.5rem', fontWeight: 900 }}
                  >
                    {post.ownerNickname?.[0].toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2, mb: 0.5 }}>
                      {post.ownerNickname}
                    </Typography>
                    <Chip 
                      label={POSITION_OPTIONS.find(p => p.value === post.ownerPosition)?.label || post.ownerPosition || 'FE'} 
                      size="small" sx={{ bgcolor: '#F5F3FF', color: '#6C63FF', fontWeight: 900, borderRadius: 1.5 }} 
                    />
                  </Box>
                </Stack>

                {isOwner && (
                  <Stack direction="row" spacing={1.5} sx={{ pt: 2, borderTop: '1px solid #F3F4F6' }}>
                    <CustomButton variant="secondary" fullWidth startIcon={<EditIcon />} onClick={() => navigate(`/posts/${id}/edit`)} sx={{ height: 48, borderRadius: 3, fontWeight: 800 }}>수정</CustomButton>
                    <CustomButton variant="outline" fullWidth startIcon={<DeleteOutlineIcon />} onClick={handleDeletePost} sx={{ height: 48, borderRadius: 3, fontWeight: 800, color: '#EF4444', borderColor: '#FEE2E2', '&:hover': { bgcolor: '#FEF2F2', borderColor: '#EF4444' } }}>삭제</CustomButton>
                  </Stack>
                )}
              </Paper>

            </Stack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default PostDetailPage;