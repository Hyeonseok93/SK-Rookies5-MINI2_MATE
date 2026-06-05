import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Box, Typography, Paper, Stack, 
  Divider, Chip, LinearProgress, IconButton, Grid
} from '@mui/material';

// Icons
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EditIcon from '@mui/icons-material/Edit';
import ForumIcon from '@mui/icons-material/Forum';
import GroupsIcon from '@mui/icons-material/Groups';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// API & Store
import { authApi } from '../api/authApi';
import { useUiStore } from '../store/uiStore';
import Breadcrumb from '../component/common/Breadcrumb';
import CustomButton from '../component/common/Button';

const MyPostsPage = () => {
  const navigate = useNavigate();
  const { showToast } = useUiStore();
  
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 데이터 로드
  const fetchMyPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      // 설계서 v1.1: GET /api/users/me/posts/owned
      const data = await authApi.getMyOwnedPosts();
      setPosts(data || []);
    } catch (err) {
      console.error("Fetch my posts error:", err);
      showToast(err.error?.message || '모집글 목록을 불러오는데 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchMyPosts();
  }, [fetchMyPosts]);

  if (isLoading) return <Box sx={{ width: '100%', mt: '100px' }}><LinearProgress /></Box>;

  return (
    <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100vh', pt: '100px', pb: 10 }}>
      <Container maxWidth="lg">
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'white', border: '1px solid #E5E7EB' }}>
            <ArrowBackIosNewIcon sx={{ fontSize: 14, color: '#4B5563' }} />
          </IconButton>
          <Breadcrumb items={[{ label: '홈', path: '/' }, { label: '마이페이지', path: '/mypage' }, { label: '내 모집글 관리' }]} />
        </Stack>

        <Box sx={{ mb: 5 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#111827', mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <AssignmentIcon color="primary" sx={{ fontSize: 40 }} /> 내 모집글 관리
          </Typography>
          <Typography variant="body1" sx={{ color: '#6B7280', fontWeight: 500 }}>
            내가 등록한 프로젝트와 스터디의 모집 현황을 관리하고 팀원들과 소통하세요.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {posts.length > 0 ? (
            posts.map((post) => (
              <Grid item xs={12} key={post.id}>
                <OwnedPostCard 
                  post={post} 
                  onEdit={() => navigate(`/posts/${post.id}/edit`)}
                  onBoard={() => navigate(`/posts/${post.id}/board`)}
                  onDetail={() => navigate(`/posts/${post.id}`)}
                />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ py: 15, textAlign: 'center', borderRadius: 6, border: '1px dashed #E5E7EB', bgcolor: 'white' }}>
                <AssignmentIcon sx={{ fontSize: 60, color: '#E5E7EB', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 700 }}>아직 등록한 모집글이 없습니다.</Typography>
                <CustomButton 
                  variant="primary" 
                  onClick={() => navigate('/posts/new')} 
                  sx={{ mt: 3, px: 4 }}
                >
                  첫 모집글 작성하기
                </CustomButton>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

// 방장 전용 포스트 카드 컴포넌트
const OwnedPostCard = ({ post, onEdit, onBoard, onDetail }) => {
  const recruitCount = post.recruitCount || 1;
  const currentCount = post.currentCount || 0;
  const progress = (currentCount / recruitCount) * 100;
  
  const isClosed = post.status === 'CLOSED';

  return (
    <Paper elevation={0} sx={{ 
      p: { xs: 3, md: 4 }, borderRadius: 5, border: '1px solid #F0F0F0', bgcolor: 'white',
      transition: '0.2s', '&:hover': { boxShadow: '0 12px 24px rgba(0,0,0,0.04)' }
    }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
            <Chip 
              label={post.category === 'PROJECT' ? '프로젝트' : '스터디'} 
              size="small"
              sx={{ fontWeight: 900, bgcolor: post.category === 'PROJECT' ? '#EEF2FF' : '#FFF7ED', color: post.category === 'PROJECT' ? '#6366F1' : '#EA580C', borderRadius: 1 }} 
            />
            <Chip 
              label={isClosed ? '모집마감' : '모집중'} 
              size="small"
              sx={{ fontWeight: 900, bgcolor: isClosed ? '#F3F4F6' : '#ECFDF5', color: isClosed ? '#6B7280' : '#10B981', borderRadius: 1 }} 
            />
            <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarTodayIcon sx={{ fontSize: 14 }} /> 마감일: {post.endDate}
            </Typography>
          </Stack>

          <Typography 
            variant="h6" 
            onClick={onDetail}
            sx={{ fontWeight: 900, color: '#111827', mb: 3, cursor: 'pointer', '&:hover': { color: '#6366F1' } }}
          >
            {post.title}
          </Typography>

          <Box sx={{ mb: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ color: '#4B5563', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <GroupsIcon sx={{ fontSize: 18 }} /> 모집 현황 ({currentCount}/{recruitCount})
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 900, color: '#6366F1' }}>{Math.round(progress)}%</Typography>
            </Stack>
            <Box sx={{ width: '100%', bgcolor: '#F3F4F6', height: 8, borderRadius: 10, overflow: 'hidden' }}>
              <Box sx={{ width: `${progress}%`, bgcolor: '#6366F1', height: '100%', borderRadius: 10 }} />
            </Box>
          </Box>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, mx: 1 }} />

        <Box sx={{ minWidth: { md: '220px' }, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1.5 }}>
          <CustomButton 
            variant="primary" 
            fullWidth 
            startIcon={<ForumIcon />}
            onClick={onBoard}
            sx={{ fontWeight: 900, height: 48, borderRadius: 2 }}
          >
            팀 게시판 가기
          </CustomButton>
          <Stack direction="row" spacing={1.5}>
            <CustomButton 
              variant="secondary" 
              fullWidth 
              startIcon={<EditIcon />}
              onClick={onEdit}
              sx={{ fontWeight: 800, height: 44, borderRadius: 2, bgcolor: '#F3F4F6', color: '#4B5563' }}
            >
              수정
            </CustomButton>
            <CustomButton 
              variant="outlined" 
              fullWidth 
              onClick={onDetail}
              sx={{ fontWeight: 800, height: 44, borderRadius: 2, borderColor: '#E5E7EB', color: '#6B7280' }}
            >
              상세보기
            </CustomButton>
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
};

export default MyPostsPage;
