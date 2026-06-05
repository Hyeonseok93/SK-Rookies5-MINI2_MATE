import React from 'react';
import { Box, Container, Typography, Stack } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CustomButton from '../component/common/Button';

// Icons
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ErrorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 라우터나 API 호출 시 전달된 에러 정보 (없을 경우 기본 404로 간주)
  const errorData = location.state || {
    status: 404,
    code: 'PAGE_NOT_FOUND',
    message: '요청하신 페이지를 찾을 수 없습니다.'
  };

  const { status, code, message } = errorData;

  // 상태 코드별 디자인 설정
  const getErrorConfig = () => {
    switch (status) {
      case 403:
        return {
          title: '접근 권한 없음',
          description: '이 페이지에 접근할 권한이 없습니다.',
          color: '#F59E0B' // Amber
        };
      case 500:
        return {
          title: '서버 오류 발생',
          description: '일시적인 서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
          color: '#EF4444' // Red
        };
      default: // 404 포함
        return {
          title: '페이지를 찾을 수 없음',
          description: '입력하신 주소가 잘못되었거나 삭제된 페이지입니다.',
          color: '#6C63FF' // Primary
        };
    }
  };

  const config = getErrorConfig();

  return (
    <Box 
      sx={{ 
        bgcolor: '#F9FAFB', 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center',
        pt: '60px' // Header 높이 고려
      }}
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 4, md: 8 }, 
            borderRadius: 6, 
            textAlign: 'center',
            border: '1px solid #EEEEEE',
            bgcolor: '#FFFFFF'
          }}
        >
          {/* 에러 아이콘 */}
          <Box 
            sx={{ 
              display: 'inline-flex', 
              p: 3, 
              borderRadius: '50%', 
              bgcolor: `${config.color}15`, // 투명도 15%
              color: config.color,
              mb: 4
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 64 }} />
          </Box>

          {/* 에러 텍스트 */}
          <Typography 
            variant="h1" 
            sx={{ 
              fontSize: '5rem', 
              fontWeight: 900, 
              color: config.color, 
              mb: 1,
              lineHeight: 1
            }}
          >
            {status}
          </Typography>
          
          <Typography 
            variant="h4" 
            sx={{ fontWeight: 900, mb: 2, color: '#111827' }}
          >
            {config.title}
          </Typography>

          <Typography 
            variant="body1" 
            sx={{ color: '#6B7280', mb: 5, fontWeight: 500, lineHeight: 1.6 }}
          >
            {message || config.description}
            <br />
            {code && (
              <Typography component="span" variant="caption" sx={{ color: '#D1D5DB', mt: 1, display: 'block' }}>
                Error Code: {code}
              </Typography>
            )}
          </Typography>

          <Divider sx={{ mb: 5 }} />

          {/* 하단 액션 버튼 */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <CustomButton 
              variant="secondary" 
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              sx={{ px: 4, py: 1.5 }}
            >
              이전 페이지로
            </CustomButton>
            <CustomButton 
              variant="primary" 
              component={Link} 
              to="/"
              startIcon={<HomeIcon />}
              sx={{ px: 4, py: 1.5 }}
            >
              홈으로 이동
            </CustomButton>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

// MUI Paper import 누락 방지용 래퍼
import { Paper, Divider } from '@mui/material';

export default ErrorPage;
