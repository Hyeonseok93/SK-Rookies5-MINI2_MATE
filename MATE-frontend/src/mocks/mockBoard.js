export const generateBoardPosts = () => {
  return [
    {
      id: 100, projectId: 11, type: "NOTICE", title: "📢 프로젝트 시작 및 규칙 안내",
      content: "모두 반갑습니다! 우리 프로젝트의 핵심 규칙입니다.\n1. 매주 월요일 저녁 8시 정기 회의\n2. 불참 시 미리 노티\n3. Git Commit 컨벤션 준수 부탁드려요.",
      authorNickname: '네스트고수', authorId: 18, 
      createdAt: "2026-03-30T10:00:00.000Z", viewCount: 15, isDeleted: false
    },
    {
      id: 101, projectId: 11, type: "GENERAL", title: "기술 스택 관련 논의",
      content: "상태 관리 라이브러리로 Zustand를 쓰는게 좋을까요, 아니면 TanStack Query만으로 충분할까요?",
      authorNickname: '백엔드장인', authorId: 2, 
      createdAt: "2026-04-01T11:00:00.000Z", viewCount: 8, isDeleted: false
    },
    {
      id: 102, projectId: 2, type: "NOTICE", title: "첫 번째 스터디 분량 공지",
      content: "이번 주에는 1장부터 3장까지 읽어오시면 됩니다. 각자 궁금한 점 2개씩 준비해주세요!",
      authorNickname: '프론트깍이', authorId: 1, 
      createdAt: "2026-03-28T09:00:00.000Z", viewCount: 20, isDeleted: false
    }
  ];
};

export const generateComments = (users) => {
  return [
    { 
      id: 1, postId: 100, authorNickname: '백엔드장인', authorId: 2, 
      authorProfileImg: users[1].profileImg, 
      content: "공지 확인했습니다! 정기 회의 시간 좋습니다.", 
      createdAt: "2026-04-01T10:00:00.000Z", isDeleted: false 
    },
    { 
      id: 2, postId: 100, authorNickname: '풀스택꿈나무', authorId: 5, 
      authorProfileImg: users[4].profileImg, 
      content: "저도 확인했습니다. 컨벤션 문서 어디서 볼 수 있나요?", 
      createdAt: "2026-04-01T11:30:00.000Z", isDeleted: false 
    },
    { 
      id: 3, postId: 101, authorNickname: '네스트고수', authorId: 18, 
      authorProfileImg: users[17].profileImg, 
      content: "서버 데이터 위주라면 TanStack Query가 유리할 것 같네요.", 
      createdAt: "2026-04-01T14:00:00.000Z", isDeleted: false 
    }
  ];
};
