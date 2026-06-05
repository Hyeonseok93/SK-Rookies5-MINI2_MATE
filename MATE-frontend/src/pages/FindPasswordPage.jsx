import React, { useState } from 'react';
import { 
  Container, Box, Typography, TextField, Button, Paper, 
  Link, Divider, Stack, Grid 
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { authApi } from '../api/authApi';
// Breadcrumb 컴포넌트 임포트 추가
import Breadcrumb from '../component/common/Breadcrumb';

const FindPasswordPage = () => {
  const navigate = useNavigate();
  
  // 상태 관리
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // 유효성 검사 함수
  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const validatePhone = (value) => /^[0-9]{10,11}$/.test(value.replace(/-/g, ''));

  // 비밀번호 찾기 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    setEmailError(''); 
    setPhoneError(''); 
    
    // 1. 프론트엔드 유효성 체크
    let isValid = true;
    if (!email) { 
      setEmailError('이메일을 입력해주세요.'); 
      isValid = false; 
    } else if (!validateEmail(email)) { 
      setEmailError('올바른 이메일 형식이 아닙니다.'); 
      isValid = false; 
    }
    
    if (!phoneNumber) { 
      setPhoneError('전화번호를 입력해주세요.'); 
      isValid = false; 
    } else if (!validatePhone(phoneNumber)) { 
      setPhoneError('올바른 전화번호 형식이 아닙니다.'); 
      isValid = false; 
    }
    
    if (!isValid) return;

    setIsLoading(true);

    try {
      // 2. authApi 사용 (v1.1: reset-password)
      const response = await authApi.resetPassword(email, phoneNumber.replace(/-/g, ''));
      
      // 3. 응답 성공 시 결과 화면으로 전환
      // axiosInstance interceptor에서 이미 response.data.data를 반환하므로 response는 문자열(임시비번)입니다.
      if (response) {
        setResult(response); 
      }
    } catch (err) {
      // 4. 에러 발생 시 처리
      const msg = err.error?.message || err.message || '입력하신 정보가 일치하지 않습니다.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: 'calc(100vh - 60px)', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      bgcolor: '#F9FAFB', 
      py: 8, px: 2 
    }}>
      <Container maxWidth="sm">
        {/* 상단 경로 안내 */}
        <Box sx={{ mb: 3, alignSelf: 'flex-start', width: '100%' }}>
          <Breadcrumb items={[{ label: '🏠', path: '/' }, { label: '로그인', path: '/login' }, { label: '비밀번호 찾기' }]} />
        </Box>

        <Paper elevation={0} sx={{ 
          p: { xs: 4, sm: 8 }, 
          borderRadius: 8, 
          border: '1px solid #EEEEEE',
          boxShadow: '0 32px 64px rgba(0,0,0,0.03)', 
          textAlign: 'center', 
          bgcolor: '#ffffff'
        }}>
          {/* 헤더 섹션 */}
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', mb: 1, letterSpacing: '-0.05em' }}>
            mate
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
            비밀번호 찾기
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 6, fontWeight: 500 }}>
            가입 시 등록한 이메일과 휴대폰 번호를 입력해 주세요.
          </Typography>

          {result === null ? (
            /* [1. 입력 폼 화면] */
            <Box component="form" onSubmit={handleSubmit} sx={{ textAlign: 'left' }}>
              <Stack spacing={3} sx={{ mb: 6 }}>
                {/* 이메일 입력 */}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, ml: 0.5 }}>이메일(아이디)</Typography>
                  <TextField
                    fullWidth placeholder="email@example.com"
                    value={email} onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                    error={!!emailError} helperText={emailError}
                    sx={inputStyle}
                  />
                </Box>
                {/* 전화번호 입력 */}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, ml: 0.5 }}>휴대폰 번호</Typography>
                  <TextField
                    fullWidth placeholder="01012345678"
                    value={phoneNumber} onChange={(e) => { setPhoneNumber(e.target.value); setPhoneError(''); }}
                    error={!!phoneError} helperText={phoneError || '하이픈(-) 없이 숫자만 입력해 주세요.'}
                    sx={inputStyle}
                  />
                </Box>
              </Stack>

              <Button
                fullWidth variant="contained" type="submit" disabled={isLoading}
                sx={{ 
                  height: 60, fontSize: '1.1rem', fontWeight: 900, borderRadius: 4,
                  boxShadow: '0 12px 24px rgba(108,99,255,0.2)', mb: 4 
                }}
              >
                {isLoading ? '처리 중...' : '임시 비밀번호 발급받기'}
              </Button>
            </Box>
          ) : (
            /* [2. 성공 결과 화면] */
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ 
                p: 5, bgcolor: '#F5F6FF', borderRadius: 6, border: '1px solid #E0E7FF', mb: 4 
              }}>
                <Typography sx={{ fontSize: 40, mb: 1 }}>🔑</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#6366F1', mb: 2 }}>
                  임시 비밀번호가 발급되었습니다
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#111827', letterSpacing: 2, mb: 3 }}>
                  {result}
                </Typography>
                <Box sx={{ bgcolor: '#FEF3C7', p: 2, borderRadius: 3 }}>
                  <Typography variant="caption" sx={{ color: '#92400E', fontWeight: 800, display: 'block', mb: 0.5 }}>
                    ⚠️ 보안 주의사항
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#92400E', fontWeight: 500, lineHeight: 1.5 }}>
                    로그인 후 마이페이지에서 반드시 비밀번호를 변경해 주세요.
                  </Typography>
                </Box>
              </Box>

              <Button
                fullWidth variant="contained"
                onClick={() => navigate('/login')}
                sx={{ height: 60, fontSize: '1.1rem', fontWeight: 900, borderRadius: 4, mb: 2 }}
              >
                로그인하러 가기
              </Button>
            </Box>
          )}

          {/* 에러 메시지 */}
          {error && (
            <Typography variant="body2" sx={{ color: '#EF4444', fontWeight: 700, mt: 2, mb: 2 }}>
              ⚠️ {error}
            </Typography>
          )}

          <Divider sx={{ my: 4 }}>
            <Typography variant="caption" sx={{ color: 'text.muted', fontWeight: 600 }}>OR</Typography>
          </Divider>

          {/* 하단 보조 링크 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>아이디가 기억나지 않나요?</Typography>
              <Link component={RouterLink} to="/find-email" sx={{ 
                fontWeight: 800, textDecoration: 'none', color: 'primary.main',
                '&:hover': { textDecoration: 'underline' }
              }}>
                아이디 찾기
              </Link>
            </Box>

            <Link component={RouterLink} to="/login" sx={{ 
              fontSize: '0.85rem', fontWeight: 700, color: '#9CA3AF', 
              textDecoration: 'none', '&:hover': { color: '#6366F1' } 
            }}>
              ← 로그인 페이지로 돌아가기
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

// --- 스타일 정의 (LoginPage 시스템과 통일) ---
const inputStyle = {
  '& .MuiOutlinedInput-root': { 
    borderRadius: 4, height: 56, bgcolor: '#F9FAFB',
    '& fieldset': { borderColor: 'transparent' },
    '&:hover fieldset': { borderColor: '#A5A6F6' },
    '&.Mui-focused fieldset': { borderColor: '#6366F1', borderWidth: 2 }
  },
  '& .MuiFormHelperText-root': {
    fontWeight: 600, ml: 1, mt: 1, color: '#6B7280'
  }
};

export default FindPasswordPage;