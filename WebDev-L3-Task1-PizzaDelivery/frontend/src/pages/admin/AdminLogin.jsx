import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Shield, Lock, Mail, LogIn, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await api.post('/auth/admin/login', { email, password });
      login(res.data.access_token, res.data.user);
      navigate('/admin/dashboard');
    } catch (err) {
      setErrorMessage(
        err.response?.data?.detail || 'Invalid admin credentials or unauthorized account.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoAdmin = () => {
    setEmail('admin@pizzahub.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-900">
      <div className="max-w-md w-full bg-gray-800 p-8 sm:p-10 rounded-3xl border border-gray-700 shadow-2xl space-y-6 text-white">
        
        <div className="text-center space-y-2">
          <div className="relative w-16 h-16 mx-auto">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-pizza-yellow shadow-lg">
              <img src="/chef_avatar.jpg" alt="Head Chef Admin" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-pizza-darkRed text-white rounded-full flex items-center justify-center shadow-md ring-2 ring-gray-800">
              <Shield size={12} className="text-pizza-yellow" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Staff & Admin Portal
          </h1>
          <p className="text-xs text-gray-400">
            Authorized management access for kitchen operations & inventory.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-900/40 border border-red-700 text-red-200 text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Admin Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pizzahub.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-700 bg-gray-900/80 text-white focus:ring-2 focus:ring-pizza-red/40 focus:border-pizza-red text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Admin Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-700 bg-gray-900/80 text-white focus:ring-2 focus:ring-pizza-red/40 focus:border-pizza-red text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-pizza-red hover:bg-pizza-darkRed shadow-lg shadow-red-900/40 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            {loading ? 'Authenticating Staff...' : <><LogIn size={16} /> Enter Admin Control Center</>}
          </button>
        </form>

        {/* Demo Fast Fill Helper */}
        <div className="p-3 bg-gray-900/60 rounded-2xl border border-gray-700/60 flex items-center justify-between text-xs">
          <span className="text-gray-400">Default: <code className="text-pizza-yellow">admin@pizzahub.com</code></span>
          <button
            type="button"
            onClick={handleFillDemoAdmin}
            className="font-bold text-pizza-yellow hover:underline"
          >
            Fill Demo Admin
          </button>
        </div>

      </div>
    </div>
  );
}
