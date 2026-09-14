import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Star, Flame, Sparkles, Check, ChefHat } from 'lucide-react';

export default function PizzaShapedCard({ pizza, onSelect }) {
  const { addStandardPizza } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addStandardPizza(pizza, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const getCategoryBadge = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('spic') || cat.includes('fire') || cat.includes('diablo')) {
      return { icon: <Flame size={12} className="text-white animate-pulse" />, label: 'Fire', bg: 'bg-gradient-to-r from-red-600 to-orange-500' };
    }
    if (cat.includes('prem') || cat.includes('truffle') || cat.includes('royal')) {
      return { icon: <Sparkles size={12} className="text-pizza-dark" />, label: 'Royal', bg: 'bg-gradient-to-r from-amber-400 to-yellow-300 text-pizza-dark' };
    }
    if (cat.includes('veg') || cat.includes('farm') || cat.includes('garden')) {
      return { icon: <span className="text-[10px]">🌿</span>, label: 'Fresh', bg: 'bg-gradient-to-r from-emerald-600 to-green-500' };
    }
    return { icon: <ChefHat size={12} className="text-white" />, label: 'Special', bg: 'bg-gradient-to-r from-pizza-red to-pizza-amber' };
  };

  const badge = getCategoryBadge(pizza.category || pizza.name);

  return (
    <div 
      onClick={() => onSelect && onSelect(pizza)}
      className="group relative flex flex-col items-center cursor-pointer transition-all duration-500 hover:-translate-y-2 select-none"
      role="article"
      aria-label={`${pizza.name} Pizza Card`}
    >
      {/* Ambient Steam Glow behind the circular pizza */}
      <div className="absolute -top-3 w-44 sm:w-56 h-44 sm:h-56 rounded-full bg-gradient-to-b from-pizza-amber/20 via-pizza-red/10 to-transparent blur-xl group-hover:opacity-100 opacity-40 transition-opacity pointer-events-none" />

      {/* =========================================================================
          CIRCULAR PIZZA-SHAPED SURFACE WITH BAKED CRUST RING
          ========================================================================= */}
      <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-full p-2 bg-gradient-to-tr from-[#92400E] via-[#D97706] to-[#F59E0B] shadow-xl group-hover:shadow-2xl group-hover:scale-105 group-hover:rotate-6 transition-all duration-500">
        
        {/* Inner Scalloped Crust Edge & Pizza Image */}
        <div className="w-full h-full rounded-full overflow-hidden relative border-2 border-amber-900/30 shadow-inner bg-stone-900">
          <img 
            src={pizza.image_url || "/cinematic_pizza_hero.jpg"} 
            alt={pizza.name}
            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
            onError={(e) => { e.target.src = "/cinematic_pizza_hero.jpg"; }}
          />

          {/* Radial Gradient Shade for Depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Rating Star Badge inside circle */}
          <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center gap-1 text-[11px] font-black text-pizza-gold">
            <Star size={11} className="fill-pizza-gold text-pizza-gold" />
            <span>{pizza.rating || 4.9}</span>
          </div>
        </div>

        {/* Top-Right Garnish Category Chip */}
        <div className={`absolute -top-1 -right-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-lg flex items-center gap-1 border border-white/30 z-20 ${badge.bg}`}>
          {badge.icon}
          <span>{badge.label}</span>
        </div>

        {/* Bottom-Right Circular Add-to-Cart Button */}
        <button
          onClick={handleAddToCart}
          className={`absolute -bottom-1 -right-1 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 z-20 border-2 border-[#FAF5EE] dark:border-[#070707] ${
            isAdded 
              ? 'bg-emerald-600 shadow-emerald-500/50' 
              : 'bg-gradient-to-tr from-pizza-red via-pizza-tomato to-pizza-amber shadow-red-500/40 hover:shadow-red-500/60'
          }`}
          title="Add to Cart"
          aria-label={`Add ${pizza.name} to Cart`}
        >
          {isAdded ? (
            <Check size={18} className="stroke-[3]" />
          ) : (
            <ShoppingBag size={18} className="group-hover:rotate-12 transition-transform" />
          )}
        </button>
      </div>

      {/* =========================================================================
          DOCKED ARTISANAL PLATE FLAP (Name, Description, Price)
          ========================================================================= */}
      <div className="-mt-6 sm:-mt-8 w-44 sm:w-52 p-3 sm:p-3.5 rounded-2xl bg-[#FFF3DC]/95 dark:bg-[#15100F]/95 border border-[#EAD5C5] dark:border-[#4A0E17]/60 shadow-lg backdrop-blur-md text-center z-10 group-hover:border-pizza-red/40 transition-colors">
        <h4 className="text-xs sm:text-sm font-black text-pizza-textLight dark:text-pizza-headDark truncate">
          {pizza.name}
        </h4>
        <p className="text-[10px] sm:text-[11px] text-pizza-mutedLight dark:text-pizza-mutedDark line-clamp-1 mt-0.5 font-normal">
          {pizza.description || "Artisan hand-stretched dough & gourmet cheese"}
        </p>
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <span className="text-xs sm:text-sm font-black text-pizza-red dark:text-pizza-gold">
            ₹{pizza.base_price || pizza.price || 399}
          </span>
          <span className="text-[10px] text-pizza-mutedLight dark:text-pizza-mutedDark font-medium">/ 11"</span>
        </div>
      </div>

    </div>
  );
}
