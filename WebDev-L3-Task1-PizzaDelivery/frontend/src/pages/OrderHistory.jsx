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
  RotateCcw
} from 'lucide-react';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
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
        setOrders(res.data);
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ORDER_RECEIVED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-300">Order Placed</span>;
      case 'IN_KITCHEN':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300">In Kitchen 🔥</span>;
      case 'SENT_TO_DELIVERY':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">Out for Delivery 🛵</span>;
      case 'DELIVERED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300">Delivered ✓</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300">Cancelled</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pizza-red border-t-transparent"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Loading your previous orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 transition-colors duration-300">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-pizza-burgundy text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-pizza-gold/40 animate-in fade-in slide-in-from-bottom-5">
          <span className="text-xl">🍕</span>
          <span className="text-sm font-bold">{toastMsg}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#EAD5C5] dark:border-[#2A1A18] pb-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-[#FFF1D6] tracking-tight flex items-center gap-2.5">
            <Clock size={28} className="text-pizza-red" />
            My Order History
          </h1>
          <p className="text-sm text-gray-600 dark:text-[#D6C2A5] mt-1">Track and view previous pizza delivery orders.</p>
        </div>
        <Link
          to="/menu"
          className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-pizza-red hover:bg-pizza-darkRed shadow-md shadow-red-500/20 transition-all"
        >
          Order Fresh Pizza 🍕
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-[#FFF3DC] dark:bg-[#15100F] p-12 rounded-3xl border border-[#EAD5C5] dark:border-[#2A1A18] text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FFE4C4] dark:bg-[#251A18] text-pizza-red flex items-center justify-center mx-auto text-2xl border border-[#E5C3AB] dark:border-[#4A0E17]">
            📦
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-[#FFF1D6]">No Orders Found Yet</h3>
          <p className="text-sm text-gray-600 dark:text-[#D6C2A5] max-w-sm mx-auto">
            You haven't placed any orders with PizzaHub yet. Start by browsing our menu or crafting a custom pizza!
          </p>
          <div className="pt-2">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-pizza-dark dark:bg-pizza-red hover:bg-black dark:hover:bg-pizza-darkRed transition-colors shadow-sm"
            >
              Browse Pizza Menu <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-[#FFF3DC] dark:bg-[#15100F] p-6 rounded-3xl border border-[#EAD5C5] dark:border-[#2A1A18] shadow-sm hover:shadow-md transition-shadow space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAD5C5] dark:border-[#2A1A18] pb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-pizza-red">#{order.order_number}</span>
                  <p className="text-xs text-gray-500 dark:text-[#AFA08F] mt-0.5">
                    Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(order.status)}
                  <Link
                    to={`/track/${order.id}`}
                    className="flex items-center gap-1 text-xs font-bold text-pizza-red dark:text-[#FF9A3D] hover:underline"
                  >
                    Track Live <ExternalLink size={13} />
                  </Link>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-gray-500 dark:text-[#AFA08F]">{item.quantity}x</span>
                      <span className="font-semibold text-gray-800 dark:text-[#F3DFC0]">{item.pizza_name}</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-[#FFF1D6]">₹{item.total_price}</span>
                  </div>
                ))}
              </div>

              {/* Footer Total & Reorder Action */}
              <div className="pt-3 border-t border-[#EAD5C5] dark:border-[#2A1A18] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-sm">
                <div>
                  <span className="text-xs text-gray-600 dark:text-[#D6C2A5]">Total Paid (incl. Taxes & Delivery): </span>
                  <span className="text-lg font-black text-pizza-red dark:text-[#FFC857]">₹{order.grand_total}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleReorder(order)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-pizza-textLight dark:text-pizza-headDark bg-[#FFE4C4] dark:bg-[#1A1211] hover:bg-[#F8D4C0] dark:hover:bg-[#251A18] border border-[#E5C3AB] dark:border-[#4A0E17] shadow-sm transition-all cursor-pointer"
                >
                  <RotateCcw size={13} className="text-pizza-red dark:text-[#FF7043]" />
                  <span>Reorder This Combo</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
