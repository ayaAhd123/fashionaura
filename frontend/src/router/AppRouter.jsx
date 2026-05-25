import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from '../contexts/CartContext';
import { FavoritesProvider } from '../contexts/FavoritesContext';
import { ToastProvider } from '../contexts/ToastContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import BoutiqueLayout from '../layouts/BoutiqueLayout';

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
import AdminDashboard from '../pages/Admin/AdminDashboard';
import CitiesManager from '../pages/Admin/CitiesManager';
import BoutiqueDashboard from '../pages/boutique/BoutiqueDashboard';
import AIAdvisor from '../pages/boutique/AIAdvisor';
import NotificationsList from '../pages/boutique/NotificationsList';
import DashboardProductsPage from '../pages/Dashboard/ProductsPage';
import DashboardOrdersPage from '../pages/Dashboard/OrdersPage';

import ChatbotWindow from '../components/AI/ChatbotWindow';
import MerchantCopilotWindow from '../components/AI/MerchantCopilotWindow';

const NotFound = () => (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <p>Page non trouvée</p>
        </div>
    </div>
);

function RootRedirect() {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <LandingPage />;
    }

    if (user?.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (user?.role === 'boutique_owner') {
        return <Navigate to="/boutique/dashboard" replace />;
    }

    return <LandingPage />;
}

function UnauthorizedPage() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F3F2F5',
        }}>
            <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 60, color: '#D4E0E2', lineHeight: 1 }}>403</p>
                <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 14, color: '#939790', marginBottom: 16 }}>Accès non autorisé</p>
                <a href="/login" style={{ color: '#69807E', fontFamily: 'Raleway, sans-serif', textDecoration: 'none', borderBottom: '1px solid #69807E', paddingBottom: 2 }}>Se connecter</a>
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

    if (isBoutiqueDashboard && isMerchant) {
        return <MerchantCopilotWindow />;
    }

    if (pathname.startsWith('/admin')) return null;

    return <ChatbotWindow />;
}

const AppRouter = () => (
    <AuthProvider>
        <CartProvider>
            <FavoritesProvider>
                <ToastProvider>
                    <BrowserRouter>
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

                            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                                <Route element={<AdminLayout />}>
                                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                                    <Route path="/admin/boutiques" element={<Navigate to="/admin/dashboard" replace />} />
                                    <Route path="/admin/cities" element={<CitiesManager />} />
                                    <Route path="/admin/orders" element={<DashboardOrdersPage />} />
                                    <Route path="/admin/settings" element={<Navigate to="/admin/dashboard" replace />} />
                                </Route>
                            </Route>

                            <Route element={<ProtectedRoute allowedRoles={['boutique_owner']} />}>
                                <Route element={<BoutiqueLayout />}>
                                    <Route path="/boutique/dashboard" element={<BoutiqueDashboard />} />
                                    <Route path="/boutique/products" element={<DashboardProductsPage />} />
                                    <Route path="/boutique/orders" element={<DashboardOrdersPage />} />
                                    <Route path="/boutique/ai-advisor" element={<AIAdvisor />} />
                                    <Route path="/boutique/notifications" element={<NotificationsList />} />
                                    <Route path="/boutique/settings" element={<Navigate to="/boutique/dashboard" replace />} />
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
);

export default AppRouter;
