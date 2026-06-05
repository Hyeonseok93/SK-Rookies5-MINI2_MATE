import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

/**
 * ProtectedRoute: 로그인 여부 및 권한(Role)에 따른 접근 제어
 * - accessToken 또는 user 정보가 없으면 /login으로 리다이렉트
 * - requiredRole이 지정되었으나 유저의 role과 다르면 메인(/)으로 리다이렉트
 */
const ProtectedRoute = ({ children, requireRole }) => {
  const { accessToken, user } = useAuthStore();

  // 토큰 또는 유저 정보가 없으면 비로그인 상태로 판단
  if (!accessToken || !user) {
    return <Navigate to="/login" replace />;
  }

  // 특정 권한이 필요한 경우 유저의 권한과 대조
  if (requireRole && user.role !== requireRole) {
    // 권한이 없으면 메인 페이지로 리다이렉트
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
