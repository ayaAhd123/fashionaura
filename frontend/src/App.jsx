import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register'; 
import AdminLayout from './layouts/AdminLayout';
import BoutiqueLayout from './layouts/BoutiqueLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import CitiesManager from './pages/Admin/CitiesManager';
import BoutiqueDashboard from './pages/boutique/BoutiqueDashboard';
import AIAdvisor from './pages/boutique/AIAdvisor';
import NotificationsList from './pages/boutique/NotificationsList';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          

          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/cities" element={<CitiesManager />} />
            </Route>
          </Route>

          {/* Routes Boutique avec layout */}
          <Route element={<ProtectedRoute allowedRoles={['boutique_owner']} />}>
            <Route element={<BoutiqueLayout />}>
              <Route path="/boutique/dashboard" element={<BoutiqueDashboard />} />
              <Route path="/boutique/ai-advisor" element={<AIAdvisor />} />
              <Route path="/boutique/notifications" element={<NotificationsList />} />
            </Route>
          </Route>

          <Route path="/" element={<RootRedirect />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Redirection simple
function RootRedirect() {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/boutique/dashboard" replace />;
}

function UnauthorizedPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F2F5' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 60, color: '#D4E0E2', lineHeight: 1 }}>403</p>
        <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 14, color: '#939790', marginBottom: 16 }}>Accès non autorisé</p>
        <a href="/login" style={{ color: '#69807E', fontFamily: 'Raleway, sans-serif', textDecoration: 'none', borderBottom: '1px solid #69807E', paddingBottom: 2 }}>Se connecter</a>
      </div>
    </div>
  );
}

export default App;