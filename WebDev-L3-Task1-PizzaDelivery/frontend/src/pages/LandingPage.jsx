import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import ChefPizzo from '../components/ChefPizzo';
import PizzaShapedCard from '../components/PizzaShapedCard';
import { 
  ChefHat, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Flame, 
  ShoppingBag, 
  Award, 
  Zap, 
  Star,
  CheckCircle2,
  UtensilsCrossed,
  Heart
} from 'lucide-react';

export default function LandingPage() {
  const [allPizzas, setAllPizzas] = useState([]);
  const [featuredPizzas, setFeaturedPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const { addStandardPizza } = useCart();

  const heroOptions = [
    { label: '🌿 Natural Margherita', src: '/natural_artisan_pizza.jpg' },
    { label: '🔥 Rustic Stone-Baked', src: '/natural_rustic_pizza.jpg' },
    { label: '🍕 Pepperoni Diablo', src: '/pepperoni_diablo_pizza.jpg' },
    { label: '🍄 Truffle Burrata', src: '/truffle_burrata_pizza.jpg' },
    { label: '🧀 4-Cheese Formaggi', src: '/four_cheese_gourmet_pizza.jpg' }
  ];
  const [selectedHeroImg, setSelectedHeroImg] = useState('/natural_artisan_pizza.jpg');

  useEffect(() => {
    const fetchPizzas = async () => {
      try {
        const res = await api.get('/pizzas');
        setAllPizzas(res.data || []);
        setFeaturedPizzas(res.data.slice(0, 4));
      } catch (err) {
        console.error('Failed to load pizzas', err);
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

  return (
    <div className="space-y-24 sm:space-y-32 pb-24 overflow-hidden">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-pizza-burgundy text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-pizza-amber/30 animate-in fade-in slide-in-from-bottom-5">
          <span className="text-xl">🍕</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          1. CINEMATIC HERO SECTION ("THE PIZZA UNIVERSE")
          ========================================================================= */}
      <section className="relative pt-6 sm:pt-12 pb-16 lg:pb-24 overflow-hidden">
        
        {/* Ambient Backlight Glow Radiance */}
        <div className="absolute top-0 right-0 w-[550px] sm:w-[850px] h-[550px] sm:h-[850px] pointer-events-none radial-glow-hero-light dark:radial-glow-hero-dark animate-pulse-glow z-0"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-pizza-burgundy/10 dark:bg-pizza-burgundy/25 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[580px]">
            
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-center lg:text-left">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pizza-burgundy/5 dark:bg-pizza-burgundy/30 border border-pizza-burgundy/15 dark:border-pizza-amber/30 text-pizza-burgundy dark:text-pizza-amber text-xs font-black uppercase tracking-widest shadow-sm">
                <Flame size={14} className="text-pizza-red animate-pulse" />
                <span>THE PIZZA UNIVERSE</span>
              </div>

              {/* Large Heading */}
              <h1 className="text-4xl sm:text-6xl lg:text-6xl font-black tracking-tight leading-[1.08] text-pizza-textLight dark:text-pizza-headDark">
                Craft Your Perfect <br />
                <span className="gradient-text-pizza">Pizza Experience</span>
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-pizza-mutedLight dark:text-pizza-mutedDark max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                From classic Italian favorites to your own handcrafted creation. Baked in an authentic 450°C stone oven with 72-hour slow-fermented dough and gourmet cheeses.
              </p>

              {/* Action Buttons & Chef Pizzo Trigger */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start pt-2">
                <Link
                  to="/menu"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-extrabold text-white bg-gradient-to-r from-pizza-red via-pizza-tomato to-pizza-amber hover:from-pizza-darkRed hover:to-pizza-tomato shadow-xl shadow-red-500/25 dark:shadow-red-950/60 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all duration-300 group"
                >
                  <span>ORDER NOW</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/build-pizza"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-pizza-textLight dark:text-pizza-headDark bg-[#FFF3DC] dark:bg-[#15100F] hover:bg-[#FFE4C4] dark:hover:bg-[#1C1412] border border-[#EAD5C5] dark:border-[#4A0E17]/60 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Sparkles size={18} className="text-pizza-gold" />
                  <span>BUILD YOUR PIZZA</span>
                </Link>
              </div>

              {/* Meet Chef Pizzo Voice & AI Assistant Bar */}
              <div className="pt-2 flex justify-center lg:justify-start">
                <ChefPizzo pizzas={allPizzas} />
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#EAD5C5] dark:border-[#2A1A18] max-w-md mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <p className="text-2xl sm:text-3xl font-black text-pizza-burgundy dark:text-pizza-amber">450°C</p>
                  <p className="text-xs text-pizza-mutedLight dark:text-pizza-mutedDark font-medium">Stone Hearth</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-2xl sm:text-3xl font-black text-pizza-burgundy dark:text-pizza-amber">30 Min</p>
                  <p className="text-xs text-pizza-mutedLight dark:text-pizza-mutedDark font-medium">Fast Dispatch</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-2xl sm:text-3xl font-black text-pizza-burgundy dark:text-pizza-amber">100%</p>
                  <p className="text-xs text-pizza-mutedLight dark:text-pizza-mutedDark font-medium">Whole Milk Fior</p>
                </div>
              </div>

            </div>

            {/* Right Cinematic Centerpiece (Large Wood-fired Pizza) */}
            <div className="lg:col-span-6 relative flex justify-center items-center">
              
              {/* Outer Glow Halo */}
              <div className="absolute w-80 sm:w-[480px] h-80 sm:h-[480px] bg-gradient-to-tr from-pizza-red/40 via-pizza-amber/30 to-pizza-gold/20 rounded-full blur-3xl -z-10 animate-pulse-glow"></div>

              {/* Floating Animated Ingredients around Pizza */}
              {/* 🍅 Tomato */}
              <div className="absolute -top-6 -left-4 sm:top-2 sm:-left-6 z-20 animate-particle-1">
                <div className="px-3.5 py-1.5 rounded-full bg-[#FFF3DC]/95 dark:bg-[#15100F]/95 backdrop-blur-md border border-[#EAD5C5] dark:border-[#4A0E17]/60 text-xs font-black text-red-600 dark:text-red-400 shadow-xl flex items-center gap-1.5">
                  🍅 <span>San Marzano Plum</span>
                </div>
              </div>

              {/* 🌿 Fresh Sweet Basil */}
              <div className="absolute -top-8 right-8 sm:-top-6 sm:right-12 z-20 animate-particle-2">
                <div className="px-3.5 py-1.5 rounded-full bg-[#FFF3DC]/95 dark:bg-[#15100F]/95 backdrop-blur-md border border-[#EAD5C5] dark:border-[#4A0E17]/60 text-xs font-black text-emerald-600 dark:text-emerald-400 shadow-xl flex items-center gap-1.5">
                  🌿 <span>Sweet Basil</span>
                </div>
              </div>

              {/* 🧀 Mozzarella Cheese Pull */}
              <div className="absolute top-1/2 -right-6 sm:top-1/3 sm:-right-8 z-20 animate-particle-1">
                <div className="px-3.5 py-1.5 rounded-full bg-[#FFF3DC]/95 dark:bg-[#15100F]/95 backdrop-blur-md border border-[#EAD5C5] dark:border-[#4A0E17]/60 text-xs font-black text-pizza-amber shadow-xl flex items-center gap-1.5">
                  🧀 <span>Fior di Latte</span>
                </div>
              </div>

              {/* 🍄 Tuscan Mushroom */}
              <div className="absolute -bottom-6 -left-2 sm:bottom-4 sm:-left-4 z-20 animate-particle-2">
                <div className="px-3.5 py-1.5 rounded-full bg-[#FFF3DC]/95 dark:bg-[#15100F]/95 backdrop-blur-md border border-[#EAD5C5] dark:border-[#4A0E17]/60 text-xs font-black text-amber-800 dark:text-amber-300 shadow-xl flex items-center gap-1.5">
                  🍄 <span>Portobello</span>
                </div>
              </div>

              {/* 🫒 Kalamata Olive */}
              <div className="absolute -bottom-8 right-6 sm:-bottom-4 sm:right-10 z-20 animate-particle-1">
                <div className="px-3.5 py-1.5 rounded-full bg-[#FFF3DC]/95 dark:bg-[#15100F]/95 backdrop-blur-md border border-[#EAD5C5] dark:border-[#4A0E17]/60 text-xs font-black text-stone-700 dark:text-stone-300 shadow-xl flex items-center gap-1.5">
                  🫒 <span>Kalamata Olives</span>
                </div>
              </div>

              {/* Main Large Cinematic Wood-fired Pizza Frame */}
              <div className="relative w-full max-w-lg rounded-full p-3 bg-gradient-to-tr from-[#92400E] via-[#D97706] to-[#F59E0B] shadow-2xl group animate-float-slow">
                
                <div className="relative rounded-full overflow-hidden aspect-square border-4 border-amber-900/40 shadow-2xl bg-black">
                  <img
                    src={selectedHeroImg}
                    alt="PizzaHub Masterpiece Pizza"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-700"
                  />

                  {/* Subtle Steam Wisp Overlay Effect */}
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 pointer-events-none w-32 h-32 bg-white/15 rounded-full blur-2xl animate-steam-rise"></div>
                </div>

                {/* Floating Kitchen Live Status Badge */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full bg-[#FFF3DC]/95 dark:bg-[#15100F]/95 backdrop-blur-md border border-[#EAD5C5] dark:border-[#4A0E17]/60 shadow-2xl flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-black text-pizza-textLight dark:text-pizza-headDark uppercase tracking-wider">
                    Stone Hearth: 450°C Live
                  </span>
                </div>

              </div>

              {/* Quick Hero Pizza Variant Selector Pills */}
              <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#FFF3DC]/90 dark:bg-[#15100F]/90 backdrop-blur-md p-1.5 rounded-full border border-[#EAD5C5] dark:border-[#4A0E17]/60 shadow-xl z-30 whitespace-nowrap">
                {heroOptions.map((opt) => (
                  <button
                    key={opt.src}
                    type="button"
                    onClick={() => setSelectedHeroImg(opt.src)}
                    className={`px-3 py-1 text-xs font-black rounded-full transition-all duration-200 cursor-pointer ${
                      selectedHeroImg === opt.src
                        ? 'bg-pizza-red text-white shadow-md scale-105'
                        : 'text-pizza-textLight dark:text-pizza-mutedDark hover:text-pizza-red dark:hover:text-pizza-gold'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          2. SIGNATURE PIZZA COLLECTIONS (PIZZA-SHAPED CARDS)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-[#EAD5C5] dark:border-[#2A1A18] pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-pizza-red dark:text-pizza-gold">
              <Star size={14} className="fill-pizza-red dark:fill-pizza-gold" />
              <span>Chef's Featured Picks</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-pizza-textLight dark:text-pizza-headDark tracking-tight mt-1">
              Signature Pizza Highlights
            </h2>
          </div>
          <Link
            to="/menu"
            className="text-sm font-bold text-pizza-red dark:text-pizza-gold hover:underline flex items-center gap-1.5 group"
          >
            <span>Explore All Collections</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 rounded-full bg-[#FFE4C4]/50 dark:bg-pizza-darkCard animate-pulse mx-auto w-60"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-8 justify-items-center">
            {featuredPizzas.map((pizza) => (
              <PizzaShapedCard 
                key={pizza.id} 
                pizza={pizza} 
                onSelect={handleAddToCart}
              />
            ))}
          </div>
        )}
      </section>

      {/* =========================================================================
          3. HOW IT WORKS (3-STEP ARTISAN JOURNEY)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-pizza-red dark:text-pizza-gold">
            Effortless Perfection
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-pizza-textLight dark:text-pizza-headDark tracking-tight">
            How The Universe Works
          </h2>
          <p className="text-sm text-pizza-mutedLight dark:text-pizza-mutedDark">
            From our artisan stone hearth directly to your dining table in 3 simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-[#FFF3DC] dark:bg-[#15100F] p-8 rounded-3xl border border-[#EAD5C5] dark:border-[#2A1A18] shadow-sm hover:shadow-xl transition-all space-y-4 text-center group">
            <div className="w-16 h-16 rounded-2xl bg-[#FFE4C4] dark:bg-pizza-burgundy/40 text-pizza-red dark:text-pizza-gold flex items-center justify-center mx-auto text-2xl group-hover:scale-110 transition-transform">
              🍕
            </div>
            <h3 className="text-lg font-black text-pizza-textLight dark:text-pizza-headDark">1. Select or Build</h3>
            <p className="text-xs text-pizza-mutedLight dark:text-pizza-mutedDark leading-relaxed">
              Choose from signature handcrafted collections or build your master creation with custom bases, sauces, and toppings.
            </p>
          </div>

          <div className="bg-[#FFE4C4] dark:bg-[#15100F] p-8 rounded-3xl border border-[#E5C3AB] dark:border-[#2A1A18] shadow-sm hover:shadow-xl transition-all space-y-4 text-center group">
            <div className="w-16 h-16 rounded-2xl bg-[#F8D4C0] dark:bg-amber-950/40 text-pizza-amber flex items-center justify-center mx-auto text-2xl group-hover:scale-110 transition-transform">
              🔥
            </div>
            <h3 className="text-lg font-black text-pizza-textLight dark:text-pizza-headDark">2. 450°C Hearth Fire</h3>
            <p className="text-xs text-pizza-mutedLight dark:text-pizza-mutedDark leading-relaxed">
              Every pie is hand-stretched and fire-baked in authentic Italian stone ovens for the signature crispy, airy crust.
            </p>
          </div>

          <div className="bg-[#F8D4C0] dark:bg-[#15100F] p-8 rounded-3xl border border-[#E4B59D] dark:border-[#2A1A18] shadow-sm hover:shadow-xl transition-all space-y-4 text-center group">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto text-2xl group-hover:scale-110 transition-transform">
              🛵
            </div>
            <h3 className="text-lg font-black text-pizza-textLight dark:text-pizza-headDark">3. Live GPS Dispatch</h3>
            <p className="text-xs text-pizza-mutedLight dark:text-pizza-mutedDark leading-relaxed">
              Follow your order in real-time with live WebSockets order tracking from our kitchen to your doorstep in 30 minutes.
            </p>
          </div>

        </div>
      </section>

      {/* =========================================================================
          4. CALL TO ACTION BANNER (CUSTOM BUILDER PROMO)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-pizza-burgundy via-pizza-deepWine to-[#1F040A] text-white p-8 sm:p-14 shadow-2xl border border-pizza-amber/30">
          <div className="relative z-10 max-w-xl space-y-6">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-pizza-gold text-pizza-dark inline-block">
              Interactive Masterpiece
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Become The Master Chef of Your Pizza.
            </h2>
            <p className="text-sm sm:text-base text-stone-200 leading-relaxed font-normal">
              Pick your artisan base crust, lather custom herb sauces, layer gourmet cheeses, and top with farm-fresh vegetables in our interactive builder.
            </p>
            <div className="pt-2">
              <Link
                to="/build-pizza"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-extrabold text-pizza-dark bg-pizza-gold hover:bg-yellow-300 shadow-xl shadow-amber-900/40 hover:scale-105 active:scale-95 transition-all"
              >
                <Sparkles size={18} />
                <span>Launch Pizza Builder</span>
              </Link>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-20 lg:opacity-30 pointer-events-none flex items-center justify-center">
            <span className="text-[180px] select-none">🍕</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. HOW IT WORKS TIMELINE
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-pizza-red dark:text-pizza-gold">
            Seamless Ordering Flow
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-pizza-textLight dark:text-pizza-headDark tracking-tight">
            How PizzaHub Works
          </h2>
          <p className="text-sm text-pizza-mutedLight dark:text-pizza-mutedDark">
            From the initial oven fire to your doorstep in 4 simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          
          {[
            { step: '01', title: 'Choose Your Pizza', desc: 'Browse our specialty chef recipes or launch the custom builder.', icon: '🍕', bgClass: 'bg-[#FFF3DC] border-[#EAD5C5]' },
            { step: '02', title: 'Customize & Add', desc: 'Fine-tune ingredients, extra toppings, and review dynamic live pricing.', icon: '✨', bgClass: 'bg-[#FFE4C4] border-[#E5C3AB]' },
            { step: '03', title: 'Secure Payment', desc: 'Instant checkout with Razorpay test mode & transaction safety.', icon: '💳', bgClass: 'bg-[#F8D4C0] border-[#E4B59D]' },
            { step: '04', title: 'Live Order Tracking', desc: 'Watch your pizza bake and travel in real-time via WebSockets.', icon: '🛵', bgClass: 'bg-[#FFF0C2] border-[#EED39A]' },
          ].map((item, i) => (
            <div
              key={item.step}
              className={`${item.bgClass} dark:bg-[#15100F] dark:border-[#2A1A18] p-6 rounded-3xl border shadow-sm relative space-y-4`}
            >
              <div className="flex justify-between items-start">
                <span className="text-3xl">{item.icon}</span>
                <span className="text-2xl font-black text-pizza-burgundy/20 dark:text-pizza-gold/20">
                  {item.step}
                </span>
              </div>
              <h3 className="text-base font-black text-pizza-textLight dark:text-pizza-headDark">{item.title}</h3>
              <p className="text-xs text-pizza-mutedLight dark:text-pizza-mutedDark leading-relaxed">{item.desc}</p>
            </div>
          ))}

        </div>
      </section>

      {/* =========================================================================
          6. FINAL CALL TO ACTION
          ========================================================================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-10 sm:p-16 rounded-3xl bg-gradient-to-b from-[#FFF3DC] to-[#FFE4C4] dark:from-[#15100F] dark:to-[#0B0B0B] border border-[#EAD5C5] dark:border-[#4A0E17]/60 shadow-xl space-y-6">
          <span className="text-4xl">🍕</span>
          <h2 className="text-3xl sm:text-5xl font-black text-pizza-textLight dark:text-pizza-headDark tracking-tight">
            Your Perfect Pizza Is Waiting.
          </h2>
          <p className="text-sm sm:text-base text-pizza-mutedLight dark:text-pizza-mutedDark max-w-lg mx-auto">
            Hot, fresh, and delivered with passion. Place your order now or build a custom masterpiece in seconds.
          </p>
          <div className="pt-2">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-base font-extrabold text-white bg-pizza-red hover:bg-pizza-darkRed shadow-xl shadow-red-500/30 hover:scale-105 transition-all"
            >
              <span>Order Now 🍕</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
