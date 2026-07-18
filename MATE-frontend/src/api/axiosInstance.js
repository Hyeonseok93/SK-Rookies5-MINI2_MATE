import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { API_BASE_URL } from '../config/runtime';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
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

      try {
        // Refresh Token은 HttpOnly 쿠키로만 전송한다. 무한 루프 방지를 위해 원본 axios를 사용한다.
        const refreshRes = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
          
        if (refreshRes.data.success) {
          const { accessToken: newAccessToken } = refreshRes.data.data;
            
          useAuthStore.getState().setAccessToken(newAccessToken);
            
          processQueue(null, newAccessToken);
            
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
