import { useState, useEffect } from 'react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import PizzaShapedCard from '../components/PizzaShapedCard';
import { DEFAULT_PIZZAS } from '../data/defaultCatalog';
import { 
  Plus, 
  Check, 
  Search, 
  Sparkles, 
  Flame, 
  Star, 
  SlidersHorizontal, 
  ShoppingBag,
  ArrowUpDown,
  Filter
} from 'lucide-react';

export default function Menu() {
  const [pizzas, setPizzas] = useState(DEFAULT_PIZZAS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCollection, setActiveCollection] = useState('all');
  const [vegOnly, setVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [maxPrice, setMaxPrice] = useState(1000);
  const [toastMessage, setToastMessage] = useState('');
  const { addStandardPizza } = useCart();

  // Curated Pizza Universe Collections
  const collections = [
    { id: 'all', label: 'All Pizzas', icon: '🍕' },
    { id: 'signature', label: 'Signature Pizzas', icon: '🔥', match: ['diablo', 'supreme', 'margherita', 'special'] },
    { id: 'classic', label: 'Classic Italian', icon: '🇮🇹', match: ['margherita', 'napoli', 'caprese', 'herb'] },
    { id: 'fire', label: 'Fire & Spice', icon: '🌶️', match: ['diablo', 'fiery', 'spicy', 'jalapeno', 'peri'] },
    { id: 'cheese', label: 'Cheese Lovers', icon: '🧀', match: ['four cheese', 'mozzarella', 'burst', 'melt', 'parmesan'] },
    { id: 'veggie', label: 'Veggie Garden', icon: '🌿', match: ['farmhouse', 'mushroom', 'garden', 'spinach', 'corn'] },
    { id: 'premium', label: 'Premium Collection', icon: '👑', match: ['truffle', 'royale', 'gold', 'burrata', 'signature'] }
  ];

  useEffect(() => {
    const fetchPizzas = async () => {
      try {
        const res = await api.get('/pizzas');
        if (res.data && res.data.length > 0) {
          setPizzas(res.data);
        }
      } catch (err) {
        console.warn('Backend API connection notice, using catalog default', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPizzas();
  }, []);

  const handleAddToCart = (pizza) => {
    addStandardPizza(pizza, 1);
    setToastMessage(`Added ${pizza.name} to cart!`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Filter & Sort Logic
  const filteredPizzas = pizzas
    .filter((pizza) => {
      const searchTarget = `${pizza.name} ${pizza.description || ''} ${pizza.category || ''}`.toLowerCase();
      const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());
      
      let matchesCollection = true;
      if (activeCollection !== 'all') {
        const targetCollection = collections.find(c => c.id === activeCollection);
        if (targetCollection?.match) {
          matchesCollection = targetCollection.match.some(m => searchTarget.includes(m)) || pizza.category === activeCollection;
        }
      }

      const matchesVeg = !vegOnly || pizza.is_veg === true;
      const price = pizza.base_price || pizza.price || 0;
      const matchesPrice = price <= maxPrice;

      return matchesSearch && matchesCollection && matchesVeg && matchesPrice;
    })
    .sort((a, b) => {
      const priceA = a.base_price || a.price || 0;
      const priceB = b.base_price || b.price || 0;
      if (sortBy === 'price-low') return priceA - priceB;
      if (sortBy === 'price-high') return priceB - priceA;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return (b.rating || 5) - (a.rating || 5);
    });

  const featuredSpecials = pizzas.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 transition-colors duration-300">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-pizza-burgundy text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-pizza-gold/40 animate-in fade-in slide-in-from-bottom-5">
          <span className="text-xl">🍕</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          1. HEADER BANNER ("EXPLORE THE PIZZA UNIVERSE")
          ========================================================================= */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pizza-burgundy/10 dark:bg-pizza-burgundy/40 text-pizza-red dark:text-pizza-gold text-xs font-black uppercase tracking-widest border border-pizza-red/20">
          <Sparkles size={14} />
          <span>Artisanal Italian Hearth</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-pizza-textLight dark:text-white tracking-tight">
          Explore The <span className="gradient-text-pizza">Pizza Universe</span>
        </h1>
        <p className="text-pizza-mutedLight dark:text-pizza-mutedDark text-sm sm:text-base max-w-xl mx-auto font-normal">
          Hand-stretched 72h fermented doughs, San Marzano plum tomatoes, and gourmet whole-milk mozzarella baked at 450°C.
        </p>
      </div>

      {/* =========================================================================
          2. FEATURED PIZZA-SHAPED HIGHLIGHTS
          ========================================================================= */}
      {activeCollection === 'all' && !searchQuery && featuredSpecials.length > 0 && (
        <div className="space-y-6 pt-2 pb-4 border-b border-stone-200 dark:border-[#222222]">
          <div className="flex items-center gap-2">
            <span className="text-xl">⭐</span>
            <h2 className="text-lg font-black text-pizza-textLight dark:text-white uppercase tracking-wider">
              Chef's Special Highlights
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 justify-items-center">
            {featuredSpecials.map((pizza) => (
              <PizzaShapedCard 
                key={pizza.id} 
                pizza={pizza} 
                onSelect={handleAddToCart}
              />
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          3. FILTER & SEARCH CONTROL CENTER
          ========================================================================= */}
      <div className="bg-[#FFF3DC] dark:bg-[#15100F] p-5 sm:p-6 rounded-3xl border border-[#EAD5C5] dark:border-[#2A1A18] shadow-xl space-y-5">
        
        {/* Top Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pizza-mutedLight dark:text-pizza-mutedDark" />
            <input
              type="text"
              placeholder="Search pizzas by name, toppings, or spices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#EAD5C5] dark:border-[#2A1A18] bg-[#FAF5EE] dark:bg-[#181313] text-pizza-textLight dark:text-pizza-textDark placeholder-pizza-mutedLight dark:placeholder-pizza-mutedDark focus:outline-none focus:ring-2 focus:ring-pizza-red/30 focus:border-pizza-red text-sm transition-all"
            />
          </div>

          {/* Right Controls: Veg Filter & Sort */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            
            {/* Veg Only Toggle */}
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all border cursor-pointer ${
                vegOnly 
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/20' 
                  : 'bg-[#FFE4C4] dark:bg-[#181313] text-pizza-textLight dark:text-pizza-secondaryDark border-[#E5C3AB] dark:border-[#2A1A18] hover:border-emerald-500/40'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Veg Only</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-[#FFE4C4] dark:bg-[#181313] px-3.5 py-2.5 rounded-2xl border border-[#E5C3AB] dark:border-[#2A1A18]">
              <ArrowUpDown size={14} className="text-pizza-mutedLight dark:text-pizza-mutedDark" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-bold text-pizza-textLight dark:text-pizza-headDark focus:outline-none cursor-pointer"
              >
                <option value="popular" className="bg-[#FFF3DC] dark:bg-[#15100F] text-pizza-textLight dark:text-white">Popular & Top Rated</option>
                <option value="price-low" className="bg-[#FFF3DC] dark:bg-[#15100F] text-pizza-textLight dark:text-white">Price: Low to High</option>
                <option value="price-high" className="bg-[#FFF3DC] dark:bg-[#15100F] text-pizza-textLight dark:text-white">Price: High to Low</option>
                <option value="name" className="bg-[#FFF3DC] dark:bg-[#15100F] text-pizza-textLight dark:text-white">Name (A-Z)</option>
              </select>
            </div>

          </div>

        </div>

        {/* Collection Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {collections.map((col) => (
            <button
              key={col.id}
              onClick={() => setActiveCollection(col.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all duration-300 cursor-pointer ${
                activeCollection === col.id
                  ? 'bg-gradient-to-r from-pizza-red via-pizza-tomato to-pizza-amber text-white shadow-lg shadow-red-500/30 scale-105'
                  : 'bg-[#FFE4C4] dark:bg-[#181313] text-pizza-textLight dark:text-pizza-secondaryDark hover:bg-[#F8D4C0] dark:hover:bg-[#201816] border border-[#E5C3AB] dark:border-[#2A1A18]'
              }`}
            >
              <span>{col.icon}</span>
              <span>{col.label}</span>
            </button>
          ))}
        </div>

      </div>

      {/* =========================================================================
          4. MAIN DENSE PIZZA CATALOG GRID
          ========================================================================= */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 rounded-3xl bg-[#FFE4C4]/60 dark:bg-pizza-darkCard animate-pulse"></div>
          ))}
        </div>
      ) : filteredPizzas.length === 0 ? (
        <div className="text-center py-20 bg-[#FFF3DC] dark:bg-[#15100F] rounded-3xl border border-[#EAD5C5] dark:border-[#2A1A18] space-y-4 shadow-sm">
          <p className="text-5xl">🍕</p>
          <h3 className="text-xl font-black text-pizza-textLight dark:text-pizza-headDark">No Pizzas Match Your Filter</h3>
          <p className="text-xs sm:text-sm text-pizza-mutedLight dark:text-pizza-mutedDark max-w-md mx-auto">
            Try choosing a different collection, switching off the veg filter, or clearing your search term.
          </p>
          <button
            onClick={() => {
              setActiveCollection('all');
              setSearchQuery('');
              setVegOnly(false);
            }}
            className="px-6 py-2.5 rounded-xl text-xs font-black bg-pizza-red text-white hover:bg-pizza-darkRed transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPizzas.map((pizza, idx) => {
            const cardBgClasses = [
              'bg-[#FFF3DC] border-[#EAD5C5]',
              'bg-[#FFE4C4] border-[#E5C3AB]',
              'bg-[#F8D4C0] border-[#E4B59D]',
              'bg-[#FFF0C2] border-[#EED39A]'
            ];
            const currentCardBg = cardBgClasses[idx % cardBgClasses.length];

            return (
              <div
                key={pizza.id}
                className={`${currentCardBg} dark:bg-[#15100F] dark:border-[#2A1A18] hover:dark:border-[#4A0E17] rounded-3xl overflow-hidden border shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-2`}
              >
                <div>
                  {/* Pizza Image with Zoom Effect */}
                  <div className="relative h-64 overflow-hidden bg-stone-900">
                    <img
                      src={pizza.image_url || '/cinematic_pizza_hero.jpg'}
                      alt={pizza.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => { e.target.src = '/cinematic_pizza_hero.jpg'; }}
                    />
                    
                    {/* Price Chip */}
                    <div className="absolute top-4 right-4 bg-[#FFF3DC]/95 dark:bg-black/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-sm font-black text-pizza-red dark:text-pizza-gold shadow-lg border border-[#EAD5C5] dark:border-[#4A0E17]/60">
                      ₹{pizza.base_price || pizza.price || 399}
                    </div>

                    {/* Veg / Non-Veg Indicator */}
                    <div className="absolute top-4 left-4 flex items-center gap-1.5">
                      {pizza.is_veg ? (
                        <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                          <span>🌿</span> Veg
                        </span>
                      ) : (
                        <span className="bg-pizza-red text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                          <span>🍗</span> Non-Veg
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black text-pizza-textLight dark:text-pizza-headDark group-hover:text-pizza-red dark:group-hover:text-pizza-gold transition-colors">
                        {pizza.name}
                      </h3>
                    </div>

                    <p className="text-xs text-pizza-mutedLight dark:text-pizza-mutedDark line-clamp-2 leading-relaxed">
                      {pizza.description || "Handcrafted with artisanal cheese, stone-baked dough, and fresh seasonal Italian ingredients."}
                    </p>
                  </div>
                </div>

                {/* Add to Cart Footer */}
                <div className="p-6 pt-0">
                  <button
                    onClick={() => handleAddToCart(pizza)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-pizza-red to-pizza-amber hover:from-pizza-darkRed hover:to-pizza-tomato transition-all shadow-md shadow-red-500/20 active:scale-95 group-hover:shadow-lg cursor-pointer"
                  >
                    <ShoppingBag size={16} className="group-hover:rotate-12 transition-transform" />
                    <span>Add to Order</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
