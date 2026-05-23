import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from '../contexts/CartContext';
import { FavoritesProvider } from '../contexts/FavoritesContext';
import { ToastProvider } from '../contexts/ToastContext';
import MainLayout from '../layouts/MainLayout';

import LandingPage from '../pages/LandingPage';
import CityPage from '../pages/CityPage';
import OwnerDashboard from '../pages/Dashboard/OwnerDashboard';
import AdminDashboard from '../pages/Admin/AdminDashboard';

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

const AppRouter = () => (
    <CartProvider>
        <FavoritesProvider>
            <ToastProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
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
                            <Route path="*" element={<NotFound />} />
                        </Route>
                    </Routes>
                    <ChatbotWindow />
                </BrowserRouter>
            </ToastProvider>
        </FavoritesProvider>
    </CartProvider>
);

export default AppRouter;
