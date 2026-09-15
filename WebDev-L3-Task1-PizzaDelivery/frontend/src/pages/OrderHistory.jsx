import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { 
  Package, 
  Clock, 
  ChevronRight, 
  ArrowRight,
  ShoppingBag,
  ExternalLink,
  RotateCcw,
  Receipt,
  Radio,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  CreditCard,
  MapPin
} from 'lucide-react';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [toastMsg, setToastMsg] = useState('');
  const { addStandardPizza, addCustomPizza } = useCart();
  const navigate = useNavigate();

  const handleReorder = (order) => {
    if (!order.items || order.items.length === 0) return;
    order.items.forEach((item) => {
      if (item.is_custom && item.customization) {
        addCustomPizza({
          pizza_name: item.pizza_name,
          unit_price: item.unit_price,
          quantity: item.quantity,
          customization: item.customization
        });
      } else {
        addStandardPizza({
          id: item.pizza_id,
          name: item.pizza_name,
          base_price: item.unit_price
        }, item.quantity);
      }
    });
    setToastMsg(`Items from #${order.order_number} added to cart!`);
    setTimeout(() => {
      navigate('/cart');
    }, 800);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data || []);
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Compute Account Stats
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + (Number(o.grand_total) || 0), 0);
  const activeOrdersCount = orders.filter(o => ['ORDER_RECEIVED', 'IN_KITCHEN', 'SENT_TO_DELIVERY'].includes(o.status)).length;

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'active') return ['ORDER_RECEIVED', 'IN_KITCHEN', 'SENT_TO_DELIVERY'].includes(order.status);
    if (activeTab === 'delivered') return order.status === 'DELIVERED';
    if (activeTab === 'cancelled') return order.status === 'CANCELLED';
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ORDER_RECEIVED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60"><span>📝</span> Received</span>;
      case 'IN_KITCHEN':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-800/60 animate-pulse"><span>🔥</span> In Hearth Oven</span>;
      case 'SENT_TO_DELIVERY':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800/60 animate-pulse"><span>🛵</span> Out for Delivery</span>;
      case 'DELIVERED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60"><span>✓</span> Delivered</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800/60"><span>✕</span> Cancelled</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pizza-red border-t-transparent"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Loading your previous order receipts...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 transition-colors duration-300">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-pizza-burgundy text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-pizza-gold/40 animate-in fade-in slide-in-from-bottom-5">
          <span className="text-xl">🍕</span>
          <span className="text-sm font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#EAD5C5] dark:border-[#2A1A18] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pizza-burgundy/10 dark:bg-pizza-burgundy/40 text-pizza-red dark:text-pizza-gold text-xs font-black uppercase tracking-wider mb-2">
            <Receipt size={13} />
            <span>Customer Account Ledger</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-pizza-textLight dark:text-pizza-headDark tracking-tight flex items-center gap-3">
            <span>My Orders & Invoices</span>
          </h1>
          <p className="text-sm text-pizza-mutedLight dark:text-pizza-mutedDark mt-1">
            Complete transaction receipts, past pizza history, and instant re-ordering.
          </p>
        </div>
        <Link
          to="/menu"
          className="px-6 py-3 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-pizza-red via-pizza-tomato to-pizza-amber hover:from-pizza-darkRed hover:to-pizza-tomato shadow-md shadow-red-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <span>Order Fresh Pizza</span>
          <span>🍕</span>
        </Link>
      </div>

      {/* Account Overview Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FFF3DC] dark:bg-[#15100F] p-5 rounded-3xl border border-[#EAD5C5] dark:border-[#2A1A18] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFE4C4] dark:bg-[#251A18] text-pizza-red dark:text-pizza-gold flex items-center justify-center text-xl font-bold border border-[#E5C3AB] dark:border-[#4A0E17]">
            📦
          </div>
          <div>
            <p className="text-xs font-bold text-pizza-mutedLight dark:text-pizza-mutedDark uppercase tracking-wider">Total Orders</p>
            <p className="text-2xl font-black text-pizza-textLight dark:text-pizza-headDark">{totalOrders}</p>
          </div>
        </div>

        <div className="bg-[#FFE4C4] dark:bg-[#15100F] p-5 rounded-3xl border border-[#E5C3AB] dark:border-[#2A1A18] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F8D4C0] dark:bg-[#251A18] text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xl font-bold border border-[#E4B59D] dark:border-[#4A0E17]">
            💳
          </div>
          <div>
            <p className="text-xs font-bold text-pizza-mutedLight dark:text-pizza-mutedDark uppercase tracking-wider">Total Spent</p>
            <p className="text-2xl font-black text-pizza-red dark:text-pizza-gold">₹{totalSpent.toFixed(0)}</p>
          </div>
        </div>

        <div className="bg-[#F8D4C0] dark:bg-[#15100F] p-5 rounded-3xl border border-[#E4B59D] dark:border-[#2A1A18] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF3DC] dark:bg-[#251A18] text-pizza-amber flex items-center justify-center text-xl font-bold border border-[#EAD5C5] dark:border-[#4A0E17]">
            🛵
          </div>
          <div>
            <p className="text-xs font-bold text-pizza-mutedLight dark:text-pizza-mutedDark uppercase tracking-wider">Active In-Flight</p>
            <p className="text-2xl font-black text-pizza-textLight dark:text-pizza-headDark flex items-center gap-2">
              <span>{activeOrdersCount}</span>
              {activeOrdersCount > 0 && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#EAD5C5] dark:border-[#2A1A18]">
        {[
          { id: 'all', label: 'All Orders', count: totalOrders },
          { id: 'active', label: 'Active In-Flight 🛵', count: activeOrdersCount },
          { id: 'delivered', label: 'Delivered ✓', count: orders.filter(o => o.status === 'DELIVERED').length },
          { id: 'cancelled', label: 'Cancelled ✕', count: orders.filter(o => o.status === 'CANCELLED').length }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-pizza-red text-white shadow-md'
                : 'bg-[#FFF3DC] dark:bg-[#15100F] text-pizza-textLight dark:text-pizza-mutedDark hover:bg-[#FFE4C4] dark:hover:bg-[#1C1412] border border-[#EAD5C5] dark:border-[#2A1A18]'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-black/10 dark:bg-white/10 text-pizza-mutedLight dark:text-pizza-mutedDark'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-[#FFF3DC] dark:bg-[#15100F] p-12 rounded-3xl border border-[#EAD5C5] dark:border-[#2A1A18] text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FFE4C4] dark:bg-[#251A18] text-pizza-red flex items-center justify-center mx-auto text-2xl border border-[#E5C3AB] dark:border-[#4A0E17]">
            📦
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-[#FFF1D6]">No Orders Under This Filter</h3>
          <p className="text-sm text-gray-600 dark:text-[#D6C2A5] max-w-sm mx-auto">
            Try switching filter tabs or explore our menu to order fresh stone-baked pizza!
          </p>
          <div className="pt-2">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-pizza-red hover:bg-pizza-darkRed transition-colors shadow-sm"
            >
              Browse Pizza Menu <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const isActive = ['ORDER_RECEIVED', 'IN_KITCHEN', 'SENT_TO_DELIVERY'].includes(order.status);

            return (
              <div
                key={order.id}
                className={`bg-[#FFF3DC] dark:bg-[#15100F] p-6 sm:p-7 rounded-3xl border ${isActive ? 'border-pizza-amber dark:border-pizza-amber/60 shadow-lg ring-1 ring-pizza-amber/30' : 'border-[#EAD5C5] dark:border-[#2A1A18] shadow-sm'} transition-all space-y-5`}
              >
                {/* Top Order Metadata Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAD5C5] dark:border-[#2A1A18] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#FFE4C4] dark:bg-[#251A18] text-pizza-red dark:text-pizza-gold flex items-center justify-center text-lg font-bold border border-[#E5C3AB] dark:border-[#4A0E17]">
                      🧾
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-black text-pizza-red dark:text-pizza-gold">#{order.order_number}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/20">
                          Paid ✓
                        </span>
                      </div>
                      <p className="text-xs text-pizza-mutedLight dark:text-pizza-mutedDark mt-0.5 flex items-center gap-1.5">
                        <Clock size={12} />
                        <span>Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    
                    {/* Direct Live GPS Cockpit Button */}
                    <Link
                      to={`/track/${order.id}`}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                        isActive
                          ? 'bg-pizza-red text-white shadow-md shadow-red-500/30 animate-pulse'
                          : 'bg-[#FFE4C4] dark:bg-[#1A1211] text-pizza-textLight dark:text-pizza-secondaryDark hover:bg-[#F8D4C0] border border-[#E5C3AB] dark:border-[#2A1A18]'
                      }`}
                    >
                      <Radio size={13} className={isActive ? 'animate-spin' : ''} />
                      <span>{isActive ? '🛰️ Track Live' : 'View Tracker'}</span>
                    </Link>
                  </div>
                </div>

                {/* Items Breakdown Table */}
                <div className="space-y-2 bg-[#FFE4C4]/40 dark:bg-[#1A1211]/50 p-4 rounded-2xl border border-[#E5C3AB]/50 dark:border-[#2A1A18]">
                  <p className="text-[11px] font-black uppercase tracking-wider text-pizza-mutedLight dark:text-pizza-mutedDark">Order Items & Toppings</p>
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm py-1 border-b border-[#EAD5C5]/30 dark:border-[#2A1A18] last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs px-2 py-0.5 rounded-md bg-[#FFF3DC] dark:bg-[#251A18] text-pizza-red dark:text-pizza-gold">{item.quantity}x</span>
                        <div>
                          <span className="font-bold text-pizza-textLight dark:text-pizza-headDark">{item.pizza_name}</span>
                          {item.customization && (
                            <p className="text-[10px] text-pizza-mutedLight dark:text-pizza-mutedDark">Custom recipe</p>
                          )}
                        </div>
                      </div>
                      <span className="font-black text-pizza-textLight dark:text-pizza-headDark">₹{item.total_price}</span>
                    </div>
                  ))}
                </div>

                {/* Delivery Destination Address */}
                {order.delivery_address && (
                  <div className="flex items-start gap-2 text-xs text-pizza-mutedLight dark:text-pizza-mutedDark">
                    <MapPin size={14} className="text-pizza-red shrink-0 mt-0.5" />
                    <span><strong className="text-pizza-textLight dark:text-pizza-headDark">{order.customer_name}:</strong> {order.delivery_address}</span>
                  </div>
                )}

                {/* Footer Total & Reorder Action */}
                <div className="pt-3 border-t border-[#EAD5C5] dark:border-[#2A1A18] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-sm">
                  <div>
                    <span className="text-xs text-pizza-mutedLight dark:text-pizza-mutedDark font-medium">Grand Total Paid: </span>
                    <span className="text-xl font-black text-pizza-red dark:text-pizza-gold">₹{order.grand_total}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleReorder(order)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black text-pizza-textLight dark:text-pizza-headDark bg-[#FFE4C4] dark:bg-[#1A1211] hover:bg-[#F8D4C0] dark:hover:bg-[#251A18] border border-[#E5C3AB] dark:border-[#4A0E17] shadow-sm hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                    >
                      <RotateCcw size={13} className="text-pizza-red dark:text-pizza-gold" />
                      <span>Reorder This Combo 🔄</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
