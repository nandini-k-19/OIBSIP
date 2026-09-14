import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import VoiceLocationAssistant from '../components/VoiceLocationAssistant';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  CreditCard, 
  ShieldCheck, 
  AlertCircle,
  Truck,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function Cart() {
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    subtotal, 
    deliveryFee, 
    tax, 
    grandTotal 
  } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState(user?.full_name || '');
  const [customerPhone, setCustomerPhone] = useState('9876543210');
  const [deliveryAddress, setDeliveryAddress] = useState('Flat 402, Royal Palms Residency, 2nd Cross, Indiranagar, Bengaluru');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showTestModal, setShowTestModal] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState(null);

  const handleInitiateCheckout = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (!customerName || !customerPhone || !deliveryAddress) {
      setErrorMessage('Please fill in all customer and delivery details.');
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const orderPayload = {
        customer_name: customerName,
        customer_phone: customerPhone,
        delivery_address: deliveryAddress,
        items: items.map((item) => {
          if (item.is_custom) {
            return {
              pizza_name: item.pizza_name,
              quantity: item.quantity,
              is_custom: true,
              customization: item.customization,
            };
          } else {
            return {
              pizza_id: item.pizza_id,
              pizza_name: item.pizza_name,
              quantity: item.quantity,
              is_custom: false,
            };
          }
        }),
      };

      const orderRes = await api.post('/orders', orderPayload);
      const createdOrder = orderRes.data;

      const rzpRes = await api.post('/payments/create', {
        order_id: createdOrder.id,
      });
      const rzpData = rzpRes.data;

      if (!rzpData.is_mock && window.Razorpay) {
        const options = {
          key: rzpData.key_id,
          amount: rzpData.amount * 100,
          currency: rzpData.currency,
          name: 'PizzaHub Delivery',
          description: `Order #${createdOrder.order_number}`,
          order_id: rzpData.razorpay_order_id,
          handler: async function (response) {
            await verifyAndCompletePayment(createdOrder.id, {
              order_id: createdOrder.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
          },
          prefill: {
            name: customerName,
            email: user.email,
            contact: customerPhone,
          },
          theme: {
            color: '#FF3B30',
          },
        };

        const rzpInstance = new window.Razorpay(options);
        rzpInstance.on('payment.failed', function (response) {
          setErrorMessage(`Payment Failed: ${response.error.description}`);
          setLoading(false);
        });
        rzpInstance.open();
      } else {
        setPendingOrderData({
          order: createdOrder,
          rzp: rzpData,
        });
        setShowTestModal(true);
        setLoading(false);
      }
    } catch (err) {
      console.error('Checkout error', err);
      setErrorMessage(
        err.response?.data?.detail || 'Failed to initialize order checkout. Check ingredient stock.'
      );
      setLoading(false);
    }
  };

  const verifyAndCompletePayment = async (orderId, verificationData) => {
    setLoading(true);
    try {
      await api.post('/payments/verify', verificationData);
      clearCart();
      navigate(`/track/${orderId}`);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.detail || 'Payment verification failed.'
      );
      setLoading(false);
    }
  };

  const handleSimulateTestPayment = async (status) => {
    if (!pendingOrderData) return;
    setShowTestModal(false);

    if (status === 'success') {
      await verifyAndCompletePayment(pendingOrderData.order.id, {
        order_id: pendingOrderData.order.id,
        razorpay_order_id: pendingOrderData.rzp.razorpay_order_id,
        razorpay_payment_id: `pay_test_${Date.now()}`,
        razorpay_signature: 'mock_signature',
      });
    } else {
      setErrorMessage('Test payment simulation marked as FAILED.');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6 transition-colors duration-300">
        <div className="w-24 h-24 bg-red-50 dark:bg-red-950/50 text-pizza-red rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner">
          🍕
        </div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white">Your Basket is Empty</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-sm">
          Hungry? Add your favorite specialty pizzas or build your own custom crust masterpiece from scratch.
        </p>
        <div className="flex justify-center gap-4 pt-2">
          <Link
            to="/menu"
            className="px-6 py-3 rounded-xl font-bold text-gray-800 dark:text-white bg-white dark:bg-pizza-cardDark border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
          >
            Specialty Menu
          </Link>
          <Link
            to="/build-pizza"
            className="px-6 py-3 rounded-xl font-bold text-white bg-pizza-red hover:bg-pizza-darkRed shadow-md shadow-red-200 dark:shadow-red-950/60 transition-colors"
          >
            Build Custom Pizza
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 transition-colors duration-300">
      
      <div className="flex items-center justify-between border-b border-[#EAD5C5] dark:border-[#2A1A18] pb-4">
        <h1 className="text-3xl font-black text-pizza-textLight dark:text-pizza-headDark tracking-tight flex items-center gap-2">
          <ShoppingBag size={28} className="text-pizza-red" />
          Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
        </h1>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-pizza-mutedLight dark:text-pizza-mutedDark hover:text-pizza-red transition-colors cursor-pointer"
        >
          Clear All
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-[#FF7B7B] text-sm flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Items List */}
        <div className="lg:col-span-7 space-y-4">
          {items.map((item) => (
            <div
              key={item.cart_item_id}
              className="bg-[#FFF3DC] dark:bg-[#15100F] p-5 rounded-3xl border border-[#EAD5C5] dark:border-[#2A1A18] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-pizza-textLight dark:text-pizza-headDark">{item.pizza_name}</h3>
                  {item.is_custom && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-100 dark:bg-pizza-burgundy text-pizza-red dark:text-pizza-gold border border-pizza-red/20">
                      Custom
                    </span>
                  )}
                </div>

                {item.is_custom && item.custom_details && (
                  <p className="text-xs text-pizza-mutedLight dark:text-pizza-mutedDark leading-relaxed">
                    {item.custom_details.base_name} • {item.custom_details.sauce_name} • {item.custom_details.cheese_name}
                    {item.custom_details.vegetable_names?.length > 0 && (
                      <span className="text-green-700 dark:text-[#8FE3B0] font-medium">
                        {' '}• +{item.custom_details.vegetable_names.join(', ')}
                      </span>
                    )}
                  </p>
                )}

                <p className="text-sm font-extrabold text-pizza-red dark:text-pizza-gold">₹{item.unit_price} each</p>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EAD5C5] dark:border-[#2A1A18]">
                {/* Quantity Controls */}
                <div className="flex items-center gap-2 bg-[#FFE4C4] dark:bg-[#181313] p-1.5 rounded-xl border border-[#E5C3AB] dark:border-[#2A1A18]">
                  <button
                    onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                    className="p-1 rounded-lg hover:bg-[#FFF3DC] dark:hover:bg-[#252525] text-pizza-textLight dark:text-pizza-textDark cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-xs font-bold w-6 text-center text-pizza-textLight dark:text-pizza-headDark">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                    className="p-1 rounded-lg hover:bg-[#FFF3DC] dark:hover:bg-[#252525] text-pizza-textLight dark:text-pizza-textDark cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Total & Delete */}
                <div className="flex items-center gap-3">
                  <span className="text-base font-black text-pizza-textLight dark:text-pizza-headDark">
                    ₹{item.unit_price * item.quantity}
                  </span>
                  <button
                    onClick={() => removeItem(item.cart_item_id)}
                    className="p-2 text-pizza-mutedLight dark:text-pizza-mutedDark hover:text-red-600 dark:hover:text-[#FF7B7B] rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Delivery Note */}
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 text-blue-800 dark:text-blue-300 text-xs flex items-center gap-2.5">
            <Truck size={18} className="shrink-0 text-blue-600 dark:text-blue-400" />
            <span>
              {subtotal >= 500
                ? '🎉 Congratulations! You qualified for Free Express Delivery.'
                : `Add ₹${500 - subtotal} more to unlock Free Express Delivery.`}
            </span>
          </div>
        </div>

        {/* Right: Checkout Details & Summary */}
        <div className="lg:col-span-5 bg-[#FFF3DC] dark:bg-[#15100F] p-6 sm:p-7 rounded-3xl border border-[#EAD5C5] dark:border-[#2A1A18] shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-pizza-textLight dark:text-pizza-headDark">Delivery & Payment</h2>

          <form onSubmit={handleInitiateCheckout} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-pizza-textLight dark:text-pizza-headDark uppercase mb-1">
                Recipient Name
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-4 py-2.5 rounded-xl border border-[#EAD5C5] dark:border-[#2A1A18] bg-[#FAF5EE] dark:bg-[#181313] text-pizza-textLight dark:text-pizza-textDark focus:ring-2 focus:ring-pizza-red/20 focus:border-pizza-red text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-pizza-textLight dark:text-pizza-headDark uppercase mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full px-4 py-2.5 rounded-xl border border-[#EAD5C5] dark:border-[#2A1A18] bg-[#FAF5EE] dark:bg-[#181313] text-pizza-textLight dark:text-pizza-textDark focus:ring-2 focus:ring-pizza-red/20 focus:border-pizza-red text-sm"
              />
            </div>

            {/* Chef Pizzo Voice-Assisted AI Location Guide */}
            <VoiceLocationAssistant 
              initialAddress={deliveryAddress}
              onAddressSelected={(newAddress) => setDeliveryAddress(newAddress)}
            />

            <div>
              <label className="block text-xs font-bold text-pizza-textLight dark:text-pizza-headDark uppercase mb-1">
                Confirmed Delivery Address
              </label>
              <textarea
                rows={2}
                required
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="House/Flat number, landmark, street, city..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#EAD5C5] dark:border-[#2A1A18] bg-[#FAF5EE] dark:bg-[#181313] text-pizza-textLight dark:text-pizza-textDark focus:ring-2 focus:ring-pizza-red/20 focus:border-pizza-red text-sm resize-none"
              />
            </div>

            {/* Bill Summary */}
            <div className="pt-4 border-t border-[#EAD5C5] dark:border-[#2A1A18] space-y-2.5 text-sm">
              <div className="flex justify-between text-pizza-mutedLight dark:text-pizza-secondaryDark">
                <span>Items Subtotal</span>
                <span className="font-bold text-pizza-textLight dark:text-pizza-headDark">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-pizza-mutedLight dark:text-pizza-secondaryDark">
                <span>Delivery Charge</span>
                <span className="font-bold text-pizza-textLight dark:text-pizza-headDark">
                  {deliveryFee === 0 ? <span className="text-green-600 dark:text-[#8FE3B0]">FREE</span> : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between text-pizza-mutedLight dark:text-pizza-secondaryDark">
                <span>GST Tax (5%)</span>
                <span className="font-bold text-pizza-textLight dark:text-pizza-headDark">₹{tax}</span>
              </div>
              <div className="pt-3 border-t border-[#EAD5C5] dark:border-[#2A1A18] flex justify-between items-baseline">
                <span className="text-base font-extrabold text-pizza-textLight dark:text-pizza-headDark">Grand Total</span>
                <span className="text-2xl font-black text-pizza-red dark:text-pizza-gold">₹{grandTotal}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-base font-extrabold text-white bg-pizza-red hover:bg-pizza-darkRed shadow-xl shadow-red-200 dark:shadow-red-950/60 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <CreditCard size={18} />
              {loading ? 'Processing Transaction...' : `Pay ₹${grandTotal} via Razorpay`}
            </button>
          </form>
        </div>

      </div>

      {/* Test Sandbox Payment Modal */}
      {showTestModal && pendingOrderData && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#FFF3DC] dark:bg-[#15100F] rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-[#EAD5C5] dark:border-[#2A1A18]">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/60 text-pizza-red flex items-center justify-center mx-auto">
                <CreditCard size={24} />
              </div>
              <h3 className="text-xl font-bold text-pizza-textLight dark:text-pizza-headDark">Razorpay Test Sandbox</h3>
              <p className="text-xs text-pizza-mutedLight dark:text-pizza-mutedDark">
                Order #{pendingOrderData.order.order_number} • Amount: ₹{pendingOrderData.order.grand_total}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFE4C4] dark:bg-[#181313] text-xs text-pizza-textLight dark:text-pizza-textDark space-y-1 border border-[#E5C3AB] dark:border-[#2A1A18]">
              <p>• Razorpay Mock Order ID: <span className="font-mono font-bold text-pizza-textLight dark:text-pizza-headDark">{pendingOrderData.rzp.razorpay_order_id}</span></p>
              <p>• Simulating Razorpay payment gateway response.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSimulateTestPayment('success')}
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs text-white bg-green-600 hover:bg-green-700 shadow-md shadow-green-200 dark:shadow-green-950/60 transition-all cursor-pointer"
              >
                <CheckCircle2 size={16} /> Simulate Success
              </button>
              <button
                onClick={() => handleSimulateTestPayment('fail')}
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-200 dark:shadow-red-950/60 transition-all cursor-pointer"
              >
                <XCircle size={16} /> Simulate Failure
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
