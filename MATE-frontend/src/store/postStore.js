// src/store/postStore.js

import { create } from 'zustand'
import postApi from '../api/postApi'

/**
 * 프로젝트 모집글 상태 관리 스토어 (REST API 설계서 v1.1 반영)
 */
export const usePostStore = create((set, get) => ({
  // 상태
  posts: [],
  totalPages: 0,
  totalElements: 0,
  currentPost: null,
  isLoading: false,
  error: null,

  // 필터/검색 상태
  keyword: '',
  category: '전체',
  sort: 'createdAt',
  page: 0,

  // 모집글 목록 가져오기
  fetchPosts: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const state = get();
      
      // 1. 현재 UI의 최신 상태(params)가 있다면 우선 사용하고, 없으면 스토어의 state 사용
      const currentCategory = params.category || state.category;
      const currentKeyword = params.keyword !== undefined ? params.keyword : state.keyword;
      const currentPage = params.page !== undefined ? params.page : state.page;
      const currentSort = params.sort || state.sort;

      // 2. 카테고리 값 서버 규격(v1.1)으로 변환
      let targetCategory = '';
      if (currentCategory === '프로젝트') targetCategory = 'PROJECT';
      else if (currentCategory === '스터디') targetCategory = 'STUDY';

      // 3. 최종 요청 파라미터 구성
      // 💡 포인트: ...params를 앞에 두고, 우리가 변환한 대문자 값을 뒤에 배치하여 덮어씌움
      const currentParams = {
        size: 15,
        ...params,            // 1. 외부 주입값 먼저 전개
        keyword: currentKeyword,
        category: targetCategory, // 2. 대문자(PROJECT/STUDY)로 강제 고정
        sort: currentSort,
        page: currentPage,
      }
      
      const response = await postApi.getPosts(currentParams);
      
      /**
       * 설계서 v1.1 규격 및 실구현 대응:
       * 1. response 자체가 배열인 경우 (비페이징)
       * 2. response.content가 배열인 경우 (페이징)
       */
      const rawPosts = Array.isArray(response) ? response : (response?.content || []);
      
      const mappedPosts = rawPosts.map(post => ({
        ...post,
        id: post.id || post.projectId,
        projectId: post.projectId || post.id
      }));

      // 페이징 정보 추출 (설계서 v1.1: response.page.totalPages / 일반 Page: response.totalPages)
      const totalPages = response?.page?.totalPages ?? response?.totalPages ?? (Array.isArray(response) ? 1 : 0);
      const totalElements = response?.page?.totalElements ?? response?.totalElements ?? rawPosts.length;

      set({ 
        posts: mappedPosts, 
        totalPages: totalPages,
        totalElements: totalElements,
        isLoading: false 
      })
    } catch (error) {
      set({ 
        error: error.message || '목록을 불러오는 중 오류가 발생했습니다.', 
        isLoading: false 
      })
    }
  },

  // 💡 필터 변경 액션: 상태 변경 후 즉시 fetchPosts를 호출하여 실시간 반영
  setKeyword: (keyword) => {
    set({ keyword, page: 0 });
    get().fetchPosts();
  },
  setCategory: (category) => {
    set({ category, page: 0 });
    // 새 카테고리 값을 직접 전달하여 즉각 반영되도록 함
    get().fetchPosts({ category, page: 0 }); 
  },
  setSort: (sort) => {
    set({ sort, page: 0 });
    get().fetchPosts();
  },
  setPage: (page) => {
    set({ page });
    get().fetchPosts();
  },

  // 모집글 상세 가져오기
  fetchPostDetail: async (projectId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await postApi.getPostDetail(projectId)
      
      // 상세 데이터에서도 id와 projectId 호환성 유지 및 날짜 가공
      const mappedDetail = response ? {
        ...response,
        id: response.id || response.projectId,
        projectId: response.projectId || response.id,
        endDate: response.endDate ? response.endDate.split('T')[0] : response.endDate 
      } : null;

      set({ currentPost: mappedDetail, isLoading: false })
    } catch (error) {
      set({ 
        error: error.message || '상세 정보를 불러오는 데 실패했습니다.', 
        isLoading: false 
      })
    }
  },

  // 로딩/에러 설정
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // 초기화
  clearPosts: () => set({ posts: [], totalPages: 0, totalElements: 0 }),
  clearCurrentPost: () => set({ currentPost: null }),
}))