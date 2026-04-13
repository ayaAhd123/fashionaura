import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import CityPage from '../pages/CityPage';
import BoutiquePage from '../pages/BoutiquePage';
import ProductPage from '../pages/ProductPage';
import OwnerDashboard from '../pages/Dashboard/OwnerDashboard';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import ChatbotWindow from '../components/AI/ChatbotWindow';

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/cities" element={<CityPage />} />
                <Route path="/cities/:id" element={<CityPage />} />
                <Route path="/boutiques/:id" element={<BoutiquePage />} />
                <Route path="/products/:id" element={<ProductPage />} />

                {/* Dashboard / Protected Routes */}
                <Route path="/dashboard/owner" element={<OwnerDashboard />} />
                <Route path="/dashboard/admin" element={<AdminDashboard />} />

                {/* Catch All */}
                <Route path="*" element={<div>Page Not Found</div>} />
            </Routes>

            {/* Chatbot global — visible sur toutes les pages */}
            <ChatbotWindow />
        </BrowserRouter>
    );
};

export default AppRouter;