import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import theme from '@/styles/theme';
import MainLayout from '@/component/layout/MainLayout';
import ProtectedRoute from '@/component/common/ProtectedRoute';
import GuestRoute from '@/component/common/GuestRoute';

const MainPage = lazy(() => import('@/pages/MainPage.jsx'));
const PostDetailPage = lazy(() => import('@/pages/PostDetailPage.jsx'));
const LoginPage = lazy(() => import('@/pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage.jsx'));
const PostWritePage = lazy(() => import('@/pages/PostWritePage.jsx'));
const PostEditPage = lazy(() => import('@/pages/PostEditPage.jsx'));
const BoardPage = lazy(() => import('@/pages/BoardPage.jsx'));
const MyPage = lazy(() => import('@/pages/MyPage.jsx'));
const ErrorPage = lazy(() => import('@/pages/ErrorPage.jsx'));
const FindEmailPage = lazy(() => import('@/pages/FindEmailPage.jsx'));
const FindPasswordPage = lazy(() => import('@/pages/FindPasswordPage.jsx'));
const PostApplyPage = lazy(() => import('@/pages/PostApplyPage.jsx'));

const RouteFallback = () => (
  <Box sx={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
    <CircularProgress aria-label="페이지 로딩 중" />
  </Box>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route element={<MainLayout />}>
            {/* 1. 공개 페이지 */}
            <Route path="/" element={<MainPage />} />
            <Route path="/posts/:id" element={<PostDetailPage />} />
            <Route path="/find-email" element={<FindEmailPage />} />
            <Route path="/find-password" element={<FindPasswordPage />} />

            {/* 2. 로그인 및 회원가입 */}
            <Route path="/login" element={
              <GuestRoute><LoginPage /></GuestRoute>
            } />
            <Route path="/register" element={
              <GuestRoute><RegisterPage /></GuestRoute>
            } />

            {/* 3. 로그인 필요 페이지 */}
            <Route path="/posts/new" element={
              <ProtectedRoute><PostWritePage /></ProtectedRoute>
            } />
            <Route path="/posts/:id/edit" element={
              <ProtectedRoute><PostEditPage /></ProtectedRoute>
            } />
            <Route path="/posts/:id/board" element={
              <ProtectedRoute><BoardPage /></ProtectedRoute>
            } />
            {/* 2. 지원하기 페이지를 ProtectedRoute 내부로 이동 */}
            <Route path="/posts/:id/apply" element={
              <ProtectedRoute><PostApplyPage /></ProtectedRoute>
            } />
            
            <Route path="/mypage" element={
              <ProtectedRoute><MyPage /></ProtectedRoute>
            } />
            {/* 5. 에러 페이지 (항상 맨 아래에 위치) */}
            <Route path="*" element={<ErrorPage />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
}

export default App;