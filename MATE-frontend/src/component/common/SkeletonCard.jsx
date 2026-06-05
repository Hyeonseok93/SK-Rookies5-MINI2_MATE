import React from 'react';
import { Card, Box, Skeleton } from '@mui/material';

export default function SkeletonCard() {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 4 }}>
      <Box sx={{ p: 3, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Skeleton variant="text" width={80} height={20} />
          <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 99 }} />
        </Box>
        <Skeleton variant="text" width="90%" height={32} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="100%" height={20} />
        <Skeleton variant="text" width="100%" height={20} sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Skeleton variant="rectangular" width={50} height={24} sx={{ borderRadius: 99 }} />
          <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 99 }} />
          <Skeleton variant="rectangular" width={40} height={24} sx={{ borderRadius: 99 }} />
        </Box>
      </Box>
      <Box sx={{ p: 2, borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="text" width={60} height={20} />
        </Box>
        <Skeleton variant="text" width={80} height={20} />
      </Box>
    </Card>
  );
}
