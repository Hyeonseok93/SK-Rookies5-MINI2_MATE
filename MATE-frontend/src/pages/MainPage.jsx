import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Box, Typography, TextField, Button, Paper, Pagination as MuiPagination } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { usePostStore } from '@/store/postStore';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import PostCard from '@/component/common/PostCard';

const MainPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useAuthStore();
  const { showToast } = useUiStore();
  
  const { 
    posts, 
    isLoading, 
    error,
    fetchPosts, 
    keyword, 
    setKeyword, 
    category, 
    setCategory, 
    page, 
    setPage, 
    totalPages 
  } = usePostStore();

  // 에러 발생 시 토스트 알림
  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error, showToast]);

  // 기회 섹션으로 부드럽게 스크롤 (헤더 오프셋 반영)
  const scrollToOpportunities = () => {
    const element = document.getElementById('new-opportunities');
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // URL 해시(#) 체크 후 자동 스크롤 로직
  useEffect(() => {
    if (location.hash === '#new-opportunities') {
      scrollToOpportunities();
    }
  }, [location]);

  useEffect(() => {
    // 카테고리, 검색어, 페이지가 바뀔 때마다 데이터를 실시간으로 가져옴
    fetchPosts({ size: 15 });
  }, [category, keyword, page, fetchPosts]);

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
  };

  const handlePageChange = (event, value) => {
    setPage(value - 1);
    scrollToOpportunities();
  };

  const handleSearchClick = () => {
    setPage(0); // 검색 시 첫 페이지로 이동
    fetchPosts({ size: 15 });
  };

  const handleStartProject = () => {
    if (!isLoggedIn) {
      showToast('로그인이 필요한 서비스입니다.', 'warning');
      navigate('/login', { state: { from: '/posts/new' } });
    } else {
      navigate('/posts/new');
    }
  };

  const categories = ['전체', '스터디', '프로젝트'];

  return (
    <Box sx={{ 
      width: '100%', 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      pb: 15
    }}>
      {/* Hero Section */}
      <Box sx={{ 
        pt: { xs: 10, md: 18 }, 
        pb: { xs: 8, md: 10 }, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textAlign: 'center',
        position: 'relative',
      }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            bgcolor: 'primary.soft', 
            color: 'primary.main', 
            px: 2.5, 
            py: 0.8, 
            borderRadius: 99, 
            fontSize: '0.95rem', 
            fontWeight: 800, 
            mb: 4,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
          }}>
            <span>✨</span> Discover Your Perfect Project Partner
          </Box>

          <Typography variant="h1" sx={{ 
            fontSize: { xs: '2.5rem', md: '4rem' }, 
            lineHeight: 1.2, 
            mb: 3,
            fontWeight: 900,
            color: 'text.primary',
            letterSpacing: '-0.04em',
          }}>
             함께 성장할<br />
            <Box component="span" sx={{ 
              background: 'linear-gradient(90deg, #6C63FF 0%, #FF6584 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}>크리에이티브 메이트</Box>를 찾으세요
          </Typography>

          <Typography sx={{ 
            color: 'text.secondary', 
            mb: 8, 
            maxWidth: 800, 
            mx: 'auto',
            fontSize: '1.15rem',
            lineHeight: 1.6,
            fontWeight: 500
          }}>
            당신의 아이디어를 현실로 만들어줄 최고의 팀원들이 기다리고 있습니다.<br />
            지금 바로 멋진 팀을 꾸려 가치 있는 프로젝트를 시작해 보세요.
          </Typography>

          {/* Search Bar */}
          <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', mb: 8 }}>
            <Paper elevation={0} sx={{ 
              p: 0.8, 
              borderRadius: 99, 
              display: 'flex', 
              alignItems: 'center',
              boxShadow: '0 12px 48px rgba(0,0,0,0.08)',
              border: '1px solid #E5E7EB',
              bgcolor: '#ffffff'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, px: 2 }}>
                <SearchIcon sx={{ color: 'primary.main', mr: 1.5, fontSize: 28 }} />
                <TextField
                  placeholder="관심 있는 스택이나 주제를 검색하세요 (python, react, java...)"
                  variant="standard"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  fullWidth
                  InputProps={{
                    disableUnderline: true,
                    sx: { 
                      fontSize: '1.1rem',
                      fontWeight: 500,
                      '& input::placeholder': { opacity: 0.6 }
                    }
                  }}
                />
              </Box>
              <Button 
                variant="contained" 
                onClick={handleSearchClick}
                sx={{ 
                  px: 6, 
                  py: 1.8,
                  borderRadius: 99,
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  boxShadow: '0 8px 24px rgba(108,99,255,0.25)',
                  whiteSpace: 'nowrap'
                }}
              >
                검색
              </Button>
            </Paper>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={category === cat ? 'contained' : 'outlined'}
                onClick={() => handleCategoryChange(cat)}
                sx={{ 
                  minWidth: 110,
                  height: 48,
                  borderRadius: 99,
                  bgcolor: category === cat ? 'primary.main' : '#ffffff',
                  color: category === cat ? '#fff' : 'text.secondary',
                  borderColor: category === cat ? 'primary.main' : '#E5E7EB',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  '&:hover': {
                    bgcolor: category === cat ? 'primary.main' : '#f8f8f8',
                    borderColor: 'primary.main',
                  }
                }}
              >
                {cat}
              </Button>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Main Content Area - ID 부여된 섹션 */}
      <Container id="new-opportunities" maxWidth="xl" sx={{ mt: 10, px: { xs: 3, md: 8 }, scrollMarginTop: '100px' }}>
        <Box sx={{ mb: 6, borderBottom: '2px solid #F3F4F6', pb: 3, textAlign: 'left' }}>
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
            🚀 New Opportunities
          </Typography>
        </Box>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: '1fr', 
            md: 'repeat(3, 1fr)' 
          }, 
          gap: 5
        }}>
          {isLoading ? (
            [...Array(15)].map((_, idx) => (
              <PostCard key={idx} isLoading={true} />
            ))
          ) : posts && posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.projectId} post={post} />
            ))
          ) : (
            <Box sx={{ gridColumn: '1 / -1', py: 20, textAlign: 'center', bgcolor: '#fff', borderRadius: 4, border: '1px dashed #E5E7EB' }}>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 700 }}>검색 결과가 없습니다.</Typography>
            </Box>
          )}
        </Box>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 15 }}>
            <MuiPagination 
              count={totalPages} 
              page={page + 1} 
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: 3,
                  fontWeight: 900,
                  height: 56,
                  minWidth: 56,
                  fontSize: '1.1rem'
                }
              }}
            />
          </Box>
        )}

        {/* CTA Banner Section */}
        <Box sx={{ mt: 20 }}>
          <Paper elevation={0} sx={{ 
            borderRadius: { xs: 6, md: 10 },
            background: 'linear-gradient(135deg, #6C63FF 0%, #8E85FF 100%)',
            color: '#fff',
            p: { xs: 6, md: 10 },
            textAlign: 'center',
            boxShadow: '0 24px 64px rgba(108,99,255,0.2)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <Box sx={{ position: 'absolute', top: -100, left: -100, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
            <Box sx={{ position: 'absolute', bottom: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
            
            <Typography variant="h3" sx={{ 
              fontWeight: 900, 
              mb: 3, 
              fontSize: { xs: '2rem', md: '3rem' },
              letterSpacing: '-0.02em'
            }}>
              Ready to Build Your Dream Team?
            </Typography>
            <Typography sx={{ 
              fontSize: '1.2rem', 
              opacity: 0.9, 
              mb: 6, 
              fontWeight: 500,
              maxWidth: 600,
              mx: 'auto'
            }}>
              지금 바로 프로젝트를 등록하고<br />
              전 세계의 멋진 메이트들을 만나 당신의 상상을 현실로 만들어보세요.
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              onClick={handleStartProject}
              sx={{ 
                bgcolor: '#fff', 
                color: 'primary.main',
                px: 6,
                py: 2.2,
                borderRadius: 99,
                fontWeight: 900,
                fontSize: '1.1rem',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                '&:hover': {
                  bgcolor: '#f8f8f8',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              Start Your Project
            </Button>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default MainPage;