import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/styles/theme';
import MainLayout from '@/component/layout/MainLayout';
import ProtectedRoute from '@/component/common/ProtectedRoute';
import GuestRoute from '@/component/common/GuestRoute';

// Pages
import MainPage from '@/pages/MainPage.jsx';
import PostDetailPage from '@/pages/PostDetailPage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import RegisterPage from '@/pages/RegisterPage.jsx';
import PostWritePage from '@/pages/PostWritePage.jsx';
import PostEditPage from '@/pages/PostEditPage.jsx';
import BoardPage from '@/pages/BoardPage.jsx';
import MyPage from '@/pages/MyPage.jsx';
import MyPostsPage from '@/pages/MyPostsPage.jsx';
import MyAppliesPage from '@/pages/MyAppliesPage.jsx';
import ErrorPage from '@/pages/ErrorPage.jsx';
import FindEmailPage from '@/pages/FindEmailPage.jsx';
import FindPasswordPage from '@/pages/FindPasswordPage.jsx';
import PostApplyPage from '@/pages/PostApplyPage.jsx'; // 1. 임포트 추가

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
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
            <Route path="/mypage/posts" element={
              <ProtectedRoute><MyPostsPage /></ProtectedRoute>
            } />
            <Route path="/mypage/applies" element={
              <ProtectedRoute><MyAppliesPage /></ProtectedRoute>
            } />

            {/* 5. 에러 페이지 (항상 맨 아래에 위치) */}
            <Route path="*" element={<ErrorPage />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;