import React, { useState } from 'react';
import { 
  Container, Box, Typography, TextField, Button, Paper, Link, 
  MenuItem, Autocomplete, Chip, Divider, Stack, IconButton, InputAdornment 
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { authApi } from '../api/authApi';
import { useUiStore } from '../store/uiStore';
import { TECH_STACK_OPTIONS, POSITION_OPTIONS } from '../constants/techStacks';

/**
 * 회원가입 페이지 (REST API 설계서 v1.1 반영)
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  const { showToast } = useUiStore();

  // 1. 상태 관리
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    position: '',
    techStacks: [],
    phoneNumber: '',
  });

  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [lastCheckedEmail, setLastCheckedEmail] = useState('');
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [lastCheckedNickname, setLastCheckedNickname] = useState('');
  const [isPhoneChecked, setIsPhoneChecked] = useState(false);
  const [lastCheckedPhone, setLastCheckedPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phoneNumber') {
      const onlyNums = value.replace(/[^0-9]/g, '');
      if (onlyNums.length > 11) return;
      setFormData(prev => ({ ...prev, [name]: onlyNums }));
      setIsPhoneChecked(false);
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'nickname') setIsNicknameChecked(false);
    if (name === 'email') setIsEmailChecked(false);
  };

  const handleTechStacksChange = (event, newValue) => {
    setFormData(prev => ({ ...prev, techStacks: newValue }));
  };

  // 중복 확인 핸들러들 (v1.1 규격 API 호출)
  const handleCheckEmail = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      showToast('유효한 이메일 형식을 입력해주세요.', 'warning');
      return;
    }
    try {
      const response = await authApi.checkEmail(formData.email);
      const isAvailable = response.isAvailable ?? response;
      if (isAvailable) {
        showToast('사용 가능한 이메일입니다!', 'success');
        setIsEmailChecked(true);
        setLastCheckedEmail(formData.email);
      } else {
        showToast('이미 사용 중인 이메일입니다.', 'error');
        setIsEmailChecked(false);
      }
    } catch (err) {
      showToast(err.error?.message || '이메일 중복 확인 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleCheckNickname = async () => {
    if (!formData.nickname.trim()) {
      showToast('닉네임을 입력해주세요.', 'warning');
      return;
    }
    try {
      const response = await authApi.checkNickname(formData.nickname);
      const isAvailable = response.isAvailable ?? response;
      if (isAvailable) {
        showToast('사용 가능한 닉네임입니다!', 'success');
        setIsNicknameChecked(true);
        setLastCheckedNickname(formData.nickname);
      } else {
        showToast('이미 사용 중인 닉네임입니다.', 'error');
        setIsNicknameChecked(false);
      }
    } catch (err) {
      showToast(err.error?.message || '닉네임 중복 확인 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleCheckPhone = async () => {
    if (!formData.phoneNumber.trim() || formData.phoneNumber.length < 10) {
      showToast('유효한 전화번호를 입력해주세요.', 'warning');
      return;
    }
    try {
      const response = await authApi.checkPhone(formData.phoneNumber);
      const isAvailable = response.isAvailable ?? response;
      if (isAvailable) {
        showToast('사용 가능한 전화번호입니다.', 'success');
        setIsPhoneChecked(true);
        setLastCheckedPhone(formData.phoneNumber);
      } else {
        showToast('이미 등록된 전화번호입니다.', 'error');
        setIsPhoneChecked(false);
      }
    } catch (err) {
      showToast(err.error?.message || '전화번호 중복 확인 중 오류가 발생했습니다.', 'error');
    }
  };

  // 폼 유효성 검사
  const validate = () => {
    const { email, password, confirmPassword, nickname, techStacks, phoneNumber } = formData;
    
    // 필수 항목 체크 (설계서 규칙 준수)
    if (!email || !password || !phoneNumber) {
      showToast('이메일, 비밀번호, 전화번호는 필수 입력 항목입니다.', 'warning');
      return false;
    }
    
    if (techStacks.length === 0) {
      showToast('기술 스택을 최소 1개 이상 등록해주세요.', 'warning');
      return false;
    }

    if (!isEmailChecked || email !== lastCheckedEmail) {
      showToast('이메일 중복 확인이 필요합니다.', 'warning');
      return false;
    }

    if (password.length < 8 || password.length > 20) {
      showToast('비밀번호는 8~20자 사이여야 합니다.', 'warning');
      return false;
    }

    if (password !== confirmPassword) {
      showToast('비밀번호가 일치하지 않습니다.', 'error');
      return false;
    }

    // 닉네임을 수동으로 입력한 경우에만 중복 확인 체크
    if (nickname.trim() && (!isNicknameChecked || nickname !== lastCheckedNickname)) {
      showToast('닉네임 중복 확인이 필요합니다.', 'warning');
      return false;
    }

    if (!isPhoneChecked || phoneNumber !== lastCheckedPhone) {
      showToast('전화번호 중복 확인이 필요합니다.', 'warning');
      return false;
    }

    return true;
  };

  // 회원가입 제출 (v1.1: POST /api/auth/signup)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const signupData = {
        email: formData.email,
        password: formData.password,
        nickname: formData.nickname.trim() || undefined, // 비어있으면 서버 자동 할당 로직 수행
        phoneNumber: formData.phoneNumber,
        position: formData.position || undefined,
        techStacks: formData.techStacks
      };

      await authApi.signup(signupData);
      
      showToast('회원가입이 완료되었습니다! 로그인을 진행해주세요.', 'success');
      navigate('/login');
    } catch (err) {
      console.error('회원가입 에러:', err);
      const errorMessage = err.error?.message || '회원가입 처리 중 오류가 발생했습니다.';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': { 
      borderRadius: 1.5, bgcolor: '#F9FAFB',
      '& fieldset': { borderColor: 'transparent' },
      '&:hover fieldset': { borderColor: 'primary.light' },
      '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 2 }
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', py: 10 }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ p: { xs: 4, sm: 8 }, borderRadius: 8, boxShadow: '0 32px 64px rgba(0,0,0,0.05)', bgcolor: '#ffffff' }}>
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', mb: 1, letterSpacing: '-0.05em' }}>mate</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>회원가입</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>새로운 메이트가 되어 프로젝트를 시작하세요.</Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, ml: 0.5 }}>이메일 *</Typography>
              <Stack direction="row" spacing={1}>
                <TextField fullWidth name="email" placeholder="email@example.com" value={formData.email} onChange={handleChange} sx={inputStyle} />
                <Button 
                  variant="outlined" 
                  onClick={handleCheckEmail} 
                  disabled={!formData.email.trim() || isEmailChecked} 
                  sx={{ 
                    whiteSpace: 'nowrap', 
                    px: 3, 
                    borderRadius: 3, 
                    fontWeight: 800,
                    borderColor: isEmailChecked ? '#10B981' : 'primary.main',
                    color: isEmailChecked ? '#10B981' : 'primary.main',
                    '&:hover': { 
                      borderColor: isEmailChecked ? '#10B981' : 'primary.dark',
                      bgcolor: isEmailChecked ? 'transparent' : 'rgba(108, 99, 255, 0.04)'
                    },
                    '&:disabled': { 
                      borderColor: isEmailChecked ? '#10B981' : '#E5E7EB', 
                      color: isEmailChecked ? '#10B981' : '#9CA3AF', 
                      opacity: isEmailChecked ? 0.8 : 1
                    }
                  }}
                >
                  {isEmailChecked ? '확인됨' : '중복 확인'}
                </Button>
              </Stack>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, ml: 0.5 }}>비밀번호 *</Typography>
              <TextField fullWidth type={showPassword ? 'text' : 'password'} name="password" placeholder="8~20자 영문/숫자/특수문자" value={formData.password} onChange={handleChange} sx={inputStyle} InputProps={{ endAdornment: ( <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> )}} />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, ml: 0.5 }}>비밀번호 확인 *</Typography>
              <TextField fullWidth type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" placeholder="비밀번호 재입력" value={formData.confirmPassword} onChange={handleChange} sx={inputStyle} InputProps={{ endAdornment: ( <InputAdornment position="end"><IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">{showConfirmPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> )}} />
            </Box>

            <Divider sx={{ my: 6 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, ml: 0.5 }}>닉네임 (선택)</Typography>
              <Stack direction="row" spacing={1}>
                <TextField fullWidth name="nickname" placeholder="미입력 시 이메일 기반 자동 생성" value={formData.nickname} onChange={handleChange} sx={inputStyle} />
                <Button 
                  variant="outlined" 
                  onClick={handleCheckNickname} 
                  disabled={!formData.nickname.trim() || isNicknameChecked} 
                  sx={{ 
                    whiteSpace: 'nowrap', 
                    px: 3, 
                    borderRadius: 3, 
                    fontWeight: 800,
                    borderColor: isNicknameChecked ? '#10B981' : 'primary.main',
                    color: isNicknameChecked ? '#10B981' : 'primary.main',
                    '&:hover': { 
                      borderColor: isNicknameChecked ? '#10B981' : 'primary.dark',
                      bgcolor: isNicknameChecked ? 'transparent' : 'rgba(108, 99, 255, 0.04)'
                    },
                    '&:disabled': { 
                      borderColor: isNicknameChecked ? '#10B981' : '#E5E7EB', 
                      color: isNicknameChecked ? '#10B981' : '#9CA3AF', 
                      opacity: isNicknameChecked ? 0.8 : 1
                    }
                  }}
                >
                  {isNicknameChecked ? '확인됨' : '중복 확인'}
                </Button>
              </Stack>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, ml: 0.5 }}>휴대폰 번호 *</Typography>
              <Stack direction="row" spacing={1}>
                <TextField fullWidth name="phoneNumber" placeholder="숫자만 입력" value={formData.phoneNumber} onChange={handleChange} sx={inputStyle} />
                <Button 
                  variant="outlined" 
                  onClick={handleCheckPhone} 
                  disabled={!formData.phoneNumber.trim() || isPhoneChecked} 
                  sx={{ 
                    whiteSpace: 'nowrap', 
                    px: 3, 
                    borderRadius: 3, 
                    fontWeight: 800,
                    borderColor: isPhoneChecked ? '#10B981' : 'primary.main',
                    color: isPhoneChecked ? '#10B981' : 'primary.main',
                    '&:hover': { 
                      borderColor: isPhoneChecked ? '#10B981' : 'primary.dark',
                      bgcolor: isPhoneChecked ? 'transparent' : 'rgba(108, 99, 255, 0.04)'
                    },
                    '&:disabled': { 
                      borderColor: isPhoneChecked ? '#10B981' : '#E5E7EB', 
                      color: isPhoneChecked ? '#10B981' : '#9CA3AF', 
                      opacity: isPhoneChecked ? 0.8 : 1
                    }
                  }}
                >
                  {isPhoneChecked ? '확인됨' : '중복 확인'}
                </Button>
              </Stack>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, ml: 0.5 }}>희망 직군 *</Typography>
              <TextField select fullWidth name="position" value={formData.position} onChange={handleChange} sx={inputStyle}>
                {POSITION_OPTIONS.map((option) => ( <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem> ))}
              </TextField>
            </Box>

            <Box sx={{ mb: 6 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, ml: 0.5 }}>기술 스택 *</Typography>
              <Autocomplete multiple options={TECH_STACK_OPTIONS} value={formData.techStacks} onChange={handleTechStacksChange} freeSolo renderTags={(value, getTagProps) => value.map((option, index) => { const { key, ...tagProps } = getTagProps({ index }); return ( <Chip key={key} variant="filled" color="primary" label={option} {...tagProps} sx={{ borderRadius: 2, fontWeight: 700 }} /> ); })} renderInput={(params) => ( <TextField {...params} variant="outlined" placeholder="스택 선택 또는 입력" sx={inputStyle} /> )} />
            </Box>

            <Button fullWidth variant="contained" size="large" type="submit" disabled={isLoading} sx={{ height: 56, fontSize: '1.1rem', fontWeight: 800, borderRadius: 4, boxShadow: '0 12px 24px rgba(108,99,255,0.25)', mb: 4 }}>
              {isLoading ? '가입 중...' : '메이트 시작하기'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>이미 계정이 있으신가요? <Link component={RouterLink} to="/login" sx={{ fontWeight: 800, textDecoration: 'none', color: 'primary.main' }}>로그인</Link></Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;
