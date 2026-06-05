import axiosInstance from './axiosInstance';

export const postApi = {
  // --- 1. 모집글 관리 (Projects) ---

  // 모집글 목록 조회 (v1.1: GET /api/projects)
  getPosts: async (params) => {
    // 💡 로그인 여부와 상관없이 조회 가능하도록 설정 가능
    return await axiosInstance.get('/projects', { params });
  },

  // 모집글 상세 조회 (v1.1: GET /api/projects/{projectId})
  getPostDetail: async (projectId) => {
    /**
     * 💡 [중요] 상세 조회 시 AUTH_003 에러가 난다면:
     * axiosInstance에서 인터셉터가 만료된 토큰을 강제로 넣고 있을 확률이 높습니다.
     * 로그아웃을 하거나, 아래 요청에서 헤더를 초기화하는 시도가 필요할 수 있습니다.
     */
    return await axiosInstance.get(`/projects/${projectId}`);
  },

  // 모집글 등록 (v1.1: POST /api/projects)
  createPost: async (postData) => {
    return await axiosInstance.post('/projects', postData);
  },

  // 모집글 수정 (v1.1: PATCH /api/projects/{id})
  updatePost: async (projectId, postData) => {
    return await axiosInstance.patch(`/projects/${projectId}`, postData);
  },

  // 모집글 삭제 (v1.1: DELETE /api/projects/{id}) - Soft Delete
  deletePost: async (projectId) => {
    return await axiosInstance.delete(`/projects/${projectId}`);
  },

  // 모집 수동 마감 (v1.1: PATCH /api/projects/{id}/close)
  closePost: async (projectId) => {
    return await axiosInstance.patch(`/projects/${projectId}/close`);
  },

  // 재모집 시작 (v1.1: PATCH /api/projects/{projectId}/reopen)
  reopenPost: async (projectId) => {
    return await axiosInstance.patch(`/projects/${projectId}/reopen`);
  },


  // --- 2. 지원 및 매칭 관리 (Applications) ---

  // 프로젝트 참여 지원 (v1.1: POST /api/applications/{projectId})
  applyToPost: async (projectId, applicationData) => {
    return await axiosInstance.post(`/applications/${projectId}`, {
      ...applicationData,
      message: applicationData.content || applicationData.message // content를 message로 매핑하여 전송
    });
  },

  // 지원 취소 (v1.1: DELETE /api/applications/{applicationId})
  cancelApplication: async (applicationId) => {
    return await axiosInstance.delete(`/applications/${applicationId}`);
  },

  // 지원서 승인/거절 (v1.1: PATCH /api/applications/{id}/status)
  updateApplicationStatus: async (applicationId, status) => {
    /**
     * @param {string} status - 'accept' 또는 'reject' (설계서 v1.1 규격)
     */
    return await axiosInstance.patch(`/applications/${applicationId}/status`, { status });
  },

  // 특정 모집글의 지원자 목록 조회 (v1.1: GET /api/applications/projects/{projectId})
  getProjectApplications: async (projectId) => {
    return await axiosInstance.get(`/applications/projects/${projectId}`);  
  },

  // --- 3. 마이페이지 연동 ---

  // 내 지원 내역 조회 (v1.1: GET /api/users/me/applications)
  getMyApplications: async () => {
    return await axiosInstance.get('/users/me/applications');
  }
};

export default postApi;