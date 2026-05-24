import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import OwnerDashboard from '../pages/Dashboard/OwnerDashboard';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import CitiesManager from '../pages/Admin/CitiesManager';
import Login from '../pages/Login';
import Register from '../pages/Register';
import BoutiqueDashboard from '../pages/boutique/BoutiqueDashboard';
import AIAdvisor from '../pages/boutique/AIAdvisor';
import NotificationsList from '../pages/boutique/NotificationsList';

import { BoutiquesPage } from '../pages/BoutiquesPage';
import { ProductsPage } from '../pages/ProductsPage';
import { BoutiqueDetailPage } from '../pages/BoutiqueDetailPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { FavoritesPage } from '../pages/FavoritesPage';
import { CartPage } from '../pages/CartPage';
import TopBoutiquesPage from '../pages/TopBoutiquesPage';
import ChatbotWindow from '../components/AI/ChatbotWindow';

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
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F2F5' }}>
            <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 60, color: '#D4E0E2', lineHeight: 1 }}>403</p>
                <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 14, color: '#939790', marginBottom: 16 }}>Accès non autorisé</p>
                <a href="/login" style={{ color: '#69807E', fontFamily: 'Raleway, sans-serif', textDecoration: 'none', borderBottom: '1px solid #69807E', paddingBottom: 2 }}>Se connecter</a>
            </div>
        </div>
    );
}

const AppRouter = () => (
    <AuthProvider>
        <CartProvider>
            <FavoritesProvider>
                <ToastProvider>
                    <BrowserRouter>
                        <Routes>
                            {/* Site public */}
                            <Route path="/" element={<RootRedirect />} />
                            <Route path="/cities/:slug" element={<CityPage />} />
                            <Route path="/meilleures-boutiques" element={<TopBoutiquesPage />} />
                            <Route path="/dashboard/owner" element={<OwnerDashboard />} />
                            <Route path="/dashboard/admin" element={<AdminDashboard />} />

                            <Route element={<MainLayout />}>
                                <Route path="/boutiques" element={<BoutiquesPage />} />
                                <Route path="/boutiques/:slug" element={<BoutiqueDetailPage />} />
                                <Route path="/products" element={<ProductsPage />} />
                                <Route path="/products/:slug" element={<ProductDetailPage />} />
                                <Route path="/favoris" element={<FavoritesPage />} />
                                <Route path="/panier" element={<CartPage />} />
                            </Route>

                            {/* Auth */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/unauthorized" element={<UnauthorizedPage />} />

                            {/* Admin (Nouha) */}
                            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                                <Route element={<AdminLayout />}>
                                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                                    <Route path="/admin/cities" element={<CitiesManager />} />
                                </Route>
                            </Route>

                            {/* Boutique owner (Nouha) */}
                            <Route element={<ProtectedRoute allowedRoles={['boutique_owner']} />}>
                                <Route element={<BoutiqueLayout />}>
                                    <Route path="/boutique/dashboard" element={<BoutiqueDashboard />} />
                                    <Route path="/boutique/ai-advisor" element={<AIAdvisor />} />
                                    <Route path="/boutique/notifications" element={<NotificationsList />} />
                                </Route>
                            </Route>

                            <Route path="*" element={<NotFound />} />
                        </Routes>
                        <ChatbotWindow />
                    </BrowserRouter>
                </ToastProvider>
            </FavoritesProvider>
        </CartProvider>
    </AuthProvider>
);

export default AppRouter;
