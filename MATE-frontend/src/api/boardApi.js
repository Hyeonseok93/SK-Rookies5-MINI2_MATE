import axiosInstance from './axiosInstance';

const boardApi = {
  // 프로젝트 상세 정보 조회 (v1.1: GET /api/projects/{projectId})
  getProjectDetail: async (projectId) => {
    return await axiosInstance.get(`/projects/${projectId}`);
  },

  // 프로젝트 멤버 조회 (v1.1: GET /api/posts/{projectId}/members)
  getProjectMembers: async (projectId) => {
    return await axiosInstance.get(`/posts/${projectId}/members`);
  },

  // 프로젝트 멤버 강퇴 (v1.1: 4.4.2 - DELETE /api/posts/members/{memberId})
  kickMember: async (memberId) => {
    return await axiosInstance.delete(`/posts/members/${memberId}`);
  },

  // 팀 게시판 목록 조회 (v1.1: GET /api/posts/{projectId}/board)
  getBoardPosts: async (projectId, page = 0, size = 10) => {
    return await axiosInstance.get(`/posts/${projectId}/board`, {
      params: { page, size }
    });
  },

  // 팀 게시글 상세 조회 (v1.1: GET /api/posts/{projectId}/board/{postId})
  getBoardPostDetail: async (projectId, postId) => {
    return await axiosInstance.get(`/posts/${projectId}/board/${postId}`);
  },

  // 팀 게시글 작성 (v1.1: POST /api/posts/{projectId}/board)
  createBoardPost: async (projectId, postData) => {
    return await axiosInstance.post(`/posts/${projectId}/board`, postData);
  },

  // 팀 게시글 수정 (v1.1: PATCH /api/posts/{projectId}/board/{postId})
  updateBoardPost: async (projectId, postId, postData) => {
    return await axiosInstance.patch(`/posts/${projectId}/board/${postId}`, postData);
  },

  // 팀 게시글 삭제 (v1.1: DELETE /api/posts/{projectId}/board/{postId})
  deleteBoardPost: async (projectId, postId) => {
    return await axiosInstance.delete(`/posts/${projectId}/board/${postId}`);
  },

  // 댓글 목록 조회 (UI 요구사항 반영)
  getComments: async (projectId, postId) => {
    return await axiosInstance.get(`/posts/${projectId}/board/${postId}/comments`);
  },

  // 댓글 작성 (v1.1: POST /api/posts/{projectId}/board/{postId}/comments)
  createComment: async (projectId, postId, content) => {
    return await axiosInstance.post(`/posts/${projectId}/board/${postId}/comments`, { content });
  },

  // 댓글 수정 (v1.1 요약표 규격: PATCH /api/comments/{commentId})
  updateComment: async (commentId, content) => {
    return await axiosInstance.put(`/posts/comments/${commentId}`, { content });
  },

  // 댓글 삭제 (v1.1 요약표 규격: DELETE /api/comments/{commentId})
  deleteComment: async (commentId) => {
    return await axiosInstance.delete(`/posts/comments/${commentId}`);
  },
};

export default boardApi;
