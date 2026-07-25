import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute, AdminRoute } from './routes/ProtectedRoute';

// Pages - User
import Home from './pages/user/Home';
import Login from './pages/user/Login';
import Register from './pages/user/Register';
import VerifyEmail from './pages/user/VerifyEmail';
import ForgotPassword from './pages/user/ForgotPassword';
import ResetPassword from './pages/user/ResetPassword';
import Dashboard from './pages/user/Dashboard';
import PizzaBuilder from './pages/user/PizzaBuilder';
import Cart from './pages/user/Cart';
import Checkout from './pages/user/Checkout';
import OrderTracking from './pages/user/OrderTracking';
import OrderHistory from './pages/user/OrderHistory';
import Wallet from './pages/user/Wallet';

// Pages - Admin
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import InventoryManager from './pages/admin/InventoryManager';
import OrderManager from './pages/admin/OrderManager';
import MenuManager from './pages/admin/MenuManager';
import LoyaltyManager from './pages/admin/LoyaltyManager';
import CouponManager from './pages/admin/CouponManager';
import ReviewsOverview from './pages/admin/ReviewsOverview';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email/:token" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Protected User Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/build" element={<ProtectedRoute><PizzaBuilder /></ProtectedRoute>} />
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
              <Route path="/order/:id" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />

              {/* Protected Admin Routes */}
              <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/inventory" element={<AdminRoute><InventoryManager /></AdminRoute>} />
              <Route path="/admin/orders" element={<AdminRoute><OrderManager /></AdminRoute>} />
              <Route path="/admin/menu" element={<AdminRoute><MenuManager /></AdminRoute>} />
              <Route path="/admin/loyalty" element={<AdminRoute><LoyaltyManager /></AdminRoute>} />
              <Route path="/admin/coupons" element={<AdminRoute><CouponManager /></AdminRoute>} />
              <Route path="/admin/reviews" element={<AdminRoute><ReviewsOverview /></AdminRoute>} />
            </Routes>
          </main>
        </div>
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
