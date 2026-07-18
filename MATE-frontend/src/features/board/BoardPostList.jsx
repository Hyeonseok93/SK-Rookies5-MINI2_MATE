import { Box, Chip, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Pagination } from '@mui/material';
import CreateIcon from '@mui/icons-material/Create';
import ForumIcon from '@mui/icons-material/Forum';
import CustomButton from '../../component/common/Button';
import Avatar from '../../component/common/Avatar';
import { getAssetUrl } from '../../config/runtime';
import { formatDate } from '../../utils/apiUtils';

export default function BoardPostList({ posts, page, totalPages, onPageChange, onOpenPost, onWrite }) {
  return (
    <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 5, border: '1px solid #EEEEEE', minHeight: 600 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: '#111827', display: 'flex', alignItems: 'center', gap: 1.5 }}><ForumIcon color="primary" /> 팀 커뮤니케이션</Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>팀원들과 아이디어를 공유하고 프로젝트 현황을 기록하세요.</Typography>
        </Box>
        <CustomButton variant="contained" startIcon={<CreateIcon />} onClick={onWrite} sx={{ borderRadius: 4, px: 4, height: 48 }}>새 글 작성하기</CustomButton>
      </Box>
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead><TableRow sx={{ bgcolor: '#F9FAFB' }}><TableCell>구분</TableCell><TableCell>제목</TableCell><TableCell>작성자</TableCell><TableCell>작성일</TableCell><TableCell align="center">조회</TableCell></TableRow></TableHead>
          <TableBody>
            {posts.length ? posts.map((post) => (
              <TableRow key={post.id} hover onClick={() => onOpenPost(post)} sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#F0F2FF !important' } }}>
                <TableCell><Chip label={post.type === 'NOTICE' ? '공지' : post.type === 'QUESTION' ? '질문' : '일반'} size="small" /></TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{post.title}</TableCell>
                <TableCell><Stack direction="row" spacing={1} alignItems="center"><Avatar name={post.authorNickname} size="sm" src={getAssetUrl(post.authorProfileImageUrl || post.authorProfileImg)} /><Typography variant="body2">{post.authorNickname}</Typography></Stack></TableCell>
                <TableCell>{formatDate(post.createdAt, '.')}</TableCell>
                <TableCell align="center">{post.viewCount || 0}</TableCell>
              </TableRow>
            )) : <TableRow><TableCell colSpan={5} sx={{ py: 10, textAlign: 'center', color: '#9CA3AF' }}>등록된 게시글이 없습니다.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>
      {totalPages > 1 && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><Pagination count={totalPages} page={page + 1} onChange={(_, value) => onPageChange(value - 1)} color="primary" /></Box>}
    </Paper>
  );
}
