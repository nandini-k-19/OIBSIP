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
  AlertTriangle,
  MapPin,
  Phone,
  MessageSquare,
  Navigation,
  Sparkles,
  Zap,
  ShieldCheck,
  Thermometer
} from 'lucide-react';

const STAGES = [
  { key: 'ORDER_RECEIVED', label: 'Order Received', desc: 'Sent to hearth kitchen', icon: CheckCircle2, timeEst: '2-3 min' },
  { key: 'IN_KITCHEN', label: 'In Kitchen Hearth', desc: 'Baking at 450°C stone fire', icon: Flame, timeEst: '8-12 min' },
  { key: 'SENT_TO_DELIVERY', label: 'GPS In Transit', desc: 'Rider on high-speed route', icon: Bike, timeEst: '12-15 min' },
  { key: 'DELIVERED', label: 'Arrived & Delivered', desc: 'Hot, fresh & ready to enjoy', icon: PackageCheck, timeEst: '0 min' },
];

export default function OrderTracking() {
  const { orderId } = useParams();
  const [userOrders, setUserOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(orderId || null);
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('ORDER_RECEIVED');
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [toastNotification, setToastNotification] = useState('');
  const [gpsProgress, setGpsProgress] = useState(30);
  const [searchOrderInput, setSearchOrderInput] = useState('');
  const [searchError, setSearchError] = useState('');

  const playStatusPing = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5 note
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      // AudioContext not allowed or unsupported
    }
  };

  // Load all user orders initially
  useEffect(() => {
    const loadUserOrders = async () => {
      try {
        const res = await api.get('/orders');
        const list = res.data || [];
        setUserOrders(list);

        // If no specific orderId in URL, pick the most relevant order
        if (!orderId && list.length > 0) {
          const activeOrder = list.find(o => ['ORDER_RECEIVED', 'IN_KITCHEN', 'SENT_TO_DELIVERY'].includes(o.status));
          setSelectedOrderId(activeOrder ? activeOrder.id : list[0].id);
        } else if (orderId) {
          setSelectedOrderId(orderId);
        }
      } catch (err) {
        console.error('Failed to load user orders', err);
      } finally {
        if (!orderId && (!userOrders || userOrders.length === 0)) {
          setLoading(false);
        }
      }
    };
    loadUserOrders();
  }, [orderId]);

  const fetchOrderDetails = async (idToFetch) => {
    const id = idToFetch || selectedOrderId;
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get(`/orders/${id}`);
      if (order && res.data.status !== status) {
        setToastNotification(`Live Kitchen Update: ${res.data.status.replace(/_/g, ' ')} 🍕`);
        playStatusPing();
        setTimeout(() => setToastNotification(''), 4000);
      }
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
    if (selectedOrderId) {
      fetchOrderDetails(selectedOrderId);
    }
  }, [selectedOrderId]);

  useEffect(() => {
    if (!selectedOrderId) return;

    const wsUrl = WS_BASE_URL;
    let ws;

    try {
      ws = new WebSocket(`${wsUrl}/ws/orders/${selectedOrderId}`);

      ws.onopen = () => {
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          if (update.status) {
            if (update.status !== status) {
              setToastNotification(`Live Kitchen Update: ${update.status.replace(/_/g, ' ')} 🍕`);
              playStatusPing();
              setTimeout(() => setToastNotification(''), 4000);
            }
            setStatus(update.status);
            setLastUpdated(new Date());
          }
        } catch (e) {
          console.error('Error parsing WS message', e);
        }
      };

      ws.onerror = () => {
        setWsConnected(false);
      };

      ws.onclose = () => {
        setWsConnected(false);
      };
    } catch (err) {
      setWsConnected(false);
    }

    const interval = setInterval(() => {
      fetchOrderDetails(selectedOrderId);
    }, 5000);

    return () => {
      if (ws) ws.close();
      clearInterval(interval);
    };
  }, [selectedOrderId]);

  const handleManualSearch = (e) => {
    e.preventDefault();
    setSearchError('');
    const term = searchOrderInput.trim().replace(/^#/, '');
    if (!term) return;

    const match = userOrders.find(o => 
      String(o.id) === term || 
      String(o.order_number).toLowerCase().includes(term.toLowerCase())
    );

    if (match) {
      setSelectedOrderId(match.id);
      setSearchOrderInput('');
    } else {
      // Try direct API fetch with term
      api.get(`/orders/${term}`)
        .then(res => {
          setOrder(res.data);
          setStatus(res.data.status);
          setSelectedOrderId(res.data.id);
          setSearchOrderInput('');
        })
        .catch(() => {
          setSearchError(`Could not find order #${term}. Please check the number.`);
        });
    }
  };

  // Dynamic GPS animation
  useEffect(() => {
    let target = 20;
    if (status === 'ORDER_RECEIVED') target = 15;
    if (status === 'IN_KITCHEN') target = 45;
    if (status === 'SENT_TO_DELIVERY') target = 80;
    if (status === 'DELIVERED') target = 100;
    setGpsProgress(target);
  }, [status]);

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
        <p className="text-gray-500 dark:text-gray-400 font-medium">Connecting to GPS Tracking Satellite...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 transition-colors duration-300">
        <div className="w-20 h-20 rounded-full bg-[#FFF3DC] dark:bg-[#15100F] border border-[#EAD5C5] dark:border-[#4A0E17] text-pizza-red flex items-center justify-center mx-auto text-3xl shadow-lg">
          🛰️
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-pizza-textLight dark:text-pizza-headDark tracking-tight">Live Order Radar Portal</h2>
          <p className="text-sm text-pizza-mutedLight dark:text-pizza-mutedDark max-w-md mx-auto">
            Enter your Order Number to connect to real-time stone hearth & GPS dispatch telemetry.
          </p>
        </div>

        {/* Search Order Input Form */}
        <form onSubmit={handleManualSearch} className="max-w-md mx-auto flex gap-2">
          <input
            type="text"
            placeholder="Enter Order # (e.g. ORD-1234 or 1)..."
            value={searchOrderInput}
            onChange={(e) => setSearchOrderInput(e.target.value)}
            className="flex-1 px-4 py-3 rounded-2xl bg-[#FFF3DC] dark:bg-[#15100F] border border-[#EAD5C5] dark:border-[#2A1A18] text-pizza-textLight dark:text-pizza-headDark placeholder-pizza-mutedLight text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl font-black text-xs text-white bg-pizza-red hover:bg-pizza-darkRed shadow-md transition-all cursor-pointer"
          >
            Track 🔍
          </button>
        </form>
        {searchError && <p className="text-xs font-bold text-red-500">{searchError}</p>}

        {userOrders.length > 0 && (
          <div className="pt-4 space-y-3">
            <p className="text-xs font-black uppercase tracking-wider text-pizza-mutedLight dark:text-pizza-mutedDark">Or pick from your recent orders:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {userOrders.map(o => (
                <button
                  key={o.id}
                  onClick={() => setSelectedOrderId(o.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#FFF3DC] dark:bg-[#15100F] border border-[#EAD5C5] dark:border-[#2A1A18] text-xs font-black text-pizza-textLight dark:text-pizza-headDark hover:border-pizza-red transition-all cursor-pointer"
                >
                  #{o.order_number} ({o.status.replace(/_/g, ' ')})
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4">
          <Link to="/menu" className="inline-block px-6 py-3 rounded-2xl font-bold text-xs text-white bg-pizza-dark dark:bg-pizza-burgundy hover:bg-black transition-all">
            Browse Pizza Menu 🍕
          </Link>
        </div>
      </div>
    );
  }

  const currentIdx = getCurrentStageIndex();
  const isCancelled = status === 'CANCELLED';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 transition-colors duration-300">
      
      {/* Real-time Push Alert Toast */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-pizza-burgundy text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-pizza-amber/40 animate-in fade-in slide-in-from-bottom-5">
          <span className="text-xl">🔔</span>
          <span className="text-sm font-bold">{toastNotification}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#EAD5C5] dark:border-[#2A1A18] pb-5">
        <div>
          <Link to="/orders" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-[#AFA08F] hover:text-pizza-red mb-1">
            <ArrowLeft size={14} /> Back to My Orders Ledger
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black text-pizza-textLight dark:text-pizza-headDark tracking-tight flex items-center gap-3">
            <span>Live GPS Mission Control</span>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </h1>
          <p className="text-xs font-mono text-pizza-red dark:text-pizza-gold font-bold mt-1">
            Telemetry Feed for Order #{order.order_number}
          </p>
        </div>

        {/* WebSocket Signal Indicator */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#FFF3DC] dark:bg-[#15100F] border border-[#EAD5C5] dark:border-[#2A1A18] shadow-md text-xs font-black">
          <Radio size={14} className={wsConnected ? 'text-emerald-500 animate-spin' : 'text-amber-500'} />
          <span className="text-pizza-textLight dark:text-pizza-headDark">
            {wsConnected ? 'WebSocket: Real-Time Active' : 'HTTP Polling Mode'}
          </span>
        </div>
      </div>

      {/* Quick Order Switcher Carousel / Tab if user has multiple orders */}
      {userOrders.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-black text-pizza-mutedLight dark:text-pizza-mutedDark whitespace-nowrap">Switch Order:</span>
          {userOrders.map((o) => (
            <button
              key={o.id}
              onClick={() => setSelectedOrderId(o.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                String(selectedOrderId) === String(o.id)
                  ? 'bg-pizza-red text-white shadow-md scale-105'
                  : 'bg-[#FFF3DC] dark:bg-[#15100F] text-pizza-textLight dark:text-pizza-headDark border border-[#EAD5C5] dark:border-[#2A1A18] hover:border-pizza-red'
              }`}
            >
              <span>#{o.order_number}</span>
              <span className="text-[10px] opacity-80">({o.status.replace(/_/g, ' ')})</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Mission Control Cockpit */}
      <div className="bg-[#FFF3DC] dark:bg-[#15100F] p-6 sm:p-8 rounded-3xl border border-[#EAD5C5] dark:border-[#4A0E17]/60 shadow-xl space-y-8">
        
        {isCancelled ? (
          <div className="p-6 rounded-2xl bg-red-100/60 dark:bg-red-950/40 border border-red-300 dark:border-red-900/60 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-lg">
              <AlertTriangle size={28} />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-red-700 dark:text-[#FF7B7B]">Mission Aborted</span>
              <h3 className="text-lg font-black text-red-900 dark:text-[#FF7B7B]">This Order Was Cancelled</h3>
              <p className="text-xs text-red-700 dark:text-[#F3DFC0]">
                If you were charged, your refund has been initiated to your original payment method. Contact <code>support@pizzahub.com</code> for any assistance.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* 1. Interactive Live GPS Dispatch Simulator Map */}
            <div className="relative rounded-3xl overflow-hidden bg-[#181313] border border-[#2A1A18] p-6 text-white space-y-6 shadow-inner">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <Navigation size={16} className="text-pizza-gold animate-spin" />
                  <span className="text-xs font-black uppercase tracking-wider text-[#FFF1D6]">Live Radar Dispatch Route</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-[#AFA08F]">Hearth: <strong className="text-pizza-gold">450°C Stone Oven</strong></span>
                  <span className="text-[#AFA08F]">ETA: <strong className="text-emerald-400">~{status === 'DELIVERED' ? '0' : '22'} Mins</strong></span>
                </div>
              </div>

              {/* Animated Route Line */}
              <div className="relative py-6 px-4">
                <div className="h-2 w-full bg-stone-800 rounded-full relative overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-pizza-red via-pizza-amber to-emerald-400 rounded-full transition-all duration-1000"
                    style={{ width: `${gpsProgress}%` }}
                  />
                </div>

                {/* Waypoints */}
                <div className="flex justify-between items-center mt-3 text-[11px] font-black">
                  <div className="flex items-center gap-1.5 text-pizza-red">
                    <span>🔥</span>
                    <span>Artisan Kitchen</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-pizza-amber">
                    <span>🛵</span>
                    <span>Transit Corridor</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <span>📍</span>
                    <span>Your Doorstep</span>
                  </div>
                </div>
              </div>

              {/* Driver & Telemetry Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-stone-800 text-xs">
                <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-3">
                  <span className="text-2xl">🛵</span>
                  <div>
                    <p className="text-[10px] text-[#AFA08F] uppercase font-bold">Rider Partner</p>
                    <p className="font-black text-[#FFF1D6]">Marco Rossi (4.9 ★)</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-3">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <p className="text-[10px] text-[#AFA08F] uppercase font-bold">Dispatch Vehicle</p>
                    <p className="font-black text-[#FFF1D6]">PizzaHub EV Speedster #07</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-3">
                  <span className="text-2xl">🛡️</span>
                  <div>
                    <p className="text-[10px] text-[#AFA08F] uppercase font-bold">Hearth Thermal Seal</p>
                    <p className="font-black text-emerald-400">Insulated Hot-Box Active</p>
                  </div>
                </div>
              </div>

            </div>

            {/* 2. 4-Stage Progress Stepper */}
            <div className="relative pt-4">
              <div className="hidden sm:block absolute top-1/2 left-8 right-8 h-1 bg-[#FFE4C4] dark:bg-[#2A1A18] -translate-y-1/2 z-0"></div>
              <div
                className="hidden sm:block absolute top-1/2 left-8 h-1 bg-gradient-to-r from-pizza-red to-pizza-amber -translate-y-1/2 z-0 transition-all duration-700"
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
                            ? 'bg-pizza-red text-white shadow-xl shadow-red-500/30 scale-110 ring-4 ring-red-200 dark:ring-red-950/60'
                            : isPast
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-[#FFE4C4] dark:bg-[#1A1211] text-gray-400 dark:text-[#AFA08F]'
                        }`}
                      >
                        <Icon size={24} className={isCurrent ? 'animate-pulse' : ''} />
                      </div>
                      <div>
                        <h4 className={`text-sm font-black ${isCurrent ? 'text-pizza-red dark:text-[#FF7043]' : isPast ? 'text-pizza-textLight dark:text-[#FFF1D6]' : 'text-gray-400 dark:text-[#AFA08F]'}`}>
                          {stage.label}
                        </h4>
                        <p className="text-[11px] text-pizza-mutedLight dark:text-[#AFA08F] leading-tight mt-0.5">{stage.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Live Phase Action Banner */}
            <div className="p-6 rounded-2xl bg-[#FFE4C4] dark:bg-[#1A1211] border border-[#E5C3AB] dark:border-[#4A0E17] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF3DC] dark:bg-[#251A18] text-pizza-red dark:text-[#FFC857] flex items-center justify-center text-2xl shadow-sm border border-[#EAD5C5] dark:border-[#4A0E17]">
                  {currentIdx === 0 && '📝'}
                  {currentIdx === 1 && '🔥'}
                  {currentIdx === 2 && '🛵'}
                  {currentIdx === 3 && '🍕'}
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-pizza-red dark:text-[#FF9A3D]">Current Cooking & Dispatch Phase</span>
                  <h3 className="text-lg font-black text-pizza-textLight dark:text-[#FFF1D6]">
                    {currentIdx >= 0 ? STAGES[currentIdx]?.desc : 'Status: ' + status}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert(`Connecting to PizzaHub Dispatch Support for Order #${order.order_number}`)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FFF3DC] dark:bg-[#251A18] text-pizza-textLight dark:text-[#FFF1D6] border border-[#EAD5C5] dark:border-[#4A0E17] hover:bg-[#FFE4C4] transition-all flex items-center gap-1.5"
                >
                  <Phone size={13} className="text-pizza-red" />
                  <span>Call Kitchen</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* 4. Order In-Flight Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#EAD5C5] dark:border-[#2A1A18]">
          <div className="space-y-2">
            <h4 className="text-xs font-black text-pizza-mutedLight dark:text-[#AFA08F] uppercase tracking-wider">Destination Drop-Off</h4>
            <div className="p-4 rounded-2xl bg-[#FFE4C4]/50 dark:bg-[#1A1211]/50 border border-[#E5C3AB] dark:border-[#2A1A18] space-y-1">
              <p className="text-sm font-black text-pizza-textLight dark:text-[#F3DFC0]">{order.customer_name} ({order.customer_phone})</p>
              <p className="text-xs text-pizza-mutedLight dark:text-[#D6C2A5]">{order.delivery_address}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-black text-pizza-mutedLight dark:text-[#AFA08F] uppercase tracking-wider">In-Flight Pie Manifest</h4>
            <div className="p-4 rounded-2xl bg-[#FFE4C4]/50 dark:bg-[#1A1211]/50 border border-[#E5C3AB] dark:border-[#2A1A18] space-y-2">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span className="font-bold text-pizza-textLight dark:text-[#F3DFC0]">{item.quantity}x {item.pizza_name}</span>
                  <span className="font-black text-pizza-textLight dark:text-[#FFF1D6]">₹{item.total_price}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-[#EAD5C5] dark:border-[#2A1A18] flex justify-between text-sm font-black text-pizza-red dark:text-[#FFC857]">
                <span>Total Charged</span>
                <span>₹{order.grand_total}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
