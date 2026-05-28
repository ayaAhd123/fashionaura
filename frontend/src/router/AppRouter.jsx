import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from '../contexts/CartContext';
import { FavoritesProvider } from '../contexts/FavoritesContext';
import { ToastProvider } from '../contexts/ToastContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import ProtectedRoute from '../components/ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import BoutiqueLayout from '../layouts/BoutiqueLayout';

// Public pages
import LandingPage from '../pages/LandingPage';
import CityPage from '../pages/CityPage';
import TopBoutiquesPage from '../pages/TopBoutiquesPage';
import { BoutiquesPage } from '../pages/BoutiquesPage';
import { ProductsPage } from '../pages/ProductsPage';
import { BoutiqueDetailPage } from '../pages/BoutiqueDetailPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { FavoritesPage } from '../pages/FavoritesPage';
import { CartPage } from '../pages/CartPage';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';

// Admin pages
import AdminDashboard from '../pages/Admin/AdminDashboard';
import AdminBoutiquesPage from '../pages/Admin/AdminBoutiquesPage';
import AdminOrdersPage from '../pages/Admin/AdminOrdersPage';
import AdminUsersPage from '../pages/Admin/AdminUsersPage';
import AdminCategoriesPage from '../pages/Admin/AdminCategoriesPage';
import CitiesManager from '../pages/Admin/CitiesManager';
import AdminAnalyticsPage from '../pages/Admin/AdminAnalyticsPage';
import AdminNotificationsPage from '../pages/Admin/AdminNotificationsPage';
import AdminSettingsPage from '../pages/Admin/AdminSettingsPage';

// Boutique pages
import BoutiqueDashboard from '../pages/boutique/BoutiqueDashboard';
import DashboardProductsPage from '../pages/Dashboard/ProductsPage';
import BoutiqueOrdersPage from '../pages/boutique/BoutiqueOrdersPage';
import BoutiqueClientsPage from '../pages/boutique/BoutiqueClientsPage';
import BoutiqueReviewsPage from '../pages/boutique/BoutiqueReviewsPage';
import BoutiqueAnalyticsPage from '../pages/boutique/BoutiqueAnalyticsPage';
import NotificationsList from '../pages/boutique/NotificationsList';
import BoutiqueSettingsPage from '../pages/boutique/BoutiqueSettingsPage';
import AIAdvisor from '../pages/boutique/AIAdvisor';

import ChatbotWindow from '../components/AI/ChatbotWindow';
import MerchantCopilotWindow from '../components/AI/MerchantCopilotWindow';
import { Toaster } from 'react-hot-toast';

const NotFound = () => (
  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
    <div style={{ textAlign: 'center' }}>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 64, fontWeight: 700, color: '#1B3A35', lineHeight: 1 }}>404</h1>
      <p style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280', marginTop: 12 }}>Page non trouvée</p>
      <a href="/" style={{ display: 'inline-block', marginTop: 20, padding: '10px 24px', backgroundColor: '#1B3A35', color: '#fff', borderRadius: 999, textDecoration: 'none', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>Retour à l'accueil</a>
    </div>
  </div>
);

function RootRedirect() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <LandingPage />;
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'boutique_owner') return <Navigate to="/boutique/dashboard" replace />;
  return <LandingPage />;
}

function UnauthorizedPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F7FA' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 72, color: '#1B3A35', lineHeight: 1, fontWeight: 700 }}>403</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#6B7280', marginBottom: 20 }}>Accès non autorisé</p>
        <a href="/login" style={{ color: '#1B3A35', fontFamily: 'Inter, sans-serif', textDecoration: 'none', borderBottom: '1px solid #1B3A35', paddingBottom: 2 }}>Se connecter</a>
      </div>
    </div>
  );
}

function ChatbotGate() {
  const { pathname } = useLocation();
  const { user, isAuthenticated } = useAuth();
  const hideOn = ['/login', '/register', '/forgot-password'];
  if (hideOn.includes(pathname)) return null;
  const isBoutiqueDashboard = pathname.startsWith('/boutique');
  const isMerchant = isAuthenticated && user?.role === 'boutique_owner';
  if (isBoutiqueDashboard && isMerchant) return <MerchantCopilotWindow />;
  if (pathname.startsWith('/admin')) return null;
  return <ChatbotWindow />;
}

const AppRouter = () => (
  <ThemeProvider>
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <ToastProvider>
            <BrowserRouter>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3500,
                  style: {
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 14,
                    borderRadius: 12,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  },
                  success: { iconTheme: { primary: '#1B3A35', secondary: '#fff' } },
                }}
              />
              <Routes>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/cities/:slug" element={<CityPage />} />
                <Route path="/meilleures-boutiques" element={<TopBoutiquesPage />} />

                <Route element={<MainLayout />}>
                  <Route path="/boutiques" element={<BoutiquesPage />} />
                  <Route path="/boutiques/:slug" element={<BoutiqueDetailPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/products/:slug" element={<ProductDetailPage />} />
                  <Route path="/favoris" element={<FavoritesPage />} />
                  <Route path="/panier" element={<CartPage />} />
                </Route>

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />

                <Route path="/dashboard/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/dashboard/owner" element={<Navigate to="/boutique/dashboard" replace />} />

                {/* ADMIN ROUTES — all fully routed, no redirects to dashboard */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route element={<AdminLayout />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/boutiques" element={<AdminBoutiquesPage />} />
                    <Route path="/admin/commandes" element={<AdminOrdersPage />} />
                    <Route path="/admin/utilisateurs" element={<AdminUsersPage />} />
                    <Route path="/admin/categories" element={<AdminCategoriesPage />} />
                    <Route path="/admin/villes" element={<CitiesManager />} />
                    <Route path="/admin/cities" element={<CitiesManager />} />
                    <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
                    <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
                    <Route path="/admin/parametres" element={<AdminSettingsPage />} />
                    <Route path="/admin/settings" element={<AdminSettingsPage />} />
                    <Route path="/admin/orders" element={<AdminOrdersPage />} />
                  </Route>
                </Route>

                {/* BOUTIQUE ROUTES — all fully routed */}
                <Route element={<ProtectedRoute allowedRoles={['boutique_owner']} />}>
                  <Route element={<BoutiqueLayout />}>
                    <Route path="/boutique/dashboard" element={<BoutiqueDashboard />} />
                    <Route path="/boutique/produits" element={<DashboardProductsPage />} />
                    <Route path="/boutique/products" element={<DashboardProductsPage />} />
                    <Route path="/boutique/commandes" element={<BoutiqueOrdersPage />} />
                    <Route path="/boutique/orders" element={<BoutiqueOrdersPage />} />
                    <Route path="/boutique/clients" element={<BoutiqueClientsPage />} />
                    <Route path="/boutique/avis" element={<BoutiqueReviewsPage />} />
                    <Route path="/boutique/analytics" element={<BoutiqueAnalyticsPage />} />
                    <Route path="/boutique/notifications" element={<NotificationsList />} />
                    <Route path="/boutique/parametres" element={<BoutiqueSettingsPage />} />
                    <Route path="/boutique/settings" element={<BoutiqueSettingsPage />} />
                    <Route path="/boutique/ai-advisor" element={<AIAdvisor />} />
                  </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
              <ChatbotGate />
            </BrowserRouter>
          </ToastProvider>
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default AppRouter;
