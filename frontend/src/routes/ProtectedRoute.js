import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const isLoggedIn = !!localStorage.getItem('access_token');
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;