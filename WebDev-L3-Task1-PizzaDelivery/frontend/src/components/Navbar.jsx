import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { 
  ShoppingBag, 
  User as UserIcon, 
  LogOut, 
  Menu as MenuIcon, 
  X, 
  Shield, 
  Clock, 
  ChefHat,
  Settings,
  Sun,
  Moon,
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { totalItemsCount } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      {/* Glassmorphism Navigation Bar */}
      <div className="backdrop-blur-xl bg-[#FAF5EE]/92 dark:bg-[#090909]/95 border-b border-[#EAD5C5] dark:border-[#2A1A18] shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* =========================================================================
                LEFT: 🍕 PIZZAHUB LOGO
                ========================================================================= */}
            <Link 
              to={isAdmin ? "/admin/dashboard" : "/"} 
              className="flex items-center gap-3 group focus:outline-none"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pizza-red via-pizza-tomato to-pizza-amber flex items-center justify-center text-white shadow-lg shadow-red-500/20 group-hover:scale-105 group-hover:shadow-red-500/40 transition-all duration-300">
                <span className="text-2xl drop-shadow-sm group-hover:rotate-12 transition-transform duration-300">🍕</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-pizza-textLight dark:text-pizza-headDark leading-none">
                  Pizza<span className="gradient-text-pizza">Hub</span>
                  {isAdmin && (
                    <span className="ml-2 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-pizza-burgundy dark:bg-pizza-burgundy/80 text-pizza-gold uppercase tracking-wider border border-pizza-amber/30">
                      Admin
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-bold tracking-widest text-pizza-mutedLight dark:text-pizza-mutedDark uppercase mt-0.5">
                  {isAdmin ? "Control Center" : "Artisanal & Fresh"}
                </span>
              </div>
            </Link>

            {/* =========================================================================
                CENTER: DESKTOP NAVIGATION MENU (PILLED CAPSULE)
                ========================================================================= */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2 px-3 py-1.5 rounded-full bg-[#FFF3DC] dark:bg-[#15100F] border border-[#EAD5C5] dark:border-[#2A1A18] shadow-inner">
              {isAdmin ? (
                /* Admin Menu Links: Dashboard, Inventory, Manage Orders, Profile */
                <>
                  <Link
                    to="/admin/dashboard"
                    className={`relative px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-full group ${
                      isActive('/admin/dashboard')
                        ? 'text-pizza-red dark:text-[#FF7043] font-bold bg-[#FFE4C4] dark:bg-[#201412] shadow-sm'
                        : 'text-pizza-textLight dark:text-pizza-secondaryDark hover:text-pizza-red dark:hover:text-pizza-gold'
                    }`}
                  >
                    Dashboard
                    <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-gradient-to-r from-pizza-red to-pizza-amber transition-all duration-300 ${isActive('/admin/dashboard') ? 'w-3/5' : 'w-0 group-hover:w-3/5'}`} />
                  </Link>

                  <Link
                    to="/admin/inventory"
                    className={`relative px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-full group ${
                      isActive('/admin/inventory')
                        ? 'text-pizza-red dark:text-[#FF7043] font-bold bg-[#FFE4C4] dark:bg-[#201412] shadow-sm'
                        : 'text-pizza-textLight dark:text-pizza-secondaryDark hover:text-pizza-red dark:hover:text-pizza-gold'
                    }`}
                  >
                    Inventory
                    <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-gradient-to-r from-pizza-red to-pizza-amber transition-all duration-300 ${isActive('/admin/inventory') ? 'w-3/5' : 'w-0 group-hover:w-3/5'}`} />
                  </Link>

                  <Link
                    to="/admin/orders"
                    className={`relative px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-full group ${
                      isActive('/admin/orders')
                        ? 'text-pizza-red dark:text-[#FF7043] font-bold bg-[#FFE4C4] dark:bg-[#201412] shadow-sm'
                        : 'text-pizza-textLight dark:text-pizza-secondaryDark hover:text-pizza-red dark:hover:text-pizza-gold'
                    }`}
                  >
                    Manage Orders
                    <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-gradient-to-r from-pizza-red to-pizza-amber transition-all duration-300 ${isActive('/admin/orders') ? 'w-3/5' : 'w-0 group-hover:w-3/5'}`} />
                  </Link>

                  <Link
                    to="/profile"
                    className={`relative px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-full group ${
                      isActive('/profile')
                        ? 'text-pizza-red dark:text-[#FF7043] font-bold bg-[#FFE4C4] dark:bg-[#201412] shadow-sm'
                        : 'text-pizza-textLight dark:text-pizza-secondaryDark hover:text-pizza-red dark:hover:text-pizza-gold'
                    }`}
                  >
                    Profile
                    <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-gradient-to-r from-pizza-red to-pizza-amber transition-all duration-300 ${isActive('/profile') ? 'w-3/5' : 'w-0 group-hover:w-3/5'}`} />
                  </Link>
                </>
              ) : (
                /* Customer Menu Links: Home, Menu, Build Pizza, Orders, Track Order */
                <>
                  <Link
                    to="/"
                    className={`relative px-3.5 py-2 text-sm font-semibold transition-all duration-300 rounded-full group ${
                      isActive('/') && location.pathname === '/'
                        ? 'text-pizza-red dark:text-[#FF7043] font-bold bg-[#FFE4C4] dark:bg-[#201412] shadow-sm'
                        : 'text-pizza-textLight dark:text-pizza-secondaryDark hover:text-pizza-red dark:hover:text-pizza-gold'
                    }`}
                  >
                    Home
                    <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-gradient-to-r from-pizza-red to-pizza-amber transition-all duration-300 ${isActive('/') && location.pathname === '/' ? 'w-3/5' : 'w-0 group-hover:w-3/5'}`} />
                  </Link>

                  <Link
                    to="/menu"
                    className={`relative px-3.5 py-2 text-sm font-semibold transition-all duration-300 rounded-full group ${
                      isActive('/menu')
                        ? 'text-pizza-red dark:text-[#FF7043] font-bold bg-[#FFE4C4] dark:bg-[#201412] shadow-sm'
                        : 'text-pizza-textLight dark:text-pizza-secondaryDark hover:text-pizza-red dark:hover:text-pizza-gold'
                    }`}
                  >
                    Menu
                    <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-gradient-to-r from-pizza-red to-pizza-amber transition-all duration-300 ${isActive('/menu') ? 'w-3/5' : 'w-0 group-hover:w-3/5'}`} />
                  </Link>

                  <Link
                    to="/build-pizza"
                    className={`relative px-3.5 py-2 text-sm font-semibold transition-all duration-300 rounded-full group flex items-center gap-1.5 ${
                      isActive('/build-pizza')
                        ? 'text-pizza-red dark:text-[#FF7043] font-bold bg-[#FFE4C4] dark:bg-[#201412] shadow-sm'
                        : 'text-pizza-textLight dark:text-pizza-secondaryDark hover:text-pizza-red dark:hover:text-pizza-gold'
                    }`}
                  >
                    <ChefHat size={15} className="text-pizza-amber" />
                    <span>Build Pizza</span>
                    <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-gradient-to-r from-pizza-red to-pizza-amber transition-all duration-300 ${isActive('/build-pizza') ? 'w-3/5' : 'w-0 group-hover:w-3/5'}`} />
                  </Link>

                  <Link
                    to="/orders"
                    className={`relative px-3.5 py-2 text-sm font-semibold transition-all duration-300 rounded-full group ${
                      isActive('/orders')
                        ? 'text-pizza-red dark:text-[#FF7043] font-bold bg-[#FFE4C4] dark:bg-[#201412] shadow-sm'
                        : 'text-pizza-textLight dark:text-pizza-secondaryDark hover:text-pizza-red dark:hover:text-pizza-gold'
                    }`}
                  >
                    Orders
                    <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-gradient-to-r from-pizza-red to-pizza-amber transition-all duration-300 ${isActive('/orders') ? 'w-3/5' : 'w-0 group-hover:w-3/5'}`} />
                  </Link>

                  <Link
                    to="/orders"
                    className={`relative px-3.5 py-2 text-sm font-semibold transition-all duration-300 rounded-full group flex items-center gap-1 ${
                      isActive('/track')
                        ? 'text-pizza-red dark:text-[#FF7043] font-bold bg-[#FFE4C4] dark:bg-[#201412] shadow-sm'
                        : 'text-pizza-textLight dark:text-pizza-secondaryDark hover:text-pizza-red dark:hover:text-pizza-gold'
                    }`}
                  >
                    <Clock size={14} className="text-pizza-gold" />
                    <span>Track Order</span>
                    <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-gradient-to-r from-pizza-red to-pizza-amber transition-all duration-300 ${isActive('/track') ? 'w-3/5' : 'w-0 group-hover:w-3/5'}`} />
                  </Link>
                </>
              )}
            </nav>

            {/* =========================================================================
                RIGHT: SEARCH, CART, THEME TOGGLE & PROFILE
                ========================================================================= */}
            <div className="hidden md:flex items-center gap-2.5">
              
              {/* Quick Search Button / Link */}
              <Link
                to="/menu"
                className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FFF3DC] dark:bg-[#15100F] border border-[#EAD5C5] dark:border-[#2A1A18] text-pizza-textLight dark:text-pizza-textDark hover:text-pizza-red dark:hover:text-pizza-gold hover:border-pizza-amber/40 transition-all duration-300 shadow-sm"
                title="Search Pizzas"
                aria-label="Search Pizzas"
              >
                <span className="text-sm">🔍</span>
              </Link>

              {/* Customer Cart */}
              {!isAdmin && (
                <Link
                  to="/cart"
                  className="relative w-10 h-10 rounded-full flex items-center justify-center bg-[#FFF3DC] dark:bg-[#15100F] border border-[#EAD5C5] dark:border-[#2A1A18] text-pizza-textLight dark:text-pizza-textDark hover:text-pizza-red dark:hover:text-pizza-gold hover:border-pizza-amber/40 transition-all duration-300 shadow-sm"
                  aria-label="Shopping Cart"
                  title="View Shopping Cart"
                >
                  <ShoppingBag size={18} />
                  {totalItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-pizza-red text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-md animate-pulse">
                      {totalItemsCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FFF3DC] dark:bg-[#15100F] border border-[#EAD5C5] dark:border-[#2A1A18] text-pizza-textLight dark:text-pizza-textDark hover:text-pizza-red dark:hover:text-pizza-gold hover:border-pizza-amber/40 transition-all duration-300 shadow-sm group cursor-pointer"
                aria-label="Toggle Dark/Light Mode"
                title={isDark ? "Switch to Colorful Light Mode" : "Switch to Midnight Dark Mode"}
              >
                {isDark ? (
                  <Sun size={18} className="text-pizza-gold group-hover:rotate-90 transition-transform duration-500" />
                ) : (
                  <Moon size={18} className="text-pizza-textLight group-hover:-rotate-12 transition-transform duration-300" />
                )}
              </button>

              {/* User Account / Profile Dropdown */}
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2.5 p-1 pl-1.5 pr-2.5 rounded-full bg-[#FFF3DC] dark:bg-[#15100F] border border-[#EAD5C5] dark:border-[#2A1A18] hover:border-pizza-red/50 transition-all text-left shadow-sm group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-pizza-amber shadow-sm shrink-0">
                      <img 
                        src="/chef_avatar.jpg" 
                        alt="Chef Pizzo Avatar" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 max-w-[90px] truncate">
                      {user.full_name ? user.full_name.split(' ')[0] : user.email.split('@')[0]}
                    </span>
                    <ChevronDown size={14} className={`text-gray-500 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-3 w-64 bg-[#FFF3DC] dark:bg-[#15100F] rounded-2xl shadow-2xl border border-[#EAD5C5] dark:border-[#2A1A18] py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200"
                    >
                      <div className="px-4 py-3 border-b border-[#EAD5C5] dark:border-[#2A1A18] flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-pizza-amber shrink-0 shadow-md">
                          <img src="/chef_avatar.jpg" alt="Chef Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] text-pizza-mutedLight dark:text-pizza-mutedDark font-medium">Signed in as</p>
                          <p className="text-sm font-extrabold text-pizza-textLight dark:text-pizza-headDark truncate">{user.email}</p>
                          <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-black uppercase rounded bg-[#FFE4C4] dark:bg-pizza-burgundy text-pizza-red dark:text-pizza-gold border border-pizza-red/20">
                            {user.role}
                          </span>
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-pizza-textLight dark:text-pizza-secondaryDark hover:bg-[#FFE4C4] dark:hover:bg-[#1C1412] hover:text-pizza-red dark:hover:text-pizza-gold transition-colors"
                        >
                          <UserIcon size={16} />
                          My Profile
                        </Link>

                        <Link
                          to="/orders"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-pizza-textLight dark:text-pizza-secondaryDark hover:bg-[#FFE4C4] dark:hover:bg-[#1C1412] hover:text-pizza-red dark:hover:text-pizza-gold transition-colors"
                        >
                          <Clock size={16} />
                          Order History
                        </Link>

                        <Link
                          to="/profile?tab=settings"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-pizza-textLight dark:text-pizza-secondaryDark hover:bg-[#FFE4C4] dark:hover:bg-[#1C1412] hover:text-pizza-red dark:hover:text-pizza-gold transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <Settings size={16} />
                            Settings
                          </div>
                          <span className="text-[10px] bg-[#FFE4C4] dark:bg-[#201412] px-1.5 py-0.5 rounded text-pizza-mutedLight dark:text-pizza-mutedDark">Security</span>
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-pizza-amber hover:bg-[#FFE4C4] dark:hover:bg-[#1C1412] transition-colors border-t border-[#EAD5C5] dark:border-[#2A1A18]"
                          >
                            <Shield size={16} />
                            Admin Dashboard
                          </Link>
                        )}
                      </div>

                      {/* Profile -> Settings -> Logout */}
                      <div className="border-t border-[#EAD5C5] dark:border-[#2A1A18] pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-[#FF7B7B] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left cursor-pointer"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {/* Chef Pizzo Avatar Badge beside Login */}
                  <Link
                    to="/login"
                    className="flex items-center gap-1.5 p-1 pr-2.5 rounded-full bg-amber-500/15 dark:bg-amber-500/20 border border-amber-500/35 hover:border-pizza-amber hover:scale-105 transition-all shadow-sm group"
                    title="Chef Pizzo is here to help!"
                  >
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-pizza-amber shadow-md shrink-0">
                      <img 
                        src="/chef_avatar.jpg" 
                        alt="Chef Pizzo" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-[#141414]" />
                    </div>
                    <span className="text-xs font-black text-amber-900 dark:text-pizza-gold tracking-tight hidden sm:inline">
                      Chef Pizzo 🍕
                    </span>
                  </Link>

                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl text-sm font-bold text-pizza-textLight dark:text-pizza-secondaryDark hover:text-pizza-red hover:bg-[#FFE4C4] dark:hover:bg-[#1C1412] transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-pizza-red to-pizza-amber hover:from-pizza-darkRed hover:to-pizza-tomato shadow-md shadow-red-500/20 hover:shadow-lg transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* =========================================================================
                MOBILE: THEME BUTTON & ANIMATED HAMBURGER MENU
                ========================================================================= */}
            <div className="flex items-center gap-2 md:hidden">
              {/* Theme Toggle (Mobile) */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-pizza-textLight dark:text-pizza-secondaryDark hover:bg-[#FFE4C4] dark:hover:bg-[#15100F] cursor-pointer"
                aria-label="Toggle Theme"
              >
                {isDark ? <Sun size={20} className="text-pizza-gold" /> : <Moon size={20} />}
              </button>

              {/* Cart shortcut (Mobile) */}
              {!isAdmin && (
                <Link
                  to="/cart"
                  className="relative p-2 rounded-xl text-pizza-textLight dark:text-pizza-secondaryDark"
                >
                  <ShoppingBag size={22} />
                  {totalItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-pizza-red text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {totalItemsCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-pizza-textLight dark:text-pizza-secondaryDark hover:bg-[#FFE4C4] dark:hover:bg-[#15100F] cursor-pointer"
                aria-label="Open Navigation Menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* =========================================================================
          MOBILE NAVIGATION SLIDE-IN DRAWER
          ========================================================================= */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#EAD5C5] dark:border-[#2A1A18] bg-[#FAF5EE]/98 dark:bg-[#090909]/98 backdrop-blur-2xl px-6 pt-4 pb-8 space-y-3 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          {isAdmin ? (
            /* Admin Mobile Links */
            <div className="space-y-1">
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-base font-bold text-pizza-textLight dark:text-pizza-headDark hover:bg-[#FFE4C4] dark:hover:bg-[#15100F]"
              >
                Dashboard
              </Link>
              <Link
                to="/admin/inventory"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-base font-bold text-pizza-textLight dark:text-pizza-headDark hover:bg-[#FFE4C4] dark:hover:bg-[#15100F]"
              >
                Inventory
              </Link>
              <Link
                to="/admin/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-base font-bold text-pizza-textLight dark:text-pizza-headDark hover:bg-[#FFE4C4] dark:hover:bg-[#15100F]"
              >
                Manage Orders
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-base font-bold text-pizza-textLight dark:text-pizza-headDark hover:bg-[#FFE4C4] dark:hover:bg-[#15100F]"
              >
                Profile
              </Link>
            </div>
          ) : (
            /* Customer Mobile Links */
            <div className="space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-base font-bold text-pizza-textLight dark:text-pizza-headDark hover:bg-[#FFE4C4] dark:hover:bg-[#15100F]"
              >
                Home
              </Link>
              <Link
                to="/menu"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-base font-bold text-pizza-textLight dark:text-pizza-headDark hover:bg-[#FFE4C4] dark:hover:bg-[#15100F]"
              >
                Menu
              </Link>
              <Link
                to="/build-pizza"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-base font-bold text-pizza-red dark:text-pizza-gold hover:bg-[#FFE4C4] dark:hover:bg-[#15100F]"
              >
                Build Pizza 🍕
              </Link>
              <Link
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-base font-bold text-pizza-textLight dark:text-pizza-headDark hover:bg-[#FFE4C4] dark:hover:bg-[#15100F]"
              >
                Cart ({totalItemsCount})
              </Link>
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-base font-bold text-pizza-textLight dark:text-pizza-headDark hover:bg-[#FFE4C4] dark:hover:bg-[#15100F]"
              >
                Orders
              </Link>
              <Link
                to={user ? "/profile" : "/login"}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-base font-bold text-pizza-textLight dark:text-pizza-headDark hover:bg-[#FFE4C4] dark:hover:bg-[#15100F]"
              >
                Profile
              </Link>
            </div>
          )}

          {/* User Status / Mobile Auth Actions */}
          <div className="pt-4 border-t border-[#EAD5C5] dark:border-[#2A1A18]">
            {user ? (
              <div className="space-y-2">
                <div className="px-4 py-2 text-xs font-semibold text-pizza-mutedLight dark:text-pizza-mutedDark">
                  Signed in as <span className="font-bold text-pizza-textLight dark:text-pizza-headDark">{user.email}</span>
                </div>
                <Link
                  to="/profile?tab=settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 rounded-xl text-sm font-semibold text-pizza-textLight dark:text-pizza-secondaryDark hover:bg-[#FFE4C4] dark:hover:bg-[#15100F]"
                >
                  ⚙️ Settings & Security
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 dark:text-[#FF7B7B] hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl font-bold text-pizza-textLight dark:text-pizza-secondaryDark bg-[#FFF3DC] dark:bg-[#15100F] border border-[#EAD5C5] dark:border-[#2A1A18]"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-pizza-red to-pizza-amber shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

