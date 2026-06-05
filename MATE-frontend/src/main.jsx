import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// // MSW(가짜 서버) 활성화 로직 - 백엔드 연결을 위해 비활성화 처리

// async function enableMocking() {
//   if (import.meta.env.DEV) {
//     const { worker } = await import('./mocks/browser')
//     return worker.start({
//       onUnhandledRequest: 'bypass'
//     })
//   }
// }

// enableMocking().then(() => {
//   createRoot(document.getElementById('root')).render(
//     <StrictMode>
//       <App />
//     </StrictMode>,
//   )
// })

// 백엔드 직접 연결 모드
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)