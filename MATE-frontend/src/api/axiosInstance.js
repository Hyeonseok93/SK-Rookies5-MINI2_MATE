import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
// 설계서 규격인 /api가 중복되지 않도록 처리
const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL.replace(/\/$/, '')}/api`;

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  withCredentials: true,
});

// Request Interceptor: 토큰 자동 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: 공통 응답 포맷 처리 및 토큰 자동 갱신
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => {
    // 1. 설계서 v1.1 규격: { success, data, message, timestamp }
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      if (response.data.success === true) {
        return response.data.data !== undefined ? response.data.data : response.data;
      }
      return Promise.reject(response.data);
    }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const { response } = error;
    const errorCode = response?.data?.error?.code;

    /**
     * 설계서 v1.1 AUTH_002: 액세스 토큰 만료 대응 로직
     */
    if (response?.status === 401 && errorCode === 'AUTH_002' && !originalRequest._retry) {
      if (isRefreshing) {
        // 이미 갱신 중이라면 큐에 담고 대기
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        try {
          // 중요: 무한 루프 방지를 위해 axiosInstance 대신 axios 원본 사용
          const refreshRes = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          
          if (refreshRes.data.success) {
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshRes.data.data;
            
            // 스토어 업데이트
            useAuthStore.getState().setTokens(newAccessToken, newRefreshToken || refreshToken);
            
            // 큐에 대기 중인 요청들 일괄 처리
            processQueue(null, newAccessToken);
            
            // 현재 요청 재시도
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          useAuthStore.getState().logout();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }

    /**
     * 설계서 v1.1 AUTH_003: 유효하지 않은 토큰 (강제 로그아웃)
     */
    if (response?.status === 401 && errorCode === 'AUTH_003') {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    // 설계서 공통 에러 포맷에 맞춰 에러 객체 반환
    return Promise.reject(response?.data || error);
  }
);

export default axiosInstance;
