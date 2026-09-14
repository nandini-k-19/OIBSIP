import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.access_token, res.data.user);

      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(
        err.response?.data?.detail || 'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoUser = () => {
    setEmail('user@pizzahub.com');
    setPassword('user123');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full bg-[#FFF3DC] dark:bg-[#15100F] rounded-3xl border border-[#EAD5C5] dark:border-[#2A1A18] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 transition-colors">
        
        {/* =========================================================================
            LEFT COLUMN: CHEF PIZZO VISUAL SHOWCASE & GREETING
            ========================================================================= */}
        <div className="md:col-span-5 bg-gradient-to-br from-pizza-darkRed via-pizza-burgundy to-[#1C0509] p-8 flex flex-col justify-between items-center text-center text-white relative overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute -top-20 -left-20 w-48 h-48 bg-pizza-red/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-pizza-amber/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-pizza-gold tracking-wide">
            <span>👨‍🍳</span> Chef Pizzo's Kitchen
          </div>

          {/* Chef Picture with Golden Glow */}
          <div className="my-6 relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-pizza-red via-pizza-amber to-pizza-gold rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-500 animate-tilt"></div>
            <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-2xl overflow-hidden border-4 border-pizza-gold/80 shadow-2xl bg-black/40">
              <img 
                src="/chef_avatar.jpg" 
                alt="Chef Pizzo" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="absolute -bottom-3 bg-[#FFF3DC] dark:bg-[#181313] text-gray-900 dark:text-[#FFF1D6] px-3 py-1 rounded-full text-xs font-black shadow-lg border border-pizza-amber flex items-center gap-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
              <span>Chef Pizzo Online</span>
            </div>
          </div>

          {/* Chef Greeting Speech */}
          <div className="space-y-2 relative z-10">
            <h2 className="text-xl font-black tracking-tight text-white">
              "Benvenuto! Fresh slices await you!"
            </h2>
            <p className="text-xs text-stone-200/90 leading-relaxed max-w-xs">
              Sign in to customize artisanal pizzas, track live GPS deliveries, and unlock special member discounts.
            </p>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: CUSTOMER LOGIN FORM
            ========================================================================= */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍕</span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-[#FFF1D6] tracking-tight">
                Customer Login
              </h1>
            </div>
            <p className="text-xs text-gray-600 dark:text-[#D6C2A5]">
              Enter your credentials to access your PizzaHub account.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-[#FF7B7B] text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-[#F3DFC0] uppercase mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#AFA08F]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EAD5C5] dark:border-[#2A1A18] bg-[#FAF5EE] dark:bg-[#1A1211] text-gray-900 dark:text-[#FFF1D6] focus:ring-2 focus:ring-pizza-red/30 focus:border-pizza-red text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-gray-700 dark:text-[#F3DFC0] uppercase">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-bold text-pizza-red dark:text-[#FF9A3D] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#AFA08F]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EAD5C5] dark:border-[#2A1A18] bg-[#FAF5EE] dark:bg-[#1A1211] text-gray-900 dark:text-[#FFF1D6] focus:ring-2 focus:ring-pizza-red/30 focus:border-pizza-red text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-pizza-red to-pizza-amber hover:from-pizza-darkRed hover:to-pizza-tomato shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              {loading ? 'Authenticating...' : <><LogIn size={16} /> Sign In to PizzaHub</>}
            </button>
          </form>

          {/* Demo Fast Login Helper */}
          <div className="p-3 bg-[#FFE4C4]/50 dark:bg-[#1A1211] rounded-2xl border border-[#E5C3AB] dark:border-[#2A1A18] flex items-center justify-between text-xs">
            <span className="text-gray-700 dark:text-[#D6C2A5] font-medium">
              Demo Customer: <code className="text-pizza-red dark:text-[#FFC857] font-bold">user@pizzahub.com</code>
            </span>
            <button
              type="button"
              onClick={handleFillDemoUser}
              className="font-bold text-pizza-red dark:text-[#FFC857] hover:underline cursor-pointer"
            >
              Fill Demo
            </button>
          </div>

          <div className="text-center text-xs text-gray-600 dark:text-[#D6C2A5] pt-2 border-t border-[#EAD5C5] dark:border-[#2A1A18]">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-pizza-red dark:text-[#FF9A3D] hover:underline">
              Create Account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
