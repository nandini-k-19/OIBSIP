import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  ShoppingBag, 
  Flame, 
  Bike, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Search,
  ExternalLink
} from 'lucide-react';

const STATUS_FLOW = ['ORDER_RECEIVED', 'IN_KITCHEN', 'SENT_TO_DELIVERY', 'DELIVERED', 'CANCELLED'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to load admin orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      alert('Failed to update order status. Please check backend logs.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customer_name && order.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.customer_phone && order.customer_phone.includes(searchQuery));
    const matchStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 transition-colors duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-pizza-borderLight dark:border-pizza-borderDark pb-4">
        <div>
          <h1 className="text-3xl font-black text-pizza-textLight dark:text-white tracking-tight flex items-center gap-2">
            <ShoppingBag size={28} className="text-pizza-red" />
            Kitchen & Dispatch Order Board
          </h1>
          <p className="text-sm text-pizza-mutedLight dark:text-pizza-mutedDark mt-1">
            Real-time status management. Updating status sends instant WebSocket push alerts to customer tracking screens.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-pizza-textLight dark:text-white bg-white dark:bg-pizza-cardDark border border-pizza-borderLight dark:border-pizza-borderDark hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Live</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-pizza-cardDark p-4 rounded-2xl border border-pizza-borderLight dark:border-pizza-borderDark shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by #order, name, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-pizza-borderLight dark:border-pizza-borderDark bg-white dark:bg-pizza-dark text-pizza-textLight dark:text-white text-xs focus:ring-2 focus:ring-pizza-red/20 focus:border-pizza-red"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {['all', 'ORDER_RECEIVED', 'IN_KITCHEN', 'SENT_TO_DELIVERY', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-pizza-burgundy dark:bg-pizza-red text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-pizza-dark text-pizza-mutedLight dark:text-pizza-mutedDark hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              {st === 'all' ? 'All' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-pizza-red border-t-transparent"></div>
          <p className="text-gray-400 text-sm">Loading active orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-pizza-cardDark rounded-3xl border border-pizza-borderLight dark:border-pizza-borderDark space-y-3">
          <p className="text-4xl">📋</p>
          <h3 className="text-lg font-bold text-pizza-textLight dark:text-white">No Orders Found</h3>
          <p className="text-xs text-pizza-mutedLight dark:text-pizza-mutedDark">No matching orders in the selected queue.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-pizza-cardDark p-6 rounded-3xl border border-pizza-borderLight dark:border-pizza-borderDark shadow-sm space-y-5"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pizza-borderLight dark:border-pizza-borderDark pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-black text-pizza-red">#{order.order_number}</span>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase ${
                    order.status === 'ORDER_RECEIVED' ? 'bg-yellow-100 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-300' :
                    order.status === 'IN_KITCHEN' ? 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300' :
                    order.status === 'SENT_TO_DELIVERY' ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300' :
                    order.status === 'DELIVERED' ? 'bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300' :
                    'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300'
                  }`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400">
                    {order.payment_status}
                  </span>
                </div>

                <p className="text-xs text-pizza-mutedLight dark:text-pizza-mutedDark">
                  Ordered: {new Date(order.created_at).toLocaleString()}
                </p>
              </div>

              {/* Order Content */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Left: Customer info & Items */}
                <div className="md:col-span-7 space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 dark:text-[#B8B8B8] uppercase">Customer & Delivery Details</h4>
                    <p className="text-sm font-bold text-pizza-textLight dark:text-white mt-0.5">
                      {order.customer_name} • <span className="font-mono text-xs dark:text-[#E5E5E5]">{order.customer_phone}</span>
                    </p>
                    <p className="text-xs text-pizza-mutedLight dark:text-[#B8B8B8] mt-0.5">{order.delivery_address}</p>
                  </div>

                  <div className="pt-2">
                    <h4 className="text-xs font-bold text-gray-400 dark:text-[#B8B8B8] uppercase mb-1.5">Items Ordered</h4>
                    <div className="space-y-1 bg-gray-50 dark:bg-pizza-dark p-3 rounded-2xl border border-pizza-borderLight dark:border-pizza-borderDark">
                      {order.items?.map((it) => (
                        <div key={it.id} className="flex justify-between text-xs">
                          <span className="text-pizza-textLight dark:text-[#E5E5E5]">
                            <strong className="text-pizza-red dark:text-[#FF8A3D]">{it.quantity}x</strong> {it.pizza_name}
                          </span>
                          <span className="font-bold text-pizza-textLight dark:text-white">₹{it.total_price}</span>
                        </div>
                      ))}
                      <div className="pt-2 mt-1 border-t border-pizza-borderLight dark:border-pizza-borderDark flex justify-between text-xs font-black text-pizza-red dark:text-[#FFC857]">
                        <span>Total Paid (Grand Total)</span>
                        <span>₹{order.grand_total}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Status Action Buttons */}
                <div className="md:col-span-5 bg-gray-50 dark:bg-pizza-dark p-4 rounded-2xl border border-pizza-borderLight dark:border-pizza-borderDark space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 dark:text-[#B8B8B8] uppercase">Advance Order Status</h4>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      disabled={updatingId === order.id || order.status === 'IN_KITCHEN'}
                      onClick={() => handleUpdateStatus(order.id, 'IN_KITCHEN')}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-40 transition-colors shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Flame size={16} /> Send to Kitchen 🔥
                      </div>
                      {order.status === 'IN_KITCHEN' && <span>(Active)</span>}
                    </button>

                    <button
                      disabled={updatingId === order.id || order.status === 'SENT_TO_DELIVERY'}
                      onClick={() => handleUpdateStatus(order.id, 'SENT_TO_DELIVERY')}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 transition-colors shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Bike size={16} /> Dispatch with Driver 🛵
                      </div>
                      {order.status === 'SENT_TO_DELIVERY' && <span>(Active)</span>}
                    </button>

                    <button
                      disabled={updatingId === order.id || order.status === 'DELIVERED'}
                      onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-40 transition-colors shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} /> Mark as Delivered ✓
                      </div>
                      {order.status === 'DELIVERED' && <span>(Active)</span>}
                    </button>
                  </div>
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
