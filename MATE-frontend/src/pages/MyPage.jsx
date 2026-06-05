import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Container, Typography, Paper, Stack, 
  Button, Divider, TextField, Chip, IconButton, Tabs, Tab, LinearProgress, InputAdornment, MenuItem, Menu, Autocomplete,
  Dialog, DialogTitle, DialogContent, List, ListItem, ListItemAvatar, ListItemText, Link
} from '@mui/material';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EmailIcon from '@mui/icons-material/Email';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import Breadcrumb from '../component/common/Breadcrumb';
import Avatar from '../component/common/Avatar';
import { useUiStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { TECH_STACK_OPTIONS, POSITION_OPTIONS } from '../constants/techStacks';
import authApi from '../api/authApi';
import postApi from '../api/postApi';

// // 💡 [이미지 경로 최적화 함수]
// // 슬래시가 겹치거나 누락되는 문제를 방지합니다.
// const getProfileImageUrl = (path) => {
//   if (!path) return null;
//   if (path.startsWith('http')) return path;
//   const baseUrl = "http://localhost:8080";
//   const formattedPath = path.startsWith('/') ? path : `/${path}`;
//   return `${baseUrl}${formattedPath}`;
// };

const MyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast, openModal } = useUiStore();
  const { logout } = useAuthStore(); 

  const [tabValue, setTabValue] = useState(0); 
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [isLoading, setIsLoading] = useState(true);

  // 지원서 관리 관련 상태
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [applications, setApplications] = useState([]);
  const [isAppDetailOpen, setIsAppDetailOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  const [userInfo, setUserInfo] = useState(null);
  const [formData, setFormData] = useState({
    nickname: '',
    position: '',
    phoneNumber: '',
    techStacks: []
  });

  const [isNicknameChecked, setIsNicknameChecked] = useState(true); 
  const [lastCheckedNickname, setLastCheckedNickname] = useState('');
  const [isPhoneChecked, setIsPhoneChecked] = useState(true);
  const [lastCheckedPhone, setLastCheckedPhone] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 프로필 이미지 관련 상태 및 Ref
  const [anchorEl, setAnchorEl] = useState(null);
  const fileInputRef = useRef(null);

  const profileRef = useRef(null);
  const activityRef = useRef(null);

  // 유저 데이터 및 활동 이력 로드 함수
  const fetchUserData = useCallback(async () => {
    try {
      const [me, owned, joined, applies] = await Promise.all([
        authApi.getUserInfo(),
        authApi.getMyOwnedPosts(),
        authApi.getMyJoinedPosts(),
        authApi.getMyApplications()
      ]);

      const combinedData = {
        ...me,
        myPosts: owned || [],
        acceptedProjects: joined || [],
        applies: applies || [],
        postCount: (owned?.length || 0),
        applyCount: (applies?.length || 0)
      };

      setUserInfo(combinedData);
      setFormData({
        nickname: me.nickname || '',
        position: me.position || '',
        phoneNumber: me.phoneNumber || '',
        techStacks: me.techStacks || []
      });      setLastCheckedNickname(me.nickname || '');
      setLastCheckedPhone(me.phoneNumber || '');
      setIsNicknameChecked(true);
      setIsPhoneChecked(true);
      
      useAuthStore.getState().updateUser(me);
    } catch (err) {
      console.error("회원 정보를 불러오지 못했습니다.", err);
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        setUserInfo(currentUser);
        setFormData({
          nickname: currentUser.nickname || '',
          position: currentUser.position || '',
          phoneNumber: currentUser.phoneNumber || '',
          techStacks: currentUser.techStacks || []
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    if (location.state?.activeTab !== undefined && !isLoading) {
      setTabValue(location.state.activeTab); 
      setTimeout(() => {
        const targetRef = location.state.scrollTo === 'profile' ? profileRef : activityRef;
        if (targetRef.current) {
          const offset = targetRef.current.offsetTop - 100;
          window.scrollTo({ top: offset, behavior: 'smooth' });
        }
      }, 100);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, isLoading]);

  const fetchApplications = async (projectId) => {
    try {
      const response = await postApi.getProjectApplications(projectId);
      setApplications(response.data || response);
    } catch (err) {
      console.error("지원서 로드 실패:", err);
      showToast(err.error?.message || '지원자 목록을 불러오지 못했습니다.', 'error');
    }
  };

  const handleOpenAppModal = (projectId) => {
    setSelectedProjectId(projectId);
    fetchApplications(projectId);
    setIsAppModalOpen(true);
  };

  const handleStatusUpdate = async (applicationId, status) => {
    try {
      const targetStatus = status === 'ACCEPTED' ? 'accept' : 'reject';
      await postApi.updateApplicationStatus(applicationId, targetStatus);
      showToast(status === 'ACCEPTED' ? '승인되었습니다.' : '거절되었습니다.', 'success');
      if (selectedProjectId) fetchApplications(selectedProjectId);
      setIsAppDetailOpen(false);
      fetchUserData();
    } catch (err) {
      console.error("상태 업데이트 실패:", err);
      showToast(err.error?.message || '처리 중 오류가 발생했습니다.', 'error');
    }
  };

  const scrollToSection = useCallback((ref, tabIdx = null) => {
    if (tabIdx !== null) setTabValue(tabIdx);
    setTimeout(() => {
      const offset = (ref.current?.offsetTop || 0) - 100;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }, 100);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setCategoryFilter('전체');
  };

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    if (field === 'phoneNumber') {
      const onlyNums = value.replace(/[^0-9]/g, '');
      if (onlyNums.length > 11) return;
      setFormData(prev => ({ ...prev, [field]: onlyNums }));
      
      if (userInfo && (onlyNums === userInfo.phoneNumber || (lastCheckedPhone && onlyNums === lastCheckedPhone))) {
        setIsPhoneChecked(true);
      } else {
        setIsPhoneChecked(false);
      }
      return;
    }
    
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    if (field === 'nickname') {
      if (userInfo && (value === userInfo.nickname || (lastCheckedNickname && value === lastCheckedNickname))) {
        setIsNicknameChecked(true);
      } else {
        setIsNicknameChecked(false);
      }
    }
  };

  const handleTechStacksChange = (event, newValue) => {
    setFormData(prev => ({ ...prev, techStacks: newValue }));
  };

  const handleCheckNickname = async () => {
    if (!formData.nickname.trim()) {
      showToast('닉네임을 입력해주세요.', 'warning');
      return;
    }
    if (userInfo && formData.nickname === userInfo.nickname) {
      setIsNicknameChecked(true);
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
      console.error("닉네임 체크 에러:", err);
      showToast(err.error?.message || '중복 확인 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleCheckPhone = async () => {
    if (!formData.phoneNumber.trim() || formData.phoneNumber.length < 10) {
      showToast('유효한 전화번호를 입력해주세요.', 'warning');
      return;
    }
    if (userInfo && formData.phoneNumber === userInfo.phoneNumber) {
      setIsPhoneChecked(true);
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
      console.error("전화번호 체크 에러:", err);
      showToast(err.error?.message || '중복 확인 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleSaveProfile = async () => {
    if (!userInfo) return;
    const isProfileUnchanged = 
      formData.nickname === userInfo.nickname &&
      formData.position === userInfo.position &&
      formData.phoneNumber === userInfo.phoneNumber &&
      JSON.stringify(formData.techStacks) === JSON.stringify(userInfo.techStacks);
    
    const isPasswordEmpty = !password && !confirmPassword;
    if (isProfileUnchanged && isPasswordEmpty) {
      showToast('변경된 정보가 없습니다!', 'info');
      return;
    }
    if (formData.nickname !== userInfo.nickname && (!isNicknameChecked || formData.nickname !== lastCheckedNickname)) {
      showToast('닉네임 중복 확인이 필요합니다.', 'warning');
      return;
    }
    if (formData.phoneNumber !== userInfo.phoneNumber && (!isPhoneChecked || formData.phoneNumber !== lastCheckedPhone)) {
      showToast('전화번호 중복 확인이 필요합니다.', 'warning');
      return;
    }
    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        showToast('비밀번호가 일치하지 않습니다.', 'error');
        return;
      }
      if (password.length < 8) {
        showToast('비밀번호는 8자 이상이어야 합니다.', 'warning');
        return;
      }
    }
    try {
      const updatePayload = {
        nickname: formData.nickname,
        position: formData.position,
        phoneNumber: formData.phoneNumber,
        techStacks: formData.techStacks,
        ...(password && { password })
      };
      
      await authApi.updateUserProfile(updatePayload);
      await fetchUserData();
      
      showToast('프로필 정보가 성공적으로 저장되었습니다!', 'success');
      setPassword(''); setConfirmPassword('');
    } catch (err) {
      console.error("프로필 저장 실패:", err);
      showToast(err.error?.message || '저장 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formDataObj = new FormData();
    formDataObj.append('profileImage', file);
    try {
      await authApi.updateProfileImage(formDataObj);
      await fetchUserData();
      showToast('프로필 이미지가 변경되었습니다.', 'success');
    } catch (err) {
      console.error("이미지 업데이트 실패:", err);
      showToast(err.error?.message || '이미지 업데이트 중 오류가 발생했습니다.', 'error');
    } finally {
      handleMenuClose();
    }
  };

  const handleDeleteImage = async () => {
    try {
      await authApi.deleteProfileImage();      
      await fetchUserData();
      showToast('기본 이미지로 변경되었습니다.', 'success');
    } catch (err) {
      console.error("이미지 삭제 실패:", err);
      showToast(err.error?.message || '이미지 삭제 중 오류가 발생했습니다.', 'error');
    } finally {
      handleMenuClose();
    }
  };

  const handleCancelApplication = async (applyId) => {
    openModal('confirm', {
      title: '지원 취소',
      message: '정말로 이 프로젝트 지원을 취소하시겠습니까?',
      confirmText: '지원 취소',
      color: 'error',
      onConfirm: async () => {
        try {
          await postApi.cancelApplication(applyId);
          showToast('지원이 취소되었습니다.', 'success');
          fetchUserData();
        } catch (err) {
          console.error("지원 취소 에러:", err);
          showToast(err.error?.message || '지원 취소 중 오류가 발생했습니다.', 'error');
        }
      }
    });
  };

  const handleWithdrawal = () => {
    openModal('confirm', {
      title: '회원 탈퇴',
      message: '정말로 탈퇴하시겠습니까? 모든 데이터가 삭제되며 복구할 수 없습니다.',
      confirmText: '탈퇴하기',
      color: 'error',
      onConfirm: async () => {
        try {
          await authApi.withdraw();
          showToast('회원 탈퇴가 완료되었습니다.', 'success');
          logout(); navigate('/');
        } catch (err) {
          console.error("탈퇴 에러:", err);
          showToast(err.error?.message || '탈퇴 처리 중 오류가 발생했습니다.', 'error');
        }
      }
    });
  };

  const handleAvatarClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // 💡 수정된 필터링 로직: 신청 현황(tabValue === 1)에서도 카테고리를 정확히 찾도록 수정
const getFilteredData = useCallback(() => {
    if (!userInfo) return [];
    let sourceData = [];
    
    // 1. 현재 탭에 맞는 데이터 소스 선택
    if (tabValue === 0) sourceData = userInfo.myPosts || [];
    else if (tabValue === 1) sourceData = userInfo.applies || [];
    else if (tabValue === 2) sourceData = userInfo.acceptedProjects || [];

    // 2. '전체'일 때는 필터링 없이 반환
    if (categoryFilter === '전체') return sourceData;

    // 3. 카테고리 필터링 실행
    return sourceData.filter(item => {
      // 💡 다양한 경로에서 카테고리 값을 추출하고 대문자로 통일
      const rawValue = item?.category || 
                       item?.projectCategory || 
                       item?.project?.category;
                       
      if (!rawValue) return false; // 카테고리 정보가 없으면 필터링 시 제외

      const itemCategory = rawValue.toUpperCase(); // 비교를 위해 대문자 변환
      
      // 화면의 '프로젝트', '스터디' 글자를 API 규격인 'PROJECT', 'STUDY'로 변환
      const categoryMap = { 
        '프로젝트': 'PROJECT', 
        '스터디': 'STUDY' 
      };
      
      const targetCategory = categoryMap[categoryFilter];

      // 두 값이 일치하는 것만 반환 (예: 'PROJECT' === 'PROJECT')
      return itemCategory === targetCategory;
    });
  }, [userInfo, tabValue, categoryFilter]);

  if (isLoading || !userInfo) {
    return (
      <Box sx={{ width: '100%', mt: '100px', textAlign: 'center' }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, fontWeight: 700, color: '#6366F1' }}>데이터를 불러오는 중입니다...</Typography>
      </Box>
    );
  }

  const displayList = getFilteredData();

  return (
    <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100vh', pt: '100px', pb: 10 }}>
      <Container maxWidth={false} sx={{ maxWidth: '1440px', px: { xs: 2, md: 5 } }}>
        <Breadcrumb items={[{ label: '🏠', path: '/' }, { label: '마이페이지' }]} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 5, mt: 4, alignItems: 'flex-start' }}>
          <Box sx={{ width: { xs: '100%', md: '320px' }, flexShrink: 0, position: { md: 'sticky' }, top: '100px' }}>
            <Stack spacing={3}>
              <Paper elevation={0} sx={{ borderRadius: 6, overflow: 'hidden', border: '1px solid #EEEEEE', bgcolor: 'white' }}>
                <Box sx={{ height: 100, background: 'linear-gradient(135deg, #A78BFA 0%, #6366F1 100%)' }} />
                <Box sx={{ px: 3, pb: 4, textAlign: 'center', mt: -6 }}>
                  <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    <Box onClick={handleAvatarClick} sx={{ cursor: 'pointer', transition: '0.2s', '&:hover': { opacity: 0.8, transform: 'scale(1.02)' } }}>
                      <Avatar name={userInfo.nickname} src={userInfo.profileImg || userInfo.profileImageUrl} size="xl" />
                    </Box>
                    <IconButton 
                      onClick={handleAvatarClick} 
                      sx={{ 
                        position: 'absolute', bottom: 0, right: 0, 
                        bgcolor: 'white', border: '1px solid #E5E7EB', 
                        width: 36, height: 32, borderRadius: 2,
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                        '&:hover': { bgcolor: '#F9FAFB' }
                      }}
                    >
                      <PhotoCameraIcon sx={{ fontSize: 18, color: '#6B7280' }} />
                    </IconButton>
                  </Box>
                  <Menu 
                    anchorEl={anchorEl} 
                    open={Boolean(anchorEl)} 
                    onClose={handleMenuClose} 
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} 
                    transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                    PaperProps={{ 
                      sx: { 
                        minWidth: 150, 
                        mt: 1.5,
                        borderRadius: 1.5,
                        boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                        border: '1px solid #E5E7EB',
                        overflow: 'visible',
                        '&:before': {
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          left: '50%',
                          width: 10,
                          height: 10,
                          bgcolor: 'background.paper',
                          transform: 'translateX(-50%) translateY(-50%) rotate(45deg)',
                          zIndex: 0,
                          borderLeft: '1px solid #E5E7EB',
                          borderTop: '1px solid #E5E7EB',
                        },
                      } 
                    }} 
                  >
                    <MenuItem onClick={() => { fileInputRef.current.click(); handleMenuClose(); }} sx={{ fontWeight: 700, py: 1.2, fontSize: '0.85rem' }}>
                      <EditIcon sx={{ mr: 1.2, color: '#6366F1', fontSize: 18 }} /> 이미지 변경
                    </MenuItem>
                    <Divider sx={{ my: 0, opacity: 0.5 }} />
                    <MenuItem onClick={handleDeleteImage} sx={{ fontWeight: 700, py: 1.2, fontSize: '0.85rem', color: '#F43F5E' }}>
                      <DeleteIcon sx={{ mr: 1.2, color: 'inherit', fontSize: 18 }} /> 이미지 삭제
                    </MenuItem>
                  </Menu>
                  <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleImageChange} />
                  <Typography variant="h5" sx={{ fontWeight: 900, mt: 2 }}>{userInfo.nickname}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 3 }}>
                    @{userInfo.nickname?.toLowerCase()} · {POSITION_OPTIONS.find(p => p.value === userInfo.position)?.label || userInfo.position}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 3 }}>
                    <Box sx={{ cursor: 'pointer' }} onClick={() => scrollToSection(activityRef, 0)}><Typography variant="h6" sx={{ fontWeight: 900 }}>{userInfo.postCount || 0}</Typography><Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>내 모집글</Typography></Box>
                    <Divider orientation="vertical" flexItem />
                    <Box sx={{ cursor: 'pointer' }} onClick={() => scrollToSection(activityRef, 1)}><Typography variant="h6" sx={{ fontWeight: 900 }}>{userInfo.applyCount || 0}</Typography><Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>신청 현황</Typography></Box>
                  </Box>
                  <Button fullWidth variant="outlined" startIcon={<EditIcon />} onClick={() => scrollToSection(profileRef)} sx={{ borderRadius: 3, fontWeight: 800, py: 1.2, borderColor: '#E5E7EB', color: '#374151' }}>프로필 수정</Button>
                </Box>
              </Paper>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 5, border: '1px solid #EEEEEE', bgcolor: 'white' }}>
                <Stack spacing={0.5}>
                  <MenuButton icon={<PersonIcon />} label="프로필 정보" onClick={() => scrollToSection(profileRef)} />
                  <MenuButton icon={<AssignmentIcon />} label="내 모집글" count={userInfo.postCount} onClick={() => scrollToSection(activityRef, 0)} />
                  <MenuButton icon={<EmailIcon />} label="신청 현황" count={userInfo.applyCount} onClick={() => scrollToSection(activityRef, 1)} />
                  <MenuButton icon={<RocketLaunchIcon />} label="내 팀" count={userInfo.acceptedProjects?.length || 0} onClick={() => scrollToSection(activityRef, 2)} />
                  <Divider sx={{ my: 1.5 }} />
                  <Button fullWidth startIcon={<LogoutIcon />} onClick={handleWithdrawal} sx={{ justifyContent: 'flex-start', color: '#9CA3AF', fontWeight: 800, px: 2, py: 1.5 }}>회원 탈퇴</Button>
                </Stack>
              </Paper>
            </Stack>
          </Box>

          <Box sx={{ flex: 1, width: '100%' }}>
            <Stack spacing={4}>
              <Paper ref={profileRef} elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: 6, border: '1px solid #EEEEEE', bgcolor: 'white' }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 5, display: 'flex', alignItems: 'center' }}><Box component="span" sx={{ width: 5, height: 20, bgcolor: '#6366F1', mr: 2, borderRadius: 1 }} />프로필 정보</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 4 }}>
                  <Box>
                    <FormLabel text="닉네임" />
                    <Stack direction="row" spacing={1}>
                      <TextField fullWidth value={formData.nickname} onChange={handleInputChange('nickname')} sx={inputStyle} />
                      <Button 
                        variant="outlined" 
                        onClick={handleCheckNickname} 
                        disabled={isNicknameChecked}
                        sx={{ 
                          whiteSpace: 'nowrap', 
                          px: 3, 
                          borderRadius: 3, 
                          fontWeight: 800,
                          borderColor: isNicknameChecked ? '#10B981' : 'primary.main',
                          color: isNicknameChecked ? '#10B981' : 'primary.main',
                          '&:hover': { borderColor: 'primary.dark' },
                          '&:disabled': { borderColor: '#10B981', color: '#10B981', opacity: 0.8 }
                        }}
                      >
                        {isNicknameChecked ? '확인됨' : '중복 확인'}
                      </Button>
                    </Stack>
                  </Box>
                  <Box>
                    <FormLabel text="전화번호" />
                    <Stack direction="row" spacing={1}>
                      <TextField fullWidth value={formData.phoneNumber} onChange={handleInputChange('phoneNumber')} placeholder="숫자만 입력" sx={inputStyle} />
                      <Button 
                        variant="outlined" 
                        onClick={handleCheckPhone} 
                        disabled={isPhoneChecked}
                        sx={{ 
                          whiteSpace: 'nowrap', 
                          px: 3, 
                          borderRadius: 3, 
                          fontWeight: 800,
                          borderColor: isPhoneChecked ? '#10B981' : 'primary.main',
                          color: isPhoneChecked ? '#10B981' : 'primary.main',
                          '&:hover': { borderColor: 'primary.dark' },
                          '&:disabled': { borderColor: '#10B981', color: '#10B981', opacity: 0.8 }
                        }}
                      >
                        {isPhoneChecked ? '확인됨' : '중복 확인'}
                      </Button>
                    </Stack>
                  </Box>
                  <Box><FormLabel text="비밀번호 변경" /><TextField fullWidth type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="새 비밀번호 입력" InputProps={{ endAdornment: ( <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> )}} sx={inputStyle} /></Box>
                  <Box><FormLabel text="비밀번호 확인" /><TextField fullWidth type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="비밀번호 확인 입력" InputProps={{ endAdornment: ( <InputAdornment position="end"><IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">{showConfirmPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> )}} sx={inputStyle} /></Box>
                  <Box><FormLabel text="포지션" /><TextField select fullWidth value={formData.position} onChange={handleInputChange('position')} sx={inputStyle}>{POSITION_OPTIONS.map((o) => ( <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem> ))}</TextField></Box>
                  <Box><FormLabel text="이메일" /><TextField fullWidth value={userInfo.email || ''} InputProps={{ readOnly: true }} sx={{ ...inputStyle, '& .MuiOutlinedInput-root': { bgcolor: '#F3F4F6' } }} /></Box>
                  <Box sx={{ gridColumn: '1 / -1' }}><FormLabel text="기술 스택" /><Autocomplete multiple options={TECH_STACK_OPTIONS} value={formData.techStacks} onChange={handleTechStacksChange} freeSolo renderTags={(val, getTagProps) => val.map((opt, i) => { const { key, ...p } = getTagProps({ index: i }); return ( <Chip key={key} label={opt} {...p} variant="filled" color="primary" sx={{ borderRadius: 2, fontWeight: 700 }} /> ); })} renderInput={(p) => ( <TextField {...p} variant="outlined" placeholder="스택 선택 또는 입력" sx={inputStyle} /> )} /></Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 6 }}><Button variant="contained" onClick={handleSaveProfile} startIcon={<SaveIcon />} sx={{ px: 6, py: 1.8, borderRadius: 4, fontWeight: 900, bgcolor: '#6366F1' }}>저장하기</Button></Box>
              </Paper>

              <Paper ref={activityRef} elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: 6, border: '1px solid #EEEEEE', bgcolor: 'white' }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 4, display: 'flex', alignItems: 'center' }}><Box component="span" sx={{ width: 5, height: 20, bgcolor: '#6366F1', mr: 2, borderRadius: 1 }} />활동 내역</Typography>
                <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 4, borderBottom: '1px solid #F3F4F6' }}><Tab label={`내 모집글 (${userInfo.postCount || 0})`} sx={{ fontWeight: 900, px: 3 }} /><Tab label={`신청 현황 (${userInfo.applyCount || 0})`} sx={{ fontWeight: 900, px: 3 }} /><Tab label={`내 팀 (${userInfo.acceptedProjects?.length || 0})`} sx={{ fontWeight: 900, px: 3 }} /></Tabs>
                <Stack direction="row" spacing={1} sx={{ mb: 3 }}>{['전체', '프로젝트', '스터디'].map((cat) => ( <Chip key={cat} label={cat} onClick={() => setCategoryFilter(cat)} sx={{ fontWeight: 800, px: 1, bgcolor: categoryFilter === cat ? '#6366F1' : '#F3F4F6', color: categoryFilter === cat ? 'white' : '#6B7280' }} /> ))}</Stack>
                <Stack spacing={2.5}>{displayList.length > 0 ? ( displayList.map((item) => ( <ActivityItem key={item.applyId || item.projectId || item.id} item={item} tabValue={tabValue} onTitleClick={() => { const targetId = item.projectId || item.id; if (tabValue === 1) navigate(`/posts/${targetId}`); else navigate(`/posts/${targetId}/board`); }} onManageClick={() => navigate(`/posts/${item.projectId || item.id}/edit`)} onViewAppsClick={() => handleOpenAppModal(item.projectId || item.id)} onCancelClick={() => handleCancelApplication(item.applyId || item.id)} /> )) ) : ( <Box sx={{ py: 6, textAlign: 'center', bgcolor: '#F9FAFB', borderRadius: 4 }}><Typography color="text.secondary" sx={{ fontWeight: 600 }}>{categoryFilter} 내역이 없습니다.</Typography></Box> )}</Stack>
              </Paper>
            </Stack>
          </Box>
        </Box>
      </Container>

      {/* 지원자 목록 모달 */}
      <Dialog open={isAppModalOpen} onClose={() => setIsAppModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 24px 48px rgba(0,0,0,0.1)' } }}>
        <DialogTitle sx={{ fontWeight: 900, color: '#111827', borderBottom: '1px solid #F3F4F6', py: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          지원자 목록
          <IconButton onClick={() => setIsAppModalOpen(false)} size="small" sx={{ color: '#9CA3AF' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {applications.length > 0 ? (
            <List sx={{ py: 0 }}>
              {applications.map((app) => (
                <ListItem key={app.id || app.applyId} button onClick={() => { setSelectedApp(app); setIsAppDetailOpen(true); }} sx={{ py: 2.5, px: 4, borderBottom: '1px solid #F9FAFB', transition: '0.2s', '&:hover': { bgcolor: '#F8F9FF' } }}>
                  <ListItemAvatar><Avatar name={app.applicantNickname} src={app.profileImg || app.profileImageUrl} sx={{ width: 48, height: 48, border: '2px solid #EEF2FF' }} /></ListItemAvatar>
                  <ListItemText primary={<Typography sx={{ fontWeight: 900, color: '#111827', fontSize: '1.05rem' }}>{app.applicantNickname}</Typography>} secondary={<Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 600 }}>{POSITION_OPTIONS.find(p => p.value === app.applicantPosition)?.label || app.applicantPosition} · {app.createdAt?.split('T')[0]}</Typography>} />
                  <Chip label={app.status === 'PENDING' ? '대기중' : (app.status === 'ACCEPTED' ? '승인됨' : '거절됨')} size="small" sx={{ fontWeight: 900, px: 1, bgcolor: app.status === 'PENDING' ? '#FFFBEB' : (app.status === 'ACCEPTED' ? '#ECFDF5' : '#FEF2F2'), color: app.status === 'PENDING' ? '#D97706' : (app.status === 'ACCEPTED' ? '#10B981' : '#EF4444'), borderRadius: 1.5 }} />
                  <ArrowForwardIosIcon sx={{ fontSize: 14, ml: 2, color: '#D1D5DB' }} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ py: 12, textAlign: 'center' }}><AssignmentIcon sx={{ fontSize: 48, color: '#E5E7EB', mb: 2 }} /><Typography color="text.secondary" sx={{ fontWeight: 700 }}>아직 지원자가 없습니다.</Typography></Box>
          )}
        </DialogContent>
      </Dialog>

      {/* 지원서 상세 모달 */}
      <Dialog open={isAppDetailOpen} onClose={() => setIsAppDetailOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        {selectedApp && (
          <>
            <DialogTitle sx={{ fontWeight: 900, color: '#111827', bgcolor: '#F8F9FF', py: 3, px: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {selectedApp.applicantNickname}님의 지원서
              <IconButton onClick={() => setIsAppDetailOpen(false)} size="small" sx={{ color: '#9CA3AF' }}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 4 }}>
              <Stack spacing={3.5}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6366F1', fontWeight: 900, display: 'block', mb: 1.5, letterSpacing: '0.05em' }}>지원 정보</Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip label={POSITION_OPTIONS.find(p => p.value === selectedApp.applicantPosition)?.label || selectedApp.applicantPosition} sx={{ bgcolor: '#EEF2FF', color: '#6366F1', fontWeight: 900, borderRadius: 1.5 }} />
                    <Chip label={selectedApp.createdAt?.split('T')[0]} variant="outlined" sx={{ fontWeight: 700, borderRadius: 1.5, borderColor: '#E5E7EB' }} />
                  </Stack>
                  
                  {/* 💡 기술 스택 섹션 추가 */}
                  {selectedApp.techStacks && selectedApp.techStacks.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 800, display: 'block', mb: 1 }}>보유 기술 스택</Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
                        {selectedApp.techStacks.map((stack) => (
                          <Chip 
                            key={stack} 
                            label={stack} 
                            size="small" 
                            sx={{ bgcolor: '#F3F4F6', fontWeight: 700, borderRadius: 1, fontSize: '0.75rem' }} 
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6366F1', fontWeight: 900, display: 'block', mb: 1.5, letterSpacing: '0.05em' }}>지원 메시지</Typography>
                  <Typography sx={{ bgcolor: '#F9FAFB', p: 2.5, borderRadius: 2, border: '1px solid #F3F4F6', fontSize: '0.95rem', lineHeight: 1.7, fontWeight: 500, color: '#374151', whiteSpace: 'pre-line' }}>{selectedApp.message}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6366F1', fontWeight: 900, display: 'block', mb: 1.5, letterSpacing: '0.05em' }}>소통 채널</Typography>
                  <Typography sx={{ fontWeight: 800, color: '#111827', pl: 1 }}>{selectedApp.contact || '미입력'}</Typography>
                </Box>
                {selectedApp.link && (
                  <Box>
                    <Typography variant="caption" sx={{ color: '#6366F1', fontWeight: 900, display: 'block', mb: 1.5, letterSpacing: '0.05em' }}>참고 링크</Typography>
                    <Link href={selectedApp.link.startsWith('http') ? selectedApp.link : `https://${selectedApp.link}`} target="_blank" sx={{ fontWeight: 800, color: '#6366F1', textDecoration: 'none', '&:hover': { textDecoration: 'underline' }, pl: 1, wordBreak: 'break-all' }}>{selectedApp.link}</Link>
                  </Box>
                )}
                {selectedApp.status === 'PENDING' && (
                  <Stack direction="row" spacing={2} sx={{ pt: 3 }}>
                    <Button fullWidth variant="contained" onClick={() => handleStatusUpdate(selectedApp.id || selectedApp.applyId, 'ACCEPTED')} startIcon={<CheckIcon />} sx={{ bgcolor: '#6366F1', fontWeight: 900, py: 1.8, borderRadius: 2.5, boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)' }}>승인하기</Button>
                    <Button fullWidth variant="outlined" onClick={() => handleStatusUpdate(selectedApp.id || selectedApp.applyId, 'REJECTED')} startIcon={<CloseIcon />} sx={{ color: '#EF4444', borderColor: '#EF4444', fontWeight: 900, py: 1.8, borderRadius: 2.5, '&:hover': { bgcolor: '#FFF1F2', borderColor: '#EF4444' } }}>거절하기</Button>
                  </Stack>
                )}
              </Stack>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

const MenuButton = ({ icon, label, count, onClick }) => ( <Button fullWidth startIcon={icon} onClick={onClick} sx={{ justifyContent: 'flex-start', px: 2.5, py: 1.8, borderRadius: 3, fontWeight: 800, color: '#6B7280', '&:hover': { bgcolor: '#F9FAFB', color: '#6366F1' } }}><Box sx={{ flexGrow: 1, textAlign: 'left' }}>{label}</Box>{count !== undefined && <Chip label={count} size="small" sx={{ height: 22, fontWeight: 900, bgcolor: '#F3F4F6' }} />}</Button> );
const FormLabel = ({ text }) => <Typography variant="body2" sx={{ fontWeight: 800, mb: 1.5, ml: 0.5, color: '#374151' }}>{text}</Typography>;

// 💡 ActivityItem에서도 데이터 추출 경로를 안전하게 수정
const ActivityItem = ({ item, tabValue, onTitleClick, onManageClick, onViewAppsClick, onCancelClick }) => {
  // 💡 여기서도 똑같이 깊은 경로까지 체크해야 [프로젝트] 라벨이 제대로 뜹니다.
  const rawCategory = item?.category || item?.projectCategory || item?.project?.category || item?.post?.category || item?.postCategory;
  const categoryLabel = rawCategory === 'PROJECT' ? '[프로젝트]' : rawCategory === 'STUDY' ? '[스터디]' : '';
    
  const title = item.projectTitle || item.title || "제목 없음";
  const status = tabValue === 2 ? '참여중' : (item.status === 'PENDING' ? '대기중' : (item.status === 'ACCEPTED' ? '승인완료' : '거절됨'));
  
  const rawPosition = item.applicantPosition || item.position || (tabValue === 0 ? 'OWNER' : '선택없음');
  const position = POSITION_OPTIONS.find(p => p.value === rawPosition)?.label || rawPosition;
  
  const date = (item.createdAt || item.appliedDate || item.endDate || '-').split('T')[0];
  
  let info = '';
  if (tabValue === 0) {
    info = `내 역할: ${position} · 등록일: ${date}`;
  } else if (tabValue === 2) {
    info = `팀장: ${item.ownerNickname || '알수없음'} | 역할: ${position}`;
  } else {
    info = `지원 분야: ${position} · 신청일: ${date}`;
  }

  return ( <Box sx={{ p: 4, borderRadius: 5, bgcolor: '#F9FAFB', border: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', '&:hover': { bgcolor: 'white', boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }, transition: '0.2s' }}><Box sx={{ flex: 1 }}><Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}><Typography variant="h6" onClick={onTitleClick} sx={{ fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer', '&:hover': { color: '#6366F1', textDecoration: 'underline' } }}><Box component="span" sx={{ color: rawCategory === 'PROJECT' ? 'primary.main' : 'warning.main', mr: 1 }}>{categoryLabel}</Box>{title}</Typography>{tabValue !== 0 && ( <Chip label={status} size="small" sx={{ fontWeight: 900, bgcolor: status === '참여중' ? '#EEF2FF' : (status === '대기중' ? '#FFFBEB' : (status === '승인완료' ? '#ECFDF5' : '#FEF2F2')), color: status === '참여중' ? '#6366F1' : (status === '대기중' ? '#D97706' : (status === '승인완료' ? '#10B981' : '#EF4444')) }} /> )}</Stack><Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>{info}</Typography></Box><Stack direction="row" spacing={1}>{tabValue === 0 && ( <> <Button variant="contained" disableElevation onClick={onViewAppsClick} sx={{ bgcolor: '#6366F1', color: 'white', fontWeight: 900, borderRadius: 2 }}>지원서 보기</Button> <Button variant="contained" disableElevation onClick={onManageClick} sx={{ bgcolor: '#E0E7FF', color: '#4338CA', fontWeight: 900, borderRadius: 2 }}>관리</Button> </> )}{tabValue === 1 && item.status === 'PENDING' && <Button variant="outlined" color="error" onClick={onCancelClick} sx={{ fontWeight: 800, borderRadius: 2 }}>취소하기</Button>}</Stack></Box> );
};

const inputStyle = { '& .MuiOutlinedInput-root': { bgcolor: '#F9FAFB', borderRadius: 1.5, fontSize: '0.95rem', fontWeight: 600, '& fieldset': { border: '1px solid #E5E7EB' }, '&.Mui-focused fieldset': { borderWidth: '2px', borderColor: '#6366F1' }, '&.Mui-focused': { bgcolor: 'white' } } };

export default MyPage;