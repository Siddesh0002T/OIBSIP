import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Pizza, ShoppingCart, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = "text-gray-900 font-bold hover:text-pizza-red transition-colors duration-300 mr-4";
  const mobileNavLinkClass = "block px-3 py-2 rounded-md text-base font-bold text-gray-900 hover:text-pizza-red hover:bg-orange-50 transition-colors duration-300";

  return (
    <nav className="bg-transparent sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Pizza className="text-pizza-red h-8 w-8 hover:rotate-12 transition-transform duration-300" />
            <span className="font-display font-bold text-2xl text-gray-900">Slice</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center">
            {user ? (
              <>
                {user.role !== 'admin' ? (
                  <>
                    <Link to="/cart" className={`${navLinkClass} flex items-center`}>
                      <ShoppingCart className="w-6 h-6 hover:scale-110 transition-transform duration-300" />
                    </Link>
                    <Link to="/orders" className={navLinkClass}>Orders</Link>
                    <Link to="/wallet" className={navLinkClass}>Wallet</Link>
                  </>
                ) : (
                  <>
                    <Link to="/admin/loyalty" className={navLinkClass}>Loyalty</Link>
                    <Link to="/admin/coupons" className={navLinkClass}>Coupons</Link>
                  </>
                )}
                <Link to={user.role === 'admin' ? "/admin/dashboard" : "/dashboard"} className={navLinkClass}>
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="bg-orange-100 text-pizza-red hover:bg-orange-200 px-4 py-2 rounded-md font-bold transition-colors duration-300 active:scale-95 ml-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={navLinkClass}>Login</Link>
                <Link to="/register" className="bg-pizza-red text-white px-4 py-2 rounded-md font-bold hover:bg-red-700 transition-colors duration-300 active:scale-95">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-900 hover:text-pizza-red focus:outline-none p-2 transition-colors duration-300"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/90 backdrop-blur-md animate-slide-up shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user ? (
              <>
                {user.role !== 'admin' ? (
                  <>
                    <Link to="/cart" onClick={() => setIsMenuOpen(false)} className={mobileNavLinkClass}>Cart</Link>
                    <Link to="/orders" onClick={() => setIsMenuOpen(false)} className={mobileNavLinkClass}>Orders</Link>
                    <Link to="/wallet" onClick={() => setIsMenuOpen(false)} className={mobileNavLinkClass}>Wallet</Link>
                  </>
                ) : (
                  <>
                    <Link to="/admin/loyalty" onClick={() => setIsMenuOpen(false)} className={mobileNavLinkClass}>Loyalty</Link>
                    <Link to="/admin/coupons" onClick={() => setIsMenuOpen(false)} className={mobileNavLinkClass}>Coupons</Link>
                  </>
                )}
                <Link to={user.role === 'admin' ? "/admin/dashboard" : "/dashboard"} onClick={() => setIsMenuOpen(false)} className={mobileNavLinkClass}>
                  Dashboard
                </Link>
                <button 
                  onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-bold text-pizza-red hover:bg-orange-100 transition-colors duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className={mobileNavLinkClass}>Login</Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-bold text-white bg-pizza-red hover:bg-red-700 transition-colors duration-300 mt-2">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

