export const generateApplies = (users) => {
  return [
    {
      id: 101, projectId: 2, applicantId: 2, projectTitle: '모던 자바스크립트 Deep Dive', 
      category: 'STUDY', applicantPosition: 'BE', status: 'PENDING', createdAt: '2026-04-01T10:00:00.000Z',
      ownerNickname: '프론트깍이', applicantNickname: '백엔드장인',
      profileImg: users[1].profileImg,
      message: '자바스크립트의 내부 원리를 깊게 파고들고 싶습니다. 함께 공부해요!', contact: '010-1234-5678', link: 'github.com/backend-master'
    },
    {
      id: 102, projectId: 2, applicantId: 3, projectTitle: '모던 자바스크립트 Deep Dive', 
      category: 'STUDY', applicantPosition: 'DE', status: 'ACCEPTED', createdAt: '2026-04-02T11:00:00.000Z',
      ownerNickname: '프론트깍이', applicantNickname: '디자인천재',
      profileImg: users[2].profileImg,
      message: '개발 지식도 갖춘 디자이너가 되고 싶어 지원합니다.', contact: '010-1111-2222', link: 'behance.net/design-genius'
    },
    {
      id: 103, projectId: 3, applicantId: 1, projectTitle: 'AI 기반 식단 추천 서비스', 
      category: 'PROJECT', applicantPosition: 'FE', status: 'PENDING', createdAt: '2026-04-03T12:00:00.000Z',
      ownerNickname: '최종보스', applicantNickname: '프론트깍이',
      profileImg: users[0].profileImg,
      message: 'AI 모델과 연동되는 깔끔한 대시보드를 만들어보고 싶습니다.', contact: '010-1111-0001', link: ''
    },
    {
      id: 104, projectId: 5, applicantId: 4, projectTitle: '위치 기반 중고 거래 플랫폼', 
      category: 'PROJECT', applicantPosition: 'PM', status: 'REJECTED', createdAt: '2026-03-15T09:00:00.000Z',
      ownerNickname: '앱개발자', applicantNickname: '기획마스터',
      profileImg: users[3].profileImg,
      message: '당근마켓 같은 서비스를 기획해보고 싶습니다.', contact: '010-1111-0004', link: ''
    },
    {
      id: 105, projectId: 6, applicantId: 1, projectTitle: '스프링 부트 핵심 원리 파악', 
      category: 'STUDY', applicantPosition: 'FE', status: 'PENDING', createdAt: '2026-04-02T14:00:00.000Z',
      ownerNickname: '백엔드장인', applicantNickname: '프론트깍이',
      profileImg: users[0].profileImg,
      message: '프론트엔드 개발자이지만 백엔드 통신 구조를 더 잘 이해하고 싶어 지원했습니다.', contact: '010-1111-0001', link: ''
    },
    {
      id: 106, projectId: 11, applicantId: 5, projectTitle: '대학생 전용 캘린더 공유 서비스', 
      category: 'PROJECT', applicantPosition: 'BE', status: 'PENDING', createdAt: '2026-04-04T10:00:00.000Z',
      ownerNickname: '네스트고수', applicantNickname: '풀스택꿈나무',
      profileImg: users[4].profileImg,
      message: '풀스택 역량을 키우기 위해 BE 파트에 참여하고 싶습니다.', contact: '010-1111-0005', link: 'github.com/fullstack-tree'
    },
    {
      id: 107, projectId: 11, applicantId: 2, projectTitle: '대학생 전용 캘린더 공유 서비스', 
      category: 'PROJECT', applicantPosition: 'BE', status: 'ACCEPTED', createdAt: '2026-04-01T15:00:00.000Z',
      ownerNickname: '네스트고수', applicantNickname: '백엔드장인',
      profileImg: users[1].profileImg,
      message: '복잡한 일정 데이터 처리에 자신 있습니다. 팀에 기여하고 싶네요.', contact: '010-1234-5678', link: ''
    }
  ];
};
