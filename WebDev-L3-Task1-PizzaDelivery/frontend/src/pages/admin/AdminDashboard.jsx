import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  ShoppingBag, 
  Flame, 
  Bike, 
  CheckCircle, 
  AlertTriangle, 
  IndianRupee, 
  Layers, 
  ArrowRight,
  TrendingUp,
  Shield,
  Clock
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard-stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pizza-red border-t-transparent"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Aggregating real-time restaurant metrics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 transition-colors duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-pizza-burgundy to-pizza-deepWine text-white p-8 rounded-3xl shadow-xl border border-pizza-burgundy/60">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-pizza-gold">
            Executive Control Center
          </span>
          <h1 className="text-3xl font-black tracking-tight mt-1">
            PizzaHub Operations Dashboard
          </h1>
          <p className="text-xs text-gray-300 mt-1">
            Real-time synchronization with kitchen line, rider dispatch, and raw ingredient inventory.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/orders"
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-pizza-red hover:bg-pizza-darkRed transition-colors shadow-md shadow-red-950/40"
          >
            Manage Orders Board &rarr;
          </Link>
          <Link
            to="/admin/inventory"
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-pizza-dark bg-pizza-gold hover:bg-pizza-cheese transition-colors shadow-md"
          >
            Live Inventory Table &rarr;
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Revenue */}
        <div className="bg-[#FFF3DC] dark:bg-[#15100F] p-6 rounded-3xl border border-[#EAD5C5] dark:border-[#2A1A18] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-[#AFA08F] uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-[#FFF1D6] mt-1">₹{stats?.total_revenue?.toFixed(2) || '0.00'}</h3>
            <p className="text-[11px] text-green-700 dark:text-[#8FE3B0] font-bold mt-1 flex items-center gap-1">
              <TrendingUp size={12} /> Verified Settlements
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FFE4C4] dark:bg-[#251A18] text-green-700 dark:text-[#8FE3B0] flex items-center justify-center border border-[#E5C3AB] dark:border-[#4A0E17]">
            <IndianRupee size={22} />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-[#FFF3DC] dark:bg-[#15100F] p-6 rounded-3xl border border-[#EAD5C5] dark:border-[#2A1A18] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-[#AFA08F] uppercase tracking-wider">All-Time Orders</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-[#FFF1D6] mt-1">{stats?.total_orders || 0}</h3>
            <p className="text-[11px] text-gray-600 dark:text-[#D6C2A5] font-medium mt-1">Processed in DB</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FFE4C4] dark:bg-[#251A18] text-pizza-red dark:text-[#FFC857] flex items-center justify-center border border-[#E5C3AB] dark:border-[#4A0E17]">
            <ShoppingBag size={22} />
          </div>
        </div>

        {/* In Kitchen */}
        <div className="bg-[#FFF3DC] dark:bg-[#15100F] p-6 rounded-3xl border border-[#EAD5C5] dark:border-[#2A1A18] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-[#AFA08F] uppercase tracking-wider">Active in Kitchen</p>
            <h3 className="text-2xl font-black text-orange-600 dark:text-[#FF7043] mt-1">{stats?.in_kitchen_orders || 0}</h3>
            <p className="text-[11px] text-orange-600 dark:text-[#FF7043] font-bold mt-1">Baking in ovens</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FFE4C4] dark:bg-[#251A18] text-orange-600 dark:text-[#FF7043] flex items-center justify-center border border-[#E5C3AB] dark:border-[#4A0E17]">
            <Flame size={22} />
          </div>
        </div>

        {/* Low Stock Warnings */}
        <div className={`p-6 rounded-3xl border shadow-sm flex items-center justify-between ${
          stats?.low_stock_count > 0 ? 'bg-red-50/90 dark:bg-red-950/40 border-red-300 dark:border-red-900/60' : 'bg-[#FFF3DC] dark:bg-[#15100F] border-[#EAD5C5] dark:border-[#2A1A18]'
        }`}>
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-[#AFA08F] uppercase tracking-wider">Low Stock Items</p>
            <h3 className={`text-2xl font-black mt-1 ${stats?.low_stock_count > 0 ? 'text-red-600 dark:text-[#FF7B7B] animate-pulse' : 'text-gray-900 dark:text-[#FFF1D6]'}`}>
              {stats?.low_stock_count || 0}
            </h3>
            <p className="text-[11px] text-red-600 dark:text-[#FF7B7B] font-bold mt-1">
              {stats?.low_stock_count > 0 ? 'Restock recommended' : 'All thresholds optimal'}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
            stats?.low_stock_count > 0 ? 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-[#FF7B7B] border-red-300 dark:border-red-900' : 'bg-[#FFE4C4] dark:bg-[#251A18] text-gray-600 dark:text-[#D6C2A5] border-[#E5C3AB] dark:border-[#4A0E17]'
          }`}>
            <AlertTriangle size={22} />
          </div>
        </div>

      </div>

      {/* Operational Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-[#FFF3DC] dark:bg-[#15100F] p-6 rounded-3xl border border-[#EAD5C5] dark:border-[#2A1A18] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-yellow-700 dark:text-[#FFC857]">Pending Orders</span>
            <span className="w-3 h-3 rounded-full bg-yellow-400 animate-ping"></span>
          </div>
          <p className="text-4xl font-black text-gray-900 dark:text-[#FFF1D6]">{stats?.pending_orders || 0}</p>
          <p className="text-xs text-gray-600 dark:text-[#D6C2A5]">Incoming paid orders waiting for kitchen pickup.</p>
          <Link to="/admin/orders" className="inline-block text-xs font-bold text-pizza-red dark:text-[#FF9A3D] hover:underline pt-2">
            View Order Queue &rarr;
          </Link>
        </div>

        <div className="bg-[#FFF3DC] dark:bg-[#15100F] p-6 rounded-3xl border border-[#EAD5C5] dark:border-[#2A1A18] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">Out for Delivery</span>
            <Bike size={18} className="text-blue-500" />
          </div>
          <p className="text-4xl font-black text-gray-900 dark:text-[#FFF1D6]">{stats?.sent_to_delivery_orders || 0}</p>
          <p className="text-xs text-gray-600 dark:text-[#D6C2A5]">Dispatched with delivery fleet across the city.</p>
          <Link to="/admin/orders" className="inline-block text-xs font-bold text-pizza-red dark:text-[#FF9A3D] hover:underline pt-2">
            Track Active Deliveries &rarr;
          </Link>
        </div>

        <div className="bg-[#FFF3DC] dark:bg-[#15100F] p-6 rounded-3xl border border-[#EAD5C5] dark:border-[#2A1A18] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-green-700 dark:text-[#8FE3B0]">Successfully Delivered</span>
            <CheckCircle size={18} className="text-green-500" />
          </div>
          <p className="text-4xl font-black text-gray-900 dark:text-[#FFF1D6]">{stats?.delivered_orders || 0}</p>
          <p className="text-xs text-gray-600 dark:text-[#D6C2A5]">Completed deliveries with satisfied customers.</p>
          <Link to="/admin/orders" className="inline-block text-xs font-bold text-pizza-red dark:text-[#FF9A3D] hover:underline pt-2">
            View History &rarr;
          </Link>
        </div>

      </div>

    </div>
  );
}
