// src/store/uiStore.js

import { create } from 'zustand'

/**
 * UI 상태 관리 스토어 (토스트, 모달, 로딩 등)
 * REST API 설계서 v1.1의 에러 메시지를 안정적으로 표시하기 위해 타이머 관리 로직을 강화했습니다.
 */
export const useUiStore = create((set, get) => ({
  // 토스트 상태
  toast: null,
  toastTimer: null,

  // 모달 상태
  modal: null,

  // 전역 로딩
  globalLoading: false,

  /**
   * 토스트 표시 (3초 후 자동 닫힘)
   * 새로운 토스트 요청 시 이전 타이머를 초기화하여 노출 시간을 보장합니다.
   */
  showToast: (message, type = 'success') => {
    // 기존 타이머가 실행 중이라면 취소
    const currentTimer = get().toastTimer;
    if (currentTimer) clearTimeout(currentTimer);

    set({ toast: { message, type } });

    // 3초 후 토스트를 닫는 새로운 타이머 설정
    const timer = setTimeout(() => {
      set({ toast: null, toastTimer: null });
    }, 3000);

    set({ toastTimer: timer });
  },

  // 토스트 강제 닫기
  hideToast: () => {
    const currentTimer = get().toastTimer;
    if (currentTimer) clearTimeout(currentTimer);
    set({ toast: null, toastTimer: null });
  },

  // 모달 열기
  openModal: (modalType, data = null) =>
    set({ modal: { type: modalType, data } }),

  // 모달 닫기
  closeModal: () => set({ modal: null }),

  // 전역 로딩 설정
  setGlobalLoading: (globalLoading) => set({ globalLoading }),
}))
