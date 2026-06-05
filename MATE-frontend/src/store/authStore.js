import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 사용자 인증 상태 관리 스토어 (REST API 설계서 v1.1 반영)
 * 설계서 규격(id, profileImg)과 프론트엔드 규격(userId, profileImageUrl) 간의 브릿지 역할을 수행합니다.
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isLoggedIn: false,

      // 로그인 성공 시 호출
      setAuth: (accessToken, refreshToken, userData) => {
        if (!userData) return;

        // 설계서 v1.1 규격을 프론트엔드 내부 규격으로 매핑
        const mappedUser = {
          ...userData,
          userId: userData.id || userData.userId, // id(v1.1) -> userId
          profileImageUrl: userData.profileImg || userData.profileImageUrl // profileImg(v1.1) -> profileImageUrl
        };

        set({
          accessToken,
          refreshToken,
          user: mappedUser,
          isLoggedIn: !!accessToken,
        });
      },

      // 토큰 만료 시 갱신용
      setTokens: (accessToken, refreshToken) => {
        set({
          accessToken,
          refreshToken,
          isLoggedIn: !!accessToken,
        });
      },

      // 유저 정보 부분 업데이트 (마이페이지 등)
      updateUser: (userData) => {
        if (!userData) return;

        set((state) => {
          const currentUser = state.user || {};
          const updatedUser = {
            ...currentUser,
            ...userData,
            userId: userData.id || userData.userId || currentUser.userId,
            profileImageUrl: userData.profileImg || userData.profileImageUrl || currentUser.profileImageUrl
          };

          return { user: updatedUser };
        });
      },

      // 로그아웃 (상태 및 스토리지 초기화)
      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isLoggedIn: false,
        });
        localStorage.removeItem('mate-auth');
      },
    }),
    {
      name: 'mate-auth',
    }
  )
);
