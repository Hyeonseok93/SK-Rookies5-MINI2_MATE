import React, { useState } from 'react';
import Breadcrumb from '../component/common/Breadcrumb.jsx';
import { 
  Container, Box, Typography, TextField, Button, Paper, 
  Link, Divider, Stack, Grid 
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { authApi } from '../api/authApi';

const FindEmailPage = () => {
  const navigate = useNavigate();
  
  // 상태 관리
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [validError, setValidError] = useState('');

  // 전화번호 유효성 검사 (숫자 10~11자리)
  const validatePhone = (value) => {
    const cleaned = value.replace(/-/g, '');
    return /^[0-9]{10,11}$/.test(cleaned);
  };

  // 이메일 찾기 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    setValidError(''); 
    setResult(null);
    
    if (!phoneNumber) { 
      setValidError('전화번호를 입력해주세요.'); 
      return; 
    }
    if (!validatePhone(phoneNumber)) { 
      setValidError('올바른 전화번호 형식이 아닙니다. (숫자만 입력)'); 
      return; 
    }
    
    setIsLoading(true);
    
    try {
      const cleaned = phoneNumber.replace(/-/g, '');
      // authApi 사용 및 axiosInstance의 data 반환 규격 적용
      // 설계서 v1.1: data에 이메일 문자열이 직접 담겨옴
      const response = await authApi.findEmail(cleaned);
      
      if (response) {
        setResult(response);
      }
    } catch (err) {
      const errorMessage = err.error?.message || err.message || '오류가 발생했습니다. 다시 시도해주세요.';
      setError(errorMessage);
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
        <Box sx={{ mb: 3, alignSelf: 'flex-start', width: '100%' }}>
          <Breadcrumb items={[{ label: '🏠', path: '/' }, { label: '로그인', path: '/login' }, { label: '아이디 찾기' }]} />
        </Box>

        <Paper elevation={0} sx={{ 
          p: { xs: 4, sm: 8 }, 
          borderRadius: 8, 
          border: '1px solid #EEEEEE',
          boxShadow: '0 32px 64px rgba(0,0,0,0.03)', 
          textAlign: 'center', 
          bgcolor: '#ffffff'
        }}>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', mb: 1, letterSpacing: '-0.05em' }}>
            mate
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
            아이디 찾기
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 6, fontWeight: 500 }}>
            가입 시 등록한 휴대폰 번호를 입력해 주세요.
          </Typography>

          {!result ? (
            <Box component="form" onSubmit={handleSubmit} sx={{ textAlign: 'left' }}>
              <Box sx={{ mb: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, ml: 0.5 }}>휴대폰 번호</Typography>
                <TextField
                  fullWidth 
                  placeholder="01012345678"
                  value={phoneNumber} 
                  onChange={(e) => { setPhoneNumber(e.target.value); setValidError(''); }}
                  error={!!validError}
                  helperText={validError || '하이픈(-) 없이 숫자만 입력해 주세요.'}
                  sx={inputStyle}
                />
              </Box>

              <Button
                fullWidth variant="contained" type="submit" disabled={isLoading}
                sx={{ 
                  height: 60, fontSize: '1.1rem', fontWeight: 900, borderRadius: 4,
                  boxShadow: '0 12px 24px rgba(108,99,255,0.2)', mb: 4 
                }}
              >
                {isLoading ? '조회 중...' : '이메일 찾기'}
              </Button>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ 
                p: 5, bgcolor: '#F5F6FF', borderRadius: 6, border: '1px solid #E0E7FF', mb: 4 
              }}>
                <Typography sx={{ fontSize: 48, mb: 1 }}>✅</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#6366F1', mb: 2 }}>
                  가입된 이메일을 찾았습니다
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#111827', letterSpacing: 0.5 }}>
                  {result}
                </Typography>
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

          {error && (
            <Typography variant="body2" sx={{ color: '#EF4444', fontWeight: 700, mt: 2, mb: 2 }}>
              ⚠️ {error}
            </Typography>
          )}

          <Divider sx={{ my: 4 }}>
            <Typography variant="caption" sx={{ color: 'text.muted', fontWeight: 600 }}>OR</Typography>
          </Divider>

          {/* 하단 링크 영역 수정: 비밀번호 찾기로 변경 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>비밀번호가 기억나지 않나요?</Typography>
              <Link component={RouterLink} to="/find-password" sx={{ 
                fontWeight: 800, textDecoration: 'none', color: 'primary.main',
                '&:hover': { textDecoration: 'underline' }
              }}>
                비밀번호 찾기
              </Link>
            </Box>

            <Link component={RouterLink} to="/login" sx={{ 
              fontSize: '0.85rem', fontWeight: 700, color: '#9CA3AF', 
              textDecoration: 'none', '&:hover': { color: 'primary.main' } 
            }}>
              ← 로그인 페이지로 돌아가기
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

// --- 스타일 정의 ---
const inputStyle = {
  '& .MuiOutlinedInput-root': { 
    borderRadius: 4, height: 56, bgcolor: '#F9FAFB',
    '& fieldset': { borderColor: 'transparent' },
    '&:hover fieldset': { borderColor: '#A5A6F6' },
    '&.Mui-focused fieldset': { borderColor: '#6366F1', borderWidth: 2 }
  },
  '& .MuiFormHelperText-root': {
    fontWeight: 600,
    ml: 1,
    mt: 1,
    color: '#6B7280'
  }
};

export default FindEmailPage;