import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token.');
      return;
    }

    const verify = async () => {
      try {
        const res = await api.post('/auth/verify-email', { token });
        setStatus('success');
        setMessage(res.data.message || 'Email verified successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.detail || 'Verification token is invalid or expired.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-[#FFF3DC] dark:bg-[#15100F] p-8 sm:p-10 rounded-3xl border border-[#EAD5C5] dark:border-[#2A1A18] shadow-xl space-y-6 text-center">
        
        {status === 'verifying' && (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-pizza-red border-t-transparent mx-auto"></div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-[#FFF1D6]">Verifying your email...</h2>
            <p className="text-xs text-gray-600 dark:text-[#D6C2A5]">Please wait while we confirm your account security.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <CheckCircle2 size={54} className="text-green-600 dark:text-[#8FE3B0] mx-auto" />
            <h2 className="text-2xl font-black text-gray-900 dark:text-[#FFF1D6]">Email Verified!</h2>
            <p className="text-sm text-gray-600 dark:text-[#D6C2A5]">{message}</p>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-pizza-red hover:bg-pizza-darkRed shadow-md shadow-red-500/20 transition-all cursor-pointer"
              >
                Proceed to Login <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <AlertCircle size={54} className="text-pizza-red mx-auto" />
            <h2 className="text-2xl font-black text-gray-900 dark:text-[#FFF1D6]">Verification Failed</h2>
            <p className="text-sm text-gray-600 dark:text-[#D6C2A5]">{message}</p>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-block px-6 py-2.5 rounded-xl font-bold text-sm text-gray-700 dark:text-[#FFF1D6] bg-[#FFE4C4] dark:bg-[#251A18] hover:bg-[#F8D4C0] dark:hover:bg-[#332220] transition-colors border border-[#E5C3AB] dark:border-[#4A0E17]"
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
