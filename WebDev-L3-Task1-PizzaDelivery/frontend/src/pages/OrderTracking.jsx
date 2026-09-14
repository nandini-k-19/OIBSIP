import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { WS_BASE_URL } from '../services/api';
import { 
  CheckCircle2, 
  Flame, 
  Bike, 
  PackageCheck, 
  Clock, 
  Radio, 
  ArrowLeft,
  AlertTriangle
} from 'lucide-react';

const STAGES = [
  { key: 'ORDER_RECEIVED', label: 'Order Received', desc: 'Sent to the kitchen', icon: CheckCircle2 },
  { key: 'IN_KITCHEN', label: 'In Kitchen', desc: 'Baking in woodfired oven', icon: Flame },
  { key: 'SENT_TO_DELIVERY', label: 'Out for Delivery', desc: 'Rider is on the way', icon: Bike },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Enjoy your hot pizza!', icon: PackageCheck },
];

export default function OrderTracking() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('ORDER_RECEIVED');
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchOrderDetails = async () => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      setOrder(res.data);
      setStatus(res.data.status);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load order', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;

    const wsUrl = WS_BASE_URL;
    let ws;

    try {
      ws = new WebSocket(`${wsUrl}/ws/orders/${orderId}`);

      ws.onopen = () => {
        setWsConnected(true);
        console.log(`WebSocket connected for live order #${orderId}`);
      };

      ws.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          if (update.status) {
            setStatus(update.status);
            setLastUpdated(new Date());
          }
        } catch (e) {
          console.error('Error parsing WS message', e);
        }
      };

      ws.onerror = (err) => {
        console.warn('WebSocket error, polling fallback active', err);
        setWsConnected(false);
      };

      ws.onclose = () => {
        setWsConnected(false);
      };
    } catch (err) {
      console.error('Could not initialize WebSocket', err);
      setWsConnected(false);
    }

    const interval = setInterval(() => {
      fetchOrderDetails();
    }, 5000);

    return () => {
      if (ws) ws.close();
      clearInterval(interval);
    };
  }, [orderId]);

  const getCurrentStageIndex = () => {
    switch (status) {
      case 'ORDER_RECEIVED': return 0;
      case 'IN_KITCHEN': return 1;
      case 'SENT_TO_DELIVERY': return 2;
      case 'DELIVERED': return 3;
      case 'CANCELLED': return -1;
      default: return 0;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pizza-red border-t-transparent"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Connecting to live tracking satellite...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4 transition-colors duration-300">
        <AlertTriangle size={48} className="text-red-500 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">We could not locate this order in your account.</p>
        <Link to="/orders" className="inline-block px-6 py-2.5 rounded-xl font-bold text-white bg-pizza-red">
          Back to Orders
        </Link>
      </div>
    );
  }

  const currentIdx = getCurrentStageIndex();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 transition-colors duration-300">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#EAD5C5] dark:border-[#2A1A18] pb-4">
        <div>
          <Link to="/orders" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-[#AFA08F] hover:text-pizza-red mb-1">
            <ArrowLeft size={14} /> Back to My Orders
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-[#FFF1D6] tracking-tight">
            Live Order Tracking
          </h1>
          <p className="text-xs font-mono text-pizza-red font-bold">
            Order #{order.order_number}
          </p>
        </div>

        {/* WebSocket Pulse Indicator */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF3DC] dark:bg-[#15100F] border border-[#EAD5C5] dark:border-[#2A1A18] shadow-sm text-xs font-bold">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${wsConnected ? 'bg-green-400 opacity-75' : 'bg-yellow-400 opacity-75'}`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${wsConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
          </span>
          <span className="text-gray-700 dark:text-[#F3DFC0]">{wsConnected ? 'Live WebSocket Active' : 'Polling Fallback Active'}</span>
        </div>
      </div>

      {/* Main Status Card */}
      <div className="bg-[#FFF3DC] dark:bg-[#15100F] p-6 sm:p-10 rounded-3xl border border-[#EAD5C5] dark:border-[#2A1A18] shadow-lg space-y-10">
        
        {/* Status Stepper */}
        <div className="relative">
          <div className="hidden sm:block absolute top-1/2 left-6 right-6 h-1 bg-[#FFE4C4] dark:bg-[#2A1A18] -translate-y-1/2 z-0"></div>
          <div
            className="hidden sm:block absolute top-1/2 left-6 h-1 bg-pizza-red -translate-y-1/2 z-0 transition-all duration-700"
            style={{ width: `${(Math.max(0, currentIdx) / (STAGES.length - 1)) * 100}%` }}
          ></div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative z-10">
            {STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              const isPast = idx <= currentIdx;
              const isCurrent = idx === currentIdx;

              return (
                <div key={stage.key} className="flex flex-col items-center text-center space-y-2">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                      isCurrent
                        ? 'bg-pizza-red text-white shadow-xl shadow-red-500/20 scale-110 ring-4 ring-red-100 dark:ring-red-950/60'
                        : isPast
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-[#FFE4C4] dark:bg-[#1A1211] text-gray-400 dark:text-[#AFA08F]'
                    }`}
                  >
                    <Icon size={24} className={isCurrent ? 'animate-pulse' : ''} />
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${isCurrent ? 'text-pizza-red dark:text-[#FF7043]' : isPast ? 'text-gray-900 dark:text-[#FFF1D6]' : 'text-gray-400 dark:text-[#AFA08F]'}`}>
                      {stage.label}
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-[#AFA08F] leading-tight mt-0.5">{stage.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Stage Status Banner */}
        <div className="p-6 rounded-2xl bg-[#FFE4C4] dark:bg-[#1A1211] border border-[#E5C3AB] dark:border-[#4A0E17] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-[#FFF3DC] dark:bg-[#251A18] text-pizza-red dark:text-[#FFC857] flex items-center justify-center text-2xl shadow-sm border border-[#EAD5C5] dark:border-[#4A0E17]">
              {currentIdx === 0 && '📝'}
              {currentIdx === 1 && '🔥'}
              {currentIdx === 2 && '🛵'}
              {currentIdx === 3 && '🍕'}
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-pizza-red dark:text-[#FF9A3D]">Current Order Phase</span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-[#FFF1D6]">
                {currentIdx >= 0 ? STAGES[currentIdx]?.desc : 'Status: ' + status}
              </h3>
            </div>
          </div>

          <div className="text-xs text-gray-600 dark:text-[#D6C2A5] text-center sm:text-right">
            <span>Estimated Delivery:</span>
            <p className="font-extrabold text-sm text-gray-900 dark:text-[#FFF1D6]">~25-35 Minutes</p>
          </div>
        </div>

        {/* Order Details & Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#EAD5C5] dark:border-[#2A1A18]">
          <div>
            <h4 className="text-xs font-bold text-gray-500 dark:text-[#AFA08F] uppercase tracking-wider mb-2">Delivery Address</h4>
            <p className="text-sm font-semibold text-gray-800 dark:text-[#F3DFC0]">{order.customer_name} ({order.customer_phone})</p>
            <p className="text-xs text-gray-600 dark:text-[#D6C2A5] mt-1">{order.delivery_address}</p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-500 dark:text-[#AFA08F] uppercase tracking-wider mb-2">Order Items</h4>
            <div className="space-y-1.5">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span className="text-gray-700 dark:text-[#F3DFC0]">{item.quantity}x {item.pizza_name}</span>
                  <span className="font-bold text-gray-900 dark:text-[#FFF1D6]">₹{item.total_price}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-[#EAD5C5] dark:border-[#2A1A18] flex justify-between text-sm font-black text-pizza-red dark:text-[#FFC857]">
                <span>Grand Total Paid</span>
                <span>₹{order.grand_total}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
