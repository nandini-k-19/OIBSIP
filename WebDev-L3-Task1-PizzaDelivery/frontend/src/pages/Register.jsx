import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { User, Mail, Lock, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/register', {
        full_name: fullName,
        email,
        password,
        confirm_password: confirmPassword,
      });

      setSuccessMessage('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.detail || 'Registration failed. Email might already be taken.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-[#FFF3DC] dark:bg-[#15100F] p-8 sm:p-10 rounded-3xl border border-[#EAD5C5] dark:border-[#2A1A18] shadow-xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#FFE4C4] dark:bg-[#251A18] text-pizza-red rounded-2xl flex items-center justify-center mx-auto text-3xl shadow-inner border border-[#E5C3AB] dark:border-[#4A0E17]">
            🍕
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-[#FFF1D6] tracking-tight">Create Account</h1>
          <p className="text-xs text-gray-600 dark:text-[#D6C2A5]">Sign up to unlock custom pizzas and live order tracking.</p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-[#FF7B7B] text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 text-green-700 dark:text-[#8FE3B0] text-xs font-semibold flex items-center gap-2">
            <CheckCircle size={16} className="shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-[#F3DFC0] uppercase mb-1">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#AFA08F]" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EAD5C5] dark:border-[#2A1A18] bg-[#FAF5EE] dark:bg-[#1A1211] text-gray-900 dark:text-[#FFF1D6] focus:ring-2 focus:ring-pizza-red/20 focus:border-pizza-red text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-[#F3DFC0] uppercase mb-1">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#AFA08F]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EAD5C5] dark:border-[#2A1A18] bg-[#FAF5EE] dark:bg-[#1A1211] text-gray-900 dark:text-[#FFF1D6] focus:ring-2 focus:ring-pizza-red/20 focus:border-pizza-red text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-[#F3DFC0] uppercase mb-1">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#AFA08F]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EAD5C5] dark:border-[#2A1A18] bg-[#FAF5EE] dark:bg-[#1A1211] text-gray-900 dark:text-[#FFF1D6] focus:ring-2 focus:ring-pizza-red/20 focus:border-pizza-red text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-[#F3DFC0] uppercase mb-1">Confirm Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#AFA08F]" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EAD5C5] dark:border-[#2A1A18] bg-[#FAF5EE] dark:bg-[#1A1211] text-gray-900 dark:text-[#FFF1D6] focus:ring-2 focus:ring-pizza-red/20 focus:border-pizza-red text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-pizza-red hover:bg-pizza-darkRed shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            {loading ? 'Creating Account...' : <><UserPlus size={16} /> Complete Registration</>}
          </button>
        </form>

        <div className="text-center text-xs text-gray-600 dark:text-[#D6C2A5] pt-2 border-t border-[#EAD5C5] dark:border-[#2A1A18]">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-pizza-red dark:text-[#FF9A3D] hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
