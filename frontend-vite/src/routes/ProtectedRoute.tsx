import { Navigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('access_token');

  // 토큰이 없으면 로그인 페이지로 이동
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000; // 초 단위

    // 만료시간 체크
    if (decoded.exp && decoded.exp < now) {
      // 만료된 토큰이면 로그아웃 처리
      localStorage.removeItem('access_token');
      return <Navigate to="/login" replace />;
    }
    // 만료되지 않았다면, children 렌더링
    return children;
  } catch (e) {
    // 토큰 파싱 에러시 (불량 토큰 등)
    localStorage.removeItem('access_token');
    return <Navigate to="/login" replace />;
  }
}

export default ProtectedRoute;
