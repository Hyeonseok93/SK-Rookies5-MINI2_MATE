import React, { useState } from 'react';
import { 
  Container, Box, Typography, TextField, Button, Paper, Link, 
  InputAdornment, IconButton, Divider, Grid, Stack 
} from '@mui/material'; // Grid2 대신 Grid 임포트
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  const { showToast } = useUiStore();
  // const theme = useTheme();
  
  const from = location.state?.from || '/';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('이메일과 비밀번호를 모두 입력해주세요.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      // 입력값 앞뒤 공백 제거 후 전송
      const response = await authApi.login({ 
        email: email.trim(), 
        password: password.trim() 
      });
      
      const { accessToken, refreshToken, user } = response;
      setAuth(accessToken, refreshToken, user);
      
      showToast('성공적으로 로그인되었습니다!', 'success');
      
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1500);
    } catch (err) {
      // axiosInstance에서 reject된 response.data 또는 에러 객체가 err로 넘어옵니다.
      const errorMessage = err.error?.message || err.message || '로그인 정보를 다시 확인해주세요.';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: 'calc(100vh - 60px)', display: 'flex', 
      alignItems: 'center', justifyContent: 'center',
      bgcolor: 'background.default', py: 8, px: 2
    }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ 
          p: { xs: 4, sm: 8 }, borderRadius: 8, 
          boxShadow: '0 32px 64px rgba(0,0,0,0.05)', textAlign: 'center', bgcolor: '#ffffff'
        }}>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', mb: 1, letterSpacing: '-0.05em' }}>
            mate
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>로그인</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 6, fontWeight: 500 }}>
            팀 프로젝트의 시작, 메이트와 함께하세요.
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ textAlign: 'left' }}>
            {/* 이메일 입력 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, ml: 0.5 }}>이메일</Typography>
              <TextField
                fullWidth placeholder="email@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 4, height: 56, bgcolor: '#F9FAFB',
                    '& fieldset': { borderColor: 'transparent' },
                    '&:hover fieldset': { borderColor: 'primary.light' },
                    '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 2 }
                  }
                }}
              />
            </Box>

            {/* 비밀번호 입력 */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, ml: 0.5 }}>비밀번호</Typography>
              <TextField
                fullWidth type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호를 입력하세요" value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: 4, height: 56, bgcolor: '#F9FAFB',
                    '& fieldset': { borderColor: 'transparent' },
                    '&:hover fieldset': { borderColor: 'primary.light' },
                    '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 2 }
                  }
                }}
              />
            </Box>

            <Button
              fullWidth variant="contained" type="submit" disabled={isLoading}
              sx={{ 
                height: 56, fontSize: '1.1rem', fontWeight: 800, borderRadius: 4,
                boxShadow: '0 12px 24px rgba(108,99,255,0.25)', mb: 2 
              }}
            >
              {isLoading ? '연결 중...' : '로그인'}
            </Button>

            {/* [추가] 아이디 / 비밀번호 찾기 (일반 Grid 사용 예시) */}
            <Grid container justifyContent="center" sx={{ mb: 4 }}>
              <Stack direction="row" spacing={1.5} divider={<Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />}>
                <Link component={RouterLink} to="/find-email" sx={{ color: 'text.secondary', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  아이디 찾기
                </Link>
                <Link component={RouterLink} to="/find-password" sx={{ color: 'text.secondary', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  비밀번호 찾기
                </Link>
              </Stack>
            </Grid>

            <Divider sx={{ mb: 4 }}>
              <Typography variant="caption" sx={{ color: 'text.muted', fontWeight: 600 }}>OR</Typography>
            </Divider>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>처음이신가요?</Typography>
              <Link component={RouterLink} to="/register" sx={{ 
                fontWeight: 800, textDecoration: 'none', color: 'primary.main',
                '&:hover': { textDecoration: 'underline' }
              }}>
                회원가입 하기
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;