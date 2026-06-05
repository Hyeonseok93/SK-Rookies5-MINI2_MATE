import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Box, Typography, Paper, Divider, 
  Stack, Chip, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, LinearProgress, IconButton, Menu, MenuItem, Button
} from '@mui/material';

// Icons
import CreateIcon from '@mui/icons-material/Create';
import ForumIcon from '@mui/icons-material/Forum';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// 공통 컴포넌트
import Breadcrumb from '../component/common/Breadcrumb';
import CustomButton from '../component/common/Button';
import Pagination from '../component/common/Pagination';
import CommentItem from '../component/common/CommentItem';
import Avatar from '../component/common/Avatar';

// 상수
import { POSITION_OPTIONS } from '../constants/techStacks';

// API & Store
import boardApi from '../api/boardApi';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';

// 💡 [이미지 경로 최적화 함수]
// 슬래시가 겹치거나 누락되는 문제를 방지합니다.
const getProfileImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const baseUrl = "http://localhost:8080";
  const formattedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${formattedPath}`;
};

const BoardPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { showToast, openModal } = useUiStore();

  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [projectInfo, setProjectInfo] = useState({ title: "프로젝트 게시판", members: [], ownerId: null });
  
  const [currentPage, setCurrentPage] = useState(0);
  const [pageInfo, setPageInfo] = useState({ totalPages: 0, totalElements: 0 });
  
  const [selectedPost, setSelectedPost] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [postForm, setPostForm] = useState({ title: '', content: '', type: 'GENERAL' });
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [postMenuAnchor, setPostMenuAnchor] = useState(null);

  // 팀원 강퇴 핸들러
  const handleKickMember = (member) => {
    openModal('confirm', {
      title: '팀원 제외',
      message: `정말로 '${member.nickname}'님을 팀에서 제외하시겠습니까?`,
      confirmText: '제외하기',
      color: 'error',
      onConfirm: async () => {
        try {
          await boardApi.kickMember(member.id || member.userId);
          showToast(`${member.nickname}님이 팀에서 제외되었습니다.`, 'success');
          const membersRes = await boardApi.getProjectMembers(id);
          setProjectInfo(prev => ({ ...prev, members: membersRes || [] }));
        } catch (err) {
          console.error("Kick member error:", err);
          showToast(err.error?.message || '멤버 제외에 실패했습니다.', 'error');
        }
      }
    });
  };

  // 날짜 포맷팅 유틸리티
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.split('T')[0].replace(/-/g, '.');
  };

  const fetchPosts = useCallback(async (page) => {
    try {
      const response = await boardApi.getBoardPosts(id, page, 10);
      const postData = response.data || response.content || (Array.isArray(response) ? response : []);
      setPosts(postData);

      if (response.page) {
        setPageInfo({
          totalPages: response.page.totalPages || 0,
          totalElements: response.page.totalElements || 0
        });
      } else {
        setPageInfo({
          totalPages: 1,
          totalElements: postData.length
        });
      }
    } catch (err) {
      console.error("Fetch posts error:", err);
      showToast(err.error?.message || '게시글 목록을 불러오지 못했습니다.', 'error');
    }
  }, [id, showToast]);

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        const [postsRes, projectRes, membersRes] = await Promise.all([
          boardApi.getBoardPosts(id, 0, 10),
          boardApi.getProjectDetail(id),
          boardApi.getProjectMembers(id)
        ]);

        const postData = postsRes.data || postsRes.content || (Array.isArray(postsRes) ? postsRes : []);
        setPosts(postData);
        
        if (postsRes.page) {
          setPageInfo({
            totalPages: postsRes.page.totalPages || 0,
            totalElements: postsRes.page.totalElements || 0
          });
        }

        if (projectRes) {
          setProjectInfo({
            ...projectRes,
            members: membersRes || []
          });
        }
      } catch (err) {
        console.error("Init board error:", err);
        showToast(err.error?.message || '데이터를 불러오는데 실패했습니다.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, [id, showToast]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchPosts(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePostClick = async (post) => {
    try {
      const response = await boardApi.getBoardPostDetail(id, post.id);
      const commentRes = await boardApi.getComments(id, post.id);
      if (response) {
        setSelectedPost(response);
        setComments(commentRes || []);
        setIsDetailOpen(true);
        setPosts(prev => prev.map(p => p.id === post.id ? { ...p, viewCount: (p.viewCount || 0) + 1 } : p));
      }
    } catch (err) {
      console.error("Fetch post detail error:", err);
      showToast(err.error?.message || '상세 내용을 불러오지 못했습니다.', 'error');
    }
  };

  const handleOpenWrite = () => {
    setIsEditing(false);
    setPostForm({ title: '', content: '', type: 'GENERAL' });
    setIsWriteOpen(true);
  };

  const handleOpenEdit = () => {
    setIsEditing(true);
    setPostForm({ title: selectedPost.title, content: selectedPost.content, type: selectedPost.type });
    setIsWriteOpen(true);
    setPostMenuAnchor(null);
  };

  const handleSavePost = async () => {
    if (!postForm.title.trim() || !postForm.content.trim()) {
      showToast('제목과 내용을 모두 입력해주세요.', 'warning');
      return;
    }
    try {
      if (isEditing) {
        await boardApi.updateBoardPost(id, selectedPost.id, postForm);
        showToast('게시글이 수정되었습니다.', 'success');
      } else {
        await boardApi.createBoardPost(id, postForm);
        showToast('게시글이 등록되었습니다.', 'success');
        setCurrentPage(0); 
      }
      setIsWriteOpen(false);
      fetchPosts(isEditing ? currentPage : 0);
    } catch (err) {
      console.error("Save post error:", err);
      showToast(err.error?.message || '처리에 실패했습니다.', 'error');
    }
  };

  const handleDeletePost = () => {
    setPostMenuAnchor(null);
    openModal('confirm', {
      title: '게시글 삭제',
      message: '정말로 이 게시글을 삭제하시습니까?',
      confirmText: '삭제하기',
      color: 'error',
      onConfirm: async () => {
        try {
          await boardApi.deleteBoardPost(id, selectedPost.id);
          showToast('게시글이 삭제되었습니다.', 'success');
          setIsDetailOpen(false);
          fetchPosts(currentPage);
        } catch (err) {
          console.error("Delete post error:", err);
          showToast(err.error?.message || '삭제에 실패했습니다.', 'error');
        }
      }
    });
  };

  const handleCreateComment = async () => {
    if (!newComment.trim()) return;
    try {
      await boardApi.createComment(id, selectedPost.id, newComment);
      setNewComment('');
      const commentRes = await boardApi.getComments(id, selectedPost.id);
      setComments(commentRes || []);
      showToast('댓글이 등록되었습니다.', 'success');
    } catch (err) {
      console.error("Create comment error:", err);
      showToast(err.error?.message || '댓글 등록 실패', 'error');
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment);
    setNewComment(comment.content);
  };

  const handleUpdateComment = async () => {
    if (!newComment.trim()) return;
    try {
      await boardApi.updateComment(editingComment.id, newComment);
      setEditingComment(null);
      setNewComment('');
      const commentRes = await boardApi.getComments(id, selectedPost.id);
      setComments(commentRes || []);
      showToast('댓글이 수정되었습니다.', 'success');
    } catch (err) {
      console.error("Update comment error:", err);
      showToast(err.error?.message || '수정 실패', 'error');
    }
  };

  const handleDeleteComment = (commentId) => {
    openModal('confirm', {
      title: '댓글 삭제',
      message: '정말로 이 댓글을 삭제하시겠습니까?',
      confirmText: '삭제',
      color: 'error',
      onConfirm: async () => {
        try {
          await boardApi.deleteComment(commentId);
          const commentRes = await boardApi.getComments(id, selectedPost.id);
          setComments(commentRes || []);
          showToast('댓글이 삭제되었습니다.', 'success');
        } catch (err) {
          console.error("Delete comment error:", err);
          showToast(err.error?.message || '삭제 실패', 'error');
        }
      }
    });
  };

  const isPostAuthor = selectedPost && currentUser && Number(selectedPost.authorId) === Number(currentUser.userId);
  const isProjectOwner = projectInfo && currentUser && Number(projectInfo.ownerId) === Number(currentUser.userId);

  if (isLoading) return <LinearProgress />;

  return (
    <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100vh', pt: '100px', pb: 10 }}>
      <Container maxWidth="lg">
        <Breadcrumb items={[{ label: '홈', path: '/' }, { label: '프로젝트 탐색', path: `/posts` }, { label: projectInfo.title, path: `/posts/${id}` }, { label: '전용 게시판' }]} />

        <Paper elevation={0} sx={{ p: 4, mt: 2, mb: 4, borderRadius: 5, border: '1px solid #EEEEEE', background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FF 100%)', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
          <Box><Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}><InfoOutlinedIcon sx={{ color: 'primary.main', fontSize: 20 }} /><Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: '0.1em' }}>PROJECT DASHBOARD</Typography></Stack><Typography variant="h4" sx={{ fontWeight: 900, color: '#111827', letterSpacing: '-0.02em' }}>{projectInfo.title}</Typography></Box>
          <CustomButton variant="outlined" onClick={() => navigate(`/posts/${id}`)} endIcon={<ChevronRightIcon />} sx={{ borderRadius: 3, px: 4, height: 48, fontWeight: 800, bgcolor: 'white' }}>원본 모집글 상세 보기</CustomButton>
        </Paper>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
          <Box sx={{ flex: 8.5 }}>
            <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 5, border: '1px solid #EEEEEE', minHeight: '600px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 5 }}>
                <Box><Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: '#111827', display: 'flex', alignItems: 'center', gap: 1.5 }}><ForumIcon color="primary" /> 팀 커뮤니케이션</Typography><Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>팀원들과 아이디어를 공유하고 프로젝트 현황을 기록하세요.</Typography></Box>
                <CustomButton variant="contained" startIcon={<CreateIcon />} onClick={handleOpenWrite} sx={{ borderRadius: 4, px: 4, height: 48 }}>새 글 작성하기</CustomButton>
              </Box>
              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead><TableRow sx={{ bgcolor: '#F9FAFB' }}><TableCell sx={{ fontWeight: 800, color: '#6B7280', py: 2 }}>구분</TableCell><TableCell sx={{ fontWeight: 800, color: '#6B7280' }}>제목</TableCell><TableCell sx={{ fontWeight: 800, color: '#6B7280' }}>작성자</TableCell><TableCell sx={{ fontWeight: 800, color: '#6B7280' }}>작성일</TableCell><TableCell sx={{ fontWeight: 800, color: '#6B7280', textAlign: 'center' }}>조회</TableCell></TableRow></TableHead>
                  <TableBody>
                    {posts && posts.length > 0 ? ( posts.map((post) => ( <TableRow key={post.id} hover onClick={() => handlePostClick(post)} sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#F0F2FF !important' } }}><TableCell sx={{ py: 2.5 }}><Chip label={post.type === 'NOTICE' ? '공지' : post.type === 'QUESTION' ? '질문' : '일반'} size="small" sx={{ bgcolor: post.type === 'NOTICE' ? '#FFFBEB' : (post.type === 'QUESTION' ? '#EFF6FF' : '#F3F4F6'), color: post.type === 'NOTICE' ? '#D97706' : (post.type === 'QUESTION' ? '#2563EB' : '#4B5563'), fontWeight: 900, borderRadius: 1.5 }} /></TableCell><TableCell sx={{ fontWeight: 700, fontSize: '1rem', color: '#1F2937' }}>{post.title}</TableCell>
                    <TableCell><Stack direction="row" spacing={1} alignItems="center">
                      {/* 💡 작성자의 프로필 이미지 URL 변환 적용 */}
                      <Avatar name={post.authorNickname} size="sm" src={getProfileImageUrl(post.authorProfileImg || post.authorProfileImageUrl)} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{post.authorNickname}</Typography></Stack></TableCell>
                    <TableCell sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>{formatDate(post.createdAt)}</TableCell><TableCell sx={{ textAlign: 'center' }}><Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600 }}>{post.viewCount || 0}</Typography></TableCell></TableRow> )) ) : ( <TableRow><TableCell colSpan={5} sx={{ py: 10, textAlign: 'center', color: '#9CA3AF' }}>등록된 게시글이 없습니다.</TableCell></TableRow> )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><Pagination page={currentPage} totalPages={pageInfo.totalPages} onPageChange={handlePageChange} /></Box>
            </Paper>
          </Box>

          <Box sx={{ flex: 3.5 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 5, border: '1px solid #EEEEEE', position: 'sticky', top: '100px' }}>
              <Typography variant="caption" sx={{ fontWeight: 900, color: '#D1D5DB', display: 'block', mb: 3, letterSpacing: '0.1em' }}>TEAM MEMBERS ({projectInfo.members.length})</Typography>
              <Stack spacing={2.5}>
                {[...projectInfo.members]
                  .sort((a, b) => {
                    // 1. OWNER 우선 정렬
                    if (a.role === 'OWNER') return -1;
                    if (b.role === 'OWNER') return 1;
                    // 2. 그 외에는 닉네임 가나다순 정렬
                    return a.nickname.localeCompare(b.nickname);
                  })
                  .map((member) => (
                  <Box key={member.nickname} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      {/* 💡 팀 멤버의 프로필 이미지 URL 변환 적용 */}
                      <Avatar name={member.nickname} size="md" src={getProfileImageUrl(member.profileImg || member.profileImageUrl)} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#111827' }}>{member.nickname}</Typography>
                        <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600 }}>
                          {POSITION_OPTIONS.find(p => p.value === member.position)?.label || member.position}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {member.role === 'OWNER' ? (
                        <Chip label="OWNER" size="small" sx={{ bgcolor: '#FFFBEB', color: '#B45309', fontWeight: 900, fontSize: '0.65rem', borderRadius: 1 }} />
                      ) : (
                        isProjectOwner && (
                          <IconButton 
                            size="small" 
                            onClick={() => handleKickMember(member)}
                            sx={{ color: '#EF4444', bgcolor: '#FEF2F2', '&:hover': { bgcolor: '#FEE2E2' }, borderRadius: 1.5 }}
                          >
                            <DeleteIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        )
                      )}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Box>
        </Box>
      </Container>

      {/* 작성/수정 모달 */}
      <Dialog open={isWriteOpen} onClose={() => setIsWriteOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '24px' } }}>
        <DialogTitle component="div" sx={{ p: 4, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#111827' }}>{isEditing ? '게시글 수정' : '새로운 소식 작성'}</Typography>
          <IconButton onClick={() => setIsWriteOpen(false)} sx={{ color: '#9CA3AF' }}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 4, py: 2 }}>
          <Stack spacing={4} sx={{ mt: 1 }}>
            <Box><Typography variant="caption" sx={{ fontWeight: 800, color: '#6C63FF', mb: 2, display: 'block' }}>Category</Typography><Stack direction="row" spacing={1.5}>{[ { label: '일반', value: 'GENERAL', color: '#6B7280', bg: '#F3F4F6' }, { label: '공지', value: 'NOTICE', color: '#E11D48', bg: '#FFF1F2' }, { label: '질문', value: 'QUESTION', color: '#2563EB', bg: '#EFF6FF' }].map((cat) => ( <Box key={cat.value} onClick={() => setPostForm({...postForm, type: cat.value})} sx={{ px: 3, py: 1, borderRadius: '10px', cursor: 'pointer', transition: '0.2s', fontSize: '0.9rem', fontWeight: 900, border: '2px solid', borderColor: postForm.type === cat.value ? cat.color : 'transparent', bgcolor: postForm.type === cat.value ? cat.bg : '#F9FAFB', color: postForm.type === cat.value ? cat.color : '#9CA3AF' }}>{cat.label}</Box> ))}</Stack></Box>
            <Box><Typography variant="caption" sx={{ fontWeight: 800, color: '#6C63FF', mb: 1.5, display: 'block' }}>Title</Typography><TextField fullWidth placeholder="제목을 입력해 주세요" variant="standard" value={postForm.title} onChange={(e) => setPostForm({...postForm, title: e.target.value})} InputProps={{ disableUnderline: true, sx: { fontSize: '1.25rem', fontWeight: 800, color: '#111827' } }} /><Box sx={{ height: '2px', width: '100%', bgcolor: '#F3F4F6', mt: 1 }} /></Box>
            <Box><Typography variant="caption" sx={{ fontWeight: 800, color: '#6C63FF', mb: 1.5, display: 'block' }}>Content</Typography><TextField fullWidth multiline rows={10} placeholder="이야기를 나누어 보세요." variant="outlined" value={postForm.content} onChange={(e) => setPostForm({...postForm, content: e.target.value})} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px', bgcolor: '#F9FAFB', '& textarea': { color: '#111827' } } }} /></Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 0 }}><CustomButton onClick={handleSavePost} variant="contained" fullWidth sx={{ height: '56px', borderRadius: '16px', fontWeight: 900 }}>{isEditing ? '수정 완료' : '등록하기'}</CustomButton></DialogActions>
      </Dialog>

      {/* 상세 모달 */}
      <Dialog open={isDetailOpen} onClose={() => setIsDetailOpen(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: '28px' } }}>
        {selectedPost && (
          <>
            <Box sx={{ p: 5, pb: 0, position: 'relative' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                <Box>
                  <Chip label={selectedPost.type === 'NOTICE' ? '📢 공지사항' : '💬 일반'} sx={{ fontWeight: 900, borderRadius: '8px', mb: 2 }} />
                  <Typography variant="h3" sx={{ fontWeight: 900, color: '#111827' }}>{selectedPost.title}</Typography>
                </Box>
                <Stack direction="row" spacing={1} sx={{ mt: -1, mr: -1 }}>
                  {(isPostAuthor || isProjectOwner) && (
                    <Box>
                      <IconButton onClick={(e) => setPostMenuAnchor(e.currentTarget)} sx={{ bgcolor: '#F3F4F6' }}><MoreVertIcon /></IconButton>
                      <Menu anchorEl={postMenuAnchor} open={Boolean(postMenuAnchor)} onClose={() => setPostMenuAnchor(null)}>
                        {isPostAuthor && <MenuItem onClick={handleOpenEdit}><EditIcon sx={{ mr: 1, fontSize: 18 }} /> 수정하기</MenuItem>}
                        <MenuItem onClick={handleDeletePost} sx={{ color: 'error.main' }}><DeleteIcon sx={{ mr: 1, fontSize: 18 }} /> 삭제하기</MenuItem>
                      </Menu>
                    </Box>
                  )}
                  <IconButton onClick={() => setIsDetailOpen(false)} sx={{ color: '#9CA3AF' }}><CloseIcon /></IconButton>
                </Stack>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ pb: 4, borderBottom: '1px solid #F3F4F6' }}>
                {/* 💡 상세 모달 내부 작성자의 프로필 이미지 URL 변환 적용 */}
                <Avatar name={selectedPost.authorNickname} size="lg" src={getProfileImageUrl(selectedPost.authorProfileImg || selectedPost.authorProfileImageUrl)} />
                <Box sx={{ flex: 1 }}><Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#111827' }}>{selectedPost.authorNickname}</Typography><Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600 }}>{formatDate(selectedPost.createdAt)} · 조회 {selectedPost.viewCount || 0}</Typography></Box>
              </Stack>
            </Box>
            <DialogContent sx={{ px: 5, py: 4 }}>
              <Typography sx={{ whiteSpace: 'pre-line', lineHeight: 2, color: '#374151', fontSize: '1.125rem', mb: 8 }}>{selectedPost.content}</Typography>
              <Divider sx={{ mb: 6 }} />
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 4, color: '#111827' }}>댓글 ({comments.length})</Typography>
              <Stack spacing={1}>{comments.map((comment) => ( <CommentItem key={comment.id} comment={comment} currentUserId={currentUser?.userId} projectOwnerId={projectInfo.ownerId} onEdit={handleEditComment} onDelete={handleDeleteComment} /> ))}</Stack>
            </DialogContent>
            <Box sx={{ p: 4, bgcolor: '#F9FAFB', borderTop: '1px solid #F3F4F6' }}>
              <Stack direction="row" spacing={2} sx={{ bgcolor: 'white', p: 1, borderRadius: '16px', border: '1px solid #E5E7EB', alignItems: 'center' }}>
                <TextField fullWidth placeholder={editingComment ? "댓글을 수정하세요..." : "댓글을 입력하세요..."} variant="standard" InputProps={{ disableUnderline: true, sx: { px: 2, py: 1, color: '#111827' } }} value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                <Stack direction="row" spacing={1} sx={{ pr: 1 }}>
                  <CustomButton variant="contained" onClick={editingComment ? handleUpdateComment : handleCreateComment} sx={{ borderRadius: '12px', fontWeight: 900, whiteSpace: 'nowrap', px: 3 }}>{editingComment ? '수정' : '등록'}</CustomButton>
                  {editingComment && <Button variant="outlined" onClick={() => { setEditingComment(null); setNewComment(''); }} sx={{ borderRadius: '12px', fontWeight: 800 }}>취소</Button>}
                </Stack>
              </Stack>
            </Box>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default BoardPage;