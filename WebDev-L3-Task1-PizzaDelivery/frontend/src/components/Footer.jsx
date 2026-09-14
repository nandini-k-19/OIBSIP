import { Link } from 'react-router-dom';
import { Shield, Clock, Heart, Sparkles, Flame } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#050505] text-stone-300 pt-16 pb-12 border-t border-[#1C1C1C] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pizza-red via-pizza-tomato to-pizza-amber flex items-center justify-center text-white shadow-md">
                <span className="text-xl">🍕</span>
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                Pizza<span className="gradient-text-pizza">Hub</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-400 dark:text-[#B8B8B8] leading-relaxed font-normal">
              The Pizza Universe: Handcrafted artisanal pizzas prepared fresh with 72h cold-fermented doughs, Italian San Marzano sauces, and 100% pure Fior di Latte mozzarella.
            </p>
            <div className="flex items-center gap-2 text-xs text-pizza-gold dark:text-[#FFC857] font-bold">
              <Clock size={14} /> 30-Minute Hearth Delivery Guarantee
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">
              Pizza Universe
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium text-stone-300 dark:text-[#E5E5E5]">
              <li><Link to="/menu" className="hover:text-pizza-gold dark:hover:text-[#FFC857] transition-colors">Specialty Menu</Link></li>
              <li><Link to="/build-pizza" className="hover:text-pizza-gold dark:hover:text-[#FFC857] transition-colors">Custom Pizza Builder</Link></li>
              <li><Link to="/orders" className="hover:text-pizza-gold dark:hover:text-[#FFC857] transition-colors">Live Order Tracker</Link></li>
              <li><Link to="/cart" className="hover:text-pizza-gold dark:hover:text-[#FFC857] transition-colors">Shopping Cart</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">
              Hearth Support
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium text-stone-300 dark:text-[#E5E5E5]">
              <li><span className="text-white font-semibold">Email:</span> support@pizzahub.com</li>
              <li><span className="text-white font-semibold">Phone:</span> +91 1800-PIZZA-HUB</li>
              <li><span className="text-white font-semibold">Hours:</span> 11:00 AM - 11:30 PM Daily</li>
              <li><span className="text-white font-semibold">Security:</span> 🔒 256-Bit SSL Razorpay</li>
            </ul>
          </div>

          {/* Admin Portal Info */}
          <div className="bg-[#121212] p-5 rounded-2xl border border-[#222222]">
            <div className="flex items-center gap-2 text-white font-bold text-sm mb-2">
              <Shield size={16} className="text-pizza-gold dark:text-[#FFC857]" />
              Staff & Management
            </div>
            <p className="text-xs text-stone-400 dark:text-[#B8B8B8] mb-4 font-normal">
              Kitchen control portal for real-time dispatching and ingredient stock monitoring.
            </p>
            <Link
              to="/admin/login"
              className="inline-block w-full text-center py-2.5 px-3 text-xs font-black text-white bg-gradient-to-r from-pizza-red to-pizza-amber hover:from-pizza-darkRed hover:to-pizza-tomato rounded-xl transition-all shadow-md"
            >
              Admin Portal Login &rarr;
            </Link>
          </div>

        </div>

        <div className="pt-8 border-t border-[#1C1C1C] text-center text-xs text-stone-400 dark:text-[#B8B8B8] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} PizzaHub Delivery System. The Pizza Universe Experience.</p>
          <p className="flex items-center gap-1 text-stone-300 dark:text-[#E5E5E5]">
            Powered by FastAPI <span className="text-pizza-red">♥</span> React, MySQL & WebSockets
          </p>
        </div>
      </div>
    </footer>
  );
}

