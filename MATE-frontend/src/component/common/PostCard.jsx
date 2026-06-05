import React from 'react';
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Badge from './Badge';
import Tag from './Tag';
import Avatar from './Avatar';
import { getDynamicStatus } from '../../utils/statusUtils';

// 💡 [이미지 경로 최적화 함수]
const getProfileImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const baseUrl = "http://localhost:8080";
  const formattedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${formattedPath}`;
};

export default function PostCard({ post, isLoading }) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card sx={{ 
        width: '100%', height: 300, borderRadius: 2.5, border: '1px solid #E5E7EB', bgcolor: '#ffffff' 
      }}>
        <Box sx={{ p: 2.5, flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
            <Skeleton variant="text" width={60} height={20} />
            <Skeleton variant="circular" width={20} height={20} />
          </Box>
          <Skeleton variant="text" width="70%" height={28} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="100%" height={40} />
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Skeleton variant="rectangular" width={40} height={20} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={40} height={20} sx={{ borderRadius: 1 }} />
          </Box>
        </Box>
        <Box sx={{ p: 1.5, borderTop: '1px solid #E5E7EB' }}>
          <Skeleton variant="text" width="30%" />
        </Box>
      </Card>
    );
  }

  if (!post) return null;

  const dynamicStatus = getDynamicStatus(post);
  const isDeadlineSoon = dynamicStatus === 'DEADLINE_SOON';
  const isClosed = dynamicStatus === 'CLOSED';

  const {
    projectId,
    id,
    category,
    title,
    content,
    recruitCount,
    currentCount,
    endDate,
    ownerNickname,
    ownerProfileImg,
    techStacks = [],
  } = post;

  const displayId = projectId || id;
  const categoryLabel = category === 'PROJECT' ? '[프로젝트]' : category === 'STUDY' ? '[스터디]' : '';

  const cardStyle = {
    width: '100%',
    height: 300, 
    display: 'flex', 
    flexDirection: 'column',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: 2.5, 
    border: '1px solid',
    borderColor: isDeadlineSoon ? '#F59E0B' : '#E5E7EB',
    bgcolor: '#ffffff',
    boxSizing: 'border-box',
    overflow: 'hidden',
    position: 'relative',
    filter: isClosed ? 'grayscale(0.8)' : 'none',
    opacity: isClosed ? 0.65 : 1,
    '&:hover': {
      transform: 'translateY(-6px)',
      boxShadow: '0 12px 30px rgba(108,99,255,0.15)',
      borderColor: 'primary.main',
    },
    ...(isDeadlineSoon && {
      boxShadow: '0 0 0 1px rgba(245, 158, 11, 0.2)',
    })
  };

  const pulseKeyframes = {
    '@keyframes pulse': {
      '0%': { transform: 'scale(1)', opacity: 1 },
      '50%': { transform: 'scale(1.05)', opacity: 0.8 },
      '100%': { transform: 'scale(1)', opacity: 1 },
    }
  };

  const calculateDDay = (dateStr) => {
    if (!dateStr) return '미정';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    if (isNaN(target)) return '날짜오류';
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? `D-${diff}` : '만료';
  };

  return (
    <Card onClick={() => navigate(`/posts/${displayId}`)} sx={cardStyle}>
      <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            alignItems: 'center',
            ...pulseKeyframes,
            animation: isDeadlineSoon ? 'pulse 2s infinite ease-in-out' : 'none'
          }}>
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, bgcolor: 'primary.soft', px: 1, py: 0.2, borderRadius: 1 }}>
              {currentCount}/{recruitCount}명
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.muted', fontWeight: 600 }}>
              {calculateDDay(endDate)}
            </Typography>
          </Box>
          <Badge status={dynamicStatus} />
        </Box>

        <Typography variant="h6" sx={{ 
          fontSize: '1.1rem', 
          fontWeight: 800, 
          lineHeight: 1.3, 
          mb: 1,
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          color: 'text.primary',
        }}>
          {categoryLabel} {title}
        </Typography>

        <Typography variant="body2" sx={{ 
          color: 'text.secondary',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: 1.5,
          mb: 2,
          fontSize: '0.85rem'
        }}>
          {content}
        </Typography>

        <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap', mt: 'auto' }}>
          {techStacks.slice(0, 4).map((stack, idx) => (
            <Tag key={idx} label={stack} />
          ))}
          {techStacks.length > 4 && <Typography variant="caption" sx={{ color: 'text.muted', alignSelf: 'center', ml: 0.5 }}>+{techStacks.length - 4}</Typography>}
        </Box>
      </CardContent>

      <Box sx={{ p: 2, borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#FAFAFF' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* 💡 프로필 이미지 URL 변환 적용 */}
          <Avatar name={ownerNickname} src={getProfileImageUrl(ownerProfileImg)} size="sm" />
          <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 700, fontSize: '0.8rem' }}>
            {ownerNickname}
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: 'text.muted', fontWeight: 500 }}>
          ~ {endDate}
        </Typography>
      </Box>
    </Card>
  );
}