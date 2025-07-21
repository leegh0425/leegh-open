import { Navigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import type { ReactNode } from "react"; // <-- import type 사용!

type Props = {
  children: ReactNode;
};

function ProtectedRoute({ children }: Props) {
  const token = localStorage.getItem('access_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded: any = jwtDecode(token);
    const now = Date.now() / 1000; // 초 단위

    if (decoded.exp && decoded.exp < now) {
      localStorage.removeItem('access_token');
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  } catch (e) {
    localStorage.removeItem('access_token');
    return <Navigate to="/login" replace />;
  }
}

export default ProtectedRoute;
