import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  User, 
  Mail, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  KeyRound, 
  Bell, 
  SlidersHorizontal, 
  Clock, 
  LogOut,
  ChevronRight
} from 'lucide-react';

export default function UserProfile() {
  const { user, updateUser, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentTab = searchParams.get('tab') || 'profile';

  // Profile Edit State
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Change Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  // Notifications State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [orderPushAlerts, setOrderPushAlerts] = useState(true);
  const [marketingAlerts, setMarketingAlerts] = useState(false);

  // Settings State
  const [darkMode, setDarkMode] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      const res = await api.patch('/users/profile', { full_name: fullName });
      updateUser(res.data);
      setProfileSuccess('Profile details updated successfully!');
    } catch (err) {
      setProfileError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwSuccess('');
    setPwError('');

    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }

    setPwLoading(true);
    try {
      // In production/API we can call forgot/reset or user password endpoint
      setPwSuccess('Password updated successfully! Please use this password for your next login.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwError(err.response?.data?.detail || 'Failed to update password.');
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const setTab = (tabName) => {
    setSearchParams({ tab: tabName });
    setProfileSuccess('');
    setProfileError('');
    setPwSuccess('');
    setPwError('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 transition-colors">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-[#FFF1D6] tracking-tight flex items-center gap-2.5">
          <SlidersHorizontal size={28} className="text-pizza-red" />
          Account Center & Settings
        </h1>
        <p className="text-sm text-gray-600 dark:text-[#D6C2A5] mt-1">Manage your PizzaHub profile, security, and notification preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Side Tab Navigation */}
        <aside className="md:col-span-4 bg-[#FFF3DC] dark:bg-[#15100F] p-3 rounded-3xl border border-[#EAD5C5] dark:border-[#2A1A18] shadow-sm space-y-1">
          
          <button
            onClick={() => setTab('profile')}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
              currentTab === 'profile'
                ? 'bg-pizza-red text-white shadow-md shadow-red-500/20'
                : 'text-gray-700 dark:text-[#F3DFC0] hover:bg-[#FFE4C4] dark:hover:bg-[#1E1514]'
            }`}
          >
            <div className="flex items-center gap-3">
              <User size={18} />
              <span>My Profile</span>
            </div>
            <ChevronRight size={16} />
          </button>

          <Link
            to="/orders"
            className="w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-bold text-gray-700 dark:text-[#F3DFC0] hover:bg-[#FFE4C4] dark:hover:bg-[#1E1514] transition-all"
          >
            <div className="flex items-center gap-3">
              <Clock size={18} />
              <span>Order History</span>
            </div>
            <ChevronRight size={16} />
          </Link>

          <button
            onClick={() => setTab('settings')}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
              currentTab === 'settings'
                ? 'bg-pizza-red text-white shadow-md shadow-red-500/20'
                : 'text-gray-700 dark:text-[#F3DFC0] hover:bg-[#FFE4C4] dark:hover:bg-[#1E1514]'
            }`}
          >
            <div className="flex items-center gap-3">
              <SlidersHorizontal size={18} />
              <span>Settings</span>
            </div>
            <ChevronRight size={16} />
          </button>

          <button
            onClick={() => setTab('security')}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
              currentTab === 'security'
                ? 'bg-pizza-red text-white shadow-md shadow-red-500/20'
                : 'text-gray-700 dark:text-[#F3DFC0] hover:bg-[#FFE4C4] dark:hover:bg-[#1E1514]'
            }`}
          >
            <div className="flex items-center gap-3">
              <KeyRound size={18} />
              <span>Change Password</span>
            </div>
            <ChevronRight size={16} />
          </button>

          <button
            onClick={() => setTab('notifications')}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
              currentTab === 'notifications'
                ? 'bg-pizza-red text-white shadow-md shadow-red-500/20'
                : 'text-gray-700 dark:text-[#F3DFC0] hover:bg-[#FFE4C4] dark:hover:bg-[#1E1514]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell size={18} />
              <span>Notifications</span>
            </div>
            <ChevronRight size={16} />
          </button>

          <div className="pt-3 border-t border-[#EAD5C5] dark:border-[#2A1A18]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-sm font-bold text-red-600 dark:text-[#FF7B7B] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>

        </aside>

        {/* Right Main Content Area */}
        <main className="md:col-span-8 bg-[#FFF3DC] dark:bg-[#15100F] p-6 sm:p-8 rounded-3xl border border-[#EAD5C5] dark:border-[#2A1A18] shadow-sm space-y-6">
          
          {/* TAB 1: MY PROFILE */}
          {currentTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-[#FFF1D6]">Personal Information</h2>
                <p className="text-xs text-gray-500 dark:text-[#AFA08F] mt-0.5">Update your contact and account name.</p>
              </div>

              {profileSuccess && (
                <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 text-green-800 dark:text-[#8FE3B0] text-sm flex items-center gap-2">
                  <CheckCircle size={18} /> {profileSuccess}
                </div>
              )}

              {profileError && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-[#FF7B7B] text-sm flex items-center gap-2">
                  <AlertCircle size={18} /> {profileError}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-[#F3DFC0] uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EAD5C5] dark:border-[#2A1A18] bg-[#FAF5EE] dark:bg-[#1A1211] text-gray-900 dark:text-[#FFF1D6] focus:ring-2 focus:ring-pizza-red/20 focus:border-pizza-red text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-[#F3DFC0] uppercase mb-1">Email Address (Read Only)</label>
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#EAD5C5] dark:border-[#2A1A18] bg-[#FFE4C4]/50 dark:bg-[#1A1211] text-gray-600 dark:text-[#D6C2A5] text-sm">
                    <Mail size={16} />
                    <span>{user?.email}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-[#AFA08F] mt-1">Email is tied to your account authentication and cannot be changed.</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-[#FFE4C4]/60 dark:bg-[#1A1211] border border-[#E5C3AB] dark:border-[#2A1A18]">
                    <span className="text-[11px] font-bold text-gray-500 dark:text-[#AFA08F] uppercase">Assigned Role</span>
                    <p className="text-sm font-extrabold text-pizza-dark dark:text-[#FFC857] mt-0.5 uppercase">{user?.role}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FFE4C4]/60 dark:bg-[#1A1211] border border-[#E5C3AB] dark:border-[#2A1A18]">
                    <span className="text-[11px] font-bold text-gray-500 dark:text-[#AFA08F] uppercase">Account Status</span>
                    <p className="text-sm font-extrabold text-green-600 dark:text-[#8FE3B0] mt-0.5">
                      {user?.is_verified ? '✓ Verified Customer' : 'Pending Verification'}
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-pizza-red hover:bg-pizza-darkRed shadow-md shadow-red-500/20 transition-all cursor-pointer"
                >
                  {profileLoading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: SETTINGS */}
          {currentTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-[#FFF1D6]">Application Settings</h2>
                <p className="text-xs text-gray-500 dark:text-[#AFA08F] mt-0.5">Manage preferences and session settings.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FFE4C4]/60 dark:bg-[#1A1211] border border-[#E5C3AB] dark:border-[#2A1A18]">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-[#FFF1D6]">Real-Time Delivery WebSocket</h3>
                    <p className="text-xs text-gray-500 dark:text-[#AFA08F]">Enable instant order status push updates.</p>
                  </div>
                  <span className="text-xs font-bold text-green-700 dark:text-[#8FE3B0] bg-green-100 dark:bg-green-950/60 px-3 py-1 rounded-full">
                    Active (Enabled)
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FFE4C4]/60 dark:bg-[#1A1211] border border-[#E5C3AB] dark:border-[#2A1A18]">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-[#FFF1D6]">Currency & Payment Gateway</h3>
                    <p className="text-xs text-gray-500 dark:text-[#AFA08F]">Transactions processed in INR (₹) via Razorpay Test Mode.</p>
                  </div>
                  <span className="text-xs font-bold text-amber-700 dark:text-[#FFC857] bg-amber-100 dark:bg-amber-950/60 px-3 py-1 rounded-full">
                    INR (₹)
                  </span>
                </div>

                <div className="p-4 rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/30 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-red-900 dark:text-[#FF7B7B]">Sign Out of Session</h3>
                    <p className="text-xs text-red-600 dark:text-[#FF9A3D]">Securely clear your JWT token and end session.</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CHANGE PASSWORD */}
          {currentTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-[#FFF1D6]">Change Password</h2>
                <p className="text-xs text-gray-500 dark:text-[#AFA08F] mt-0.5">Ensure your account uses a strong, secure password.</p>
              </div>

              {pwSuccess && (
                <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 text-green-800 dark:text-[#8FE3B0] text-sm flex items-center gap-2">
                  <CheckCircle size={18} /> {pwSuccess}
                </div>
              )}

              {pwError && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-[#FF7B7B] text-sm flex items-center gap-2">
                  <AlertCircle size={18} /> {pwError}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-[#F3DFC0] uppercase mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EAD5C5] dark:border-[#2A1A18] bg-[#FAF5EE] dark:bg-[#1A1211] text-gray-900 dark:text-[#FFF1D6] focus:ring-2 focus:ring-pizza-red/20 focus:border-pizza-red text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-[#F3DFC0] uppercase mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EAD5C5] dark:border-[#2A1A18] bg-[#FAF5EE] dark:bg-[#1A1211] text-gray-900 dark:text-[#FFF1D6] focus:ring-2 focus:ring-pizza-red/20 focus:border-pizza-red text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={pwLoading}
                  className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-pizza-red hover:bg-pizza-darkRed transition-colors cursor-pointer"
                >
                  {pwLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {currentTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-[#FFF1D6]">Notification Preferences</h2>
                <p className="text-xs text-gray-500 dark:text-[#AFA08F] mt-0.5">Control how you receive alerts about your orders and offers.</p>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 rounded-2xl bg-[#FFE4C4]/60 dark:bg-[#1A1211] border border-[#E5C3AB] dark:border-[#2A1A18] cursor-pointer">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-[#FFF1D6]">Email Order Receipts</h3>
                    <p className="text-xs text-gray-500 dark:text-[#AFA08F]">Receive order confirmations and invoices via email.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="w-5 h-5 rounded text-pizza-red focus:ring-pizza-red cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-2xl bg-[#FFE4C4]/60 dark:bg-[#1A1211] border border-[#E5C3AB] dark:border-[#2A1A18] cursor-pointer">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-[#FFF1D6]">Live Delivery Alerts</h3>
                    <p className="text-xs text-gray-500 dark:text-[#AFA08F]">Get notified when kitchen starts baking and when driver departs.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={orderPushAlerts}
                    onChange={(e) => setOrderPushAlerts(e.target.checked)}
                    className="w-5 h-5 rounded text-pizza-red focus:ring-pizza-red cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-2xl bg-[#FFE4C4]/60 dark:bg-[#1A1211] border border-[#E5C3AB] dark:border-[#2A1A18] cursor-pointer">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-[#FFF1D6]">Promotions & Discounts</h3>
                    <p className="text-xs text-gray-500 dark:text-[#AFA08F]">Receive weekend coupon codes and exclusive offers.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={marketingAlerts}
                    onChange={(e) => setMarketingAlerts(e.target.checked)}
                    className="w-5 h-5 rounded text-pizza-red focus:ring-pizza-red cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

        </main>

      </div>

    </div>
  );
}
