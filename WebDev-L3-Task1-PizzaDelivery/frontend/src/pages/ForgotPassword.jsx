import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Send } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message || 'Password reset link sent to your email.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-[#FFF3DC] dark:bg-[#15100F] p-8 sm:p-10 rounded-3xl border border-[#EAD5C5] dark:border-[#2A1A18] shadow-xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#FFE4C4] dark:bg-[#251A18] text-pizza-red rounded-2xl flex items-center justify-center mx-auto text-3xl shadow-inner border border-[#E5C3AB] dark:border-[#4A0E17]">
            🔑
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-[#FFF1D6] tracking-tight">Reset Password</h1>
          <p className="text-xs text-gray-600 dark:text-[#D6C2A5]">
            Enter your registered email and we'll dispatch a secure recovery link.
          </p>
        </div>

        {message && (
          <div className="p-3.5 rounded-2xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 text-green-700 dark:text-[#8FE3B0] text-xs font-semibold flex items-center gap-2">
            <CheckCircle size={16} className="shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-[#FF7B7B] text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-[#F3DFC0] uppercase mb-1">Registered Email</label>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-pizza-red hover:bg-pizza-darkRed shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? 'Dispatching Link...' : <><Send size={16} /> Send Reset Link</>}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#EAD5C5] dark:border-[#2A1A18]">
          <Link to="/login" className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 dark:text-[#D6C2A5] hover:text-pizza-red">
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}
