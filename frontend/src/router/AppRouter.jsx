import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from '../contexts/CartContext';
import { FavoritesProvider } from '../contexts/FavoritesContext';
import { ToastProvider } from '../contexts/ToastContext';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';

// Pages
import { HomePage } from '../pages/HomePage';
import { BoutiquesPage } from '../pages/BoutiquesPage';
import { BoutiqueDetailPage } from '../pages/BoutiqueDetailPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { FavoritesPage } from '../pages/FavoritesPage';
import { CartPage } from '../pages/CartPage';

const AppRouter = () => {
    return (
        <CartProvider>
            <FavoritesProvider>
                <ToastProvider>
                    <BrowserRouter>
                        <div className="min-h-screen flex flex-col bg-background">
                            <Header />
                            <Routes>
                                {/* Public Routes */}
                                <Route path="/" element={<HomePage />} />
                                <Route path="/boutiques" element={<BoutiquesPage />} />
                                <Route path="/boutiques/:slug" element={<BoutiqueDetailPage />} />
                                <Route path="/products/:slug" element={<ProductDetailPage />} />
                                <Route path="/favoris" element={<FavoritesPage />} />
                                <Route path="/panier" element={<CartPage />} />

                                {/* Catch All */}
                                <Route path="*" element={
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="text-center">
                                            <h1 className="text-4xl font-bold mb-4">404</h1>
                                            <p>Page non trouvée</p>
                                        </div>
                                    </div>
                                } />
                            </Routes>
                            <Footer />
                        </div>
                    </BrowserRouter>
                </ToastProvider>
            </FavoritesProvider>
        </CartProvider>
    );
};

export default AppRouter;
