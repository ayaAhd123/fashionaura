import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ allowedRoles = [] }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  console.log('🔒 ProtectedRoute - isAuthenticated:', isAuthenticated);
  console.log('🔒 ProtectedRoute - user:', user);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F2F5' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #D4E0E2', borderTopColor: '#69807E', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🔒 Non authentifié, redirection vers /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    console.log('⛔ Rôle non autorisé:', user?.role);
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('✅ Accès autorisé');
  return <Outlet />;
}

export default ProtectedRoute;