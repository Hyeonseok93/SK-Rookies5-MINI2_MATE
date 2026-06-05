import axiosInstance from './axiosInstance';

export const authApi = {
  // --- 1. 인증 관련 (Auth) ---

  // 로그인 API (POST /api/auth/login)
  login: async (credentials) => {
    return await axiosInstance.post('/auth/login', credentials);
  },

  // 이메일 중복 확인 (GET /api/auth/check-email)
  checkEmail: async (email) => {
    return await axiosInstance.get(`/auth/check-email?email=${encodeURIComponent(email)}`);
  },

  // 닉네임 중복 확인 (GET /api/auth/check-nickname)
  checkNickname: async (nickname) => {
    return await axiosInstance.get(`/auth/check-nickname?nickname=${encodeURIComponent(nickname)}`);
  },

  // 전화번호 중복 확인 (GET /api/auth/check-phone)
  checkPhone: async (phoneNumber) => {
    return await axiosInstance.get(`/auth/check-phone?phoneNumber=${phoneNumber}`);
  },

  // 회원가입 API (POST /api/auth/signup)
  signup: async (userData) => {
    return await axiosInstance.post('/auth/signup', userData);
  },

  // 아이디(이메일) 찾기 (POST /api/auth/find-email)
  findEmail: async (phoneNumber) => {
    // 설계서 v1.1: Request Query Parameter로phoneNumber 전달
    return await axiosInstance.post('/auth/find-email', { phoneNumber });
  },

  // 비밀번호 재설정 (POST /api/auth/reset-password)
  resetPassword: async (email, phoneNumber) => {
    // 백엔드 로그 확인 결과 @RequestParam을 사용하므로 params로 전달
    return await axiosInstance.post('/auth/reset-password', { email, phoneNumber });
  },

  // 로그아웃 API (POST /api/auth/logout)
  logout: async () => {
    return await axiosInstance.post('/auth/logout');
  },

  // 토큰 갱신 API (POST /api/auth/refresh)
  refresh: async (refreshToken) => {
    return await axiosInstance.post('/auth/refresh', { refreshToken });
  },


  // --- 2. 마이페이지/유저 관련 (Users) ---

  // 내 프로필 정보 조회 (GET /api/users/me)
  getUserInfo: async () => {
    return await axiosInstance.get('/users/me');
  },

  // 내 정보 수정 (설계서 v1.1: PATCH /api/users/me)
  updateUserProfile: async (userData) => {
    return await axiosInstance.patch('/users/me', userData);
  },

  // 프로필 이미지 수정 (PATCH /api/users/profile-image)
  updateProfileImage: async (formData) => {
    return await axiosInstance.patch('/users/profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // 프로필 이미지 삭제 (DELETE /api/users/profile-image)
  deleteProfileImage: async () => {
    return await axiosInstance.delete('/users/profile-image');
  },

  // 회원 탈퇴 (DELETE /api/users/me)
  withdraw: async () => {
    return await axiosInstance.delete('/users/me');
  },

  // 내 모집글 조회 (GET /api/users/me/posts/owned)
  getMyOwnedPosts: async () => {
    return await axiosInstance.get('/users/me/posts/owned');
  },

  // 참여 중인 프로젝트 조회 (GET /api/users/me/posts/joined)
  getMyJoinedPosts: async () => {
    return await axiosInstance.get('/users/me/posts/joined');
  },

  // 내 신청 현황 조회 (GET /api/users/me/applications)
  getMyApplications: async () => {
    return await axiosInstance.get('/users/me/applications');
  }
};

export default authApi;
