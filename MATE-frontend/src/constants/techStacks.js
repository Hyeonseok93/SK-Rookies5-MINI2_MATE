export const TECH_STACK_OPTIONS = [
  // 언어 & 프레임워크 (Web)
  'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Next.js', 'Svelte', 'Angular', 'HTML/CSS',
  'Node.js', 'Express', 'NestJS', 'Fastify', 'Koa',
  'Java', 'Spring Boot', 'Spring', 'Kotlin',
  'Python', 'Django', 'Flask', 'FastAPI',
  'Go', 'PHP', 'Laravel', 'Ruby', 'Ruby on Rails',
  'C', 'C++', 'C#', '.NET', 'Rust',

  // 상태 관리 & 라이브러리
  'Zustand', 'Recoil', 'Redux', 'MobX', 'Jotai', 'TanStack Query', 'SWR',
  'Styled Components', 'Emotion', 'Tailwind CSS', 'Bootstrap', 'Material UI', 'Chakra UI',
  'Vite', 'Webpack', 'Babel', 'Jest', 'Cypress', 'Playwright', 'Storybook',

  // 모바일 & 크로스 플랫폼
  'React Native', 'Flutter', 'Swift', 'Objective-C', 'Kotlin (Android)', 'Dart', 'Unity', 'Unreal Engine',

  // 데이터베이스 & 캐시
  'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'MariaDB', 'SQLite',
  'DynamoDB', 'Cassandra', 'Elasticsearch', 'Firebase', 'Supabase',

  // 클라우드 & 인프라 (DevOps)
  'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'Ansible',
  'Linux', 'Nginx', 'Apache', 'Jenkins', 'GitHub Actions', 'Vercel', 'Netlify',

  // AI & 데이터 사이언스
  'PyTorch', 'TensorFlow', 'Keras', 'Scikit-learn', 'OpenCV', 'Pandas', 'NumPy', 'R',

  // 통신 & 기타
  'GraphQL', 'Apollo', 'gRPC', 'WebSockets', 'Socket.io', 'MQTT', 'Git', 'GitHub', 'GitLab',

  // 디자인 & 기획 & 협업
  'Figma', 'Adobe XD', 'Zeplin', 'Photoshop', 'Illustrator', 'Framer', 'Canva',
  'Jira', 'Confluence', 'Notion', 'Slack', 'Discord', 'Miro'
].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));

export const POSITION_OPTIONS = [
  { value: 'FS', label: '풀스택 (FS)'},
  { value: 'FE', label: '프론트엔드 (FE)' },
  { value: 'BE', label: '백엔드 (BE)' },
  { value: 'DE', label: '디자이너 (DE)' },
  { value: 'PM', label: '기획자 (PM)' },
  { value: 'ETC', label: '기타 (ETC)' }
];
