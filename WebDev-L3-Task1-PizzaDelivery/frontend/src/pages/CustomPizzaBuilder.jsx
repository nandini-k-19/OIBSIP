import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { DEFAULT_CUSTOM_OPTIONS } from '../data/defaultCatalog';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  ChefHat, 
  Sparkles, 
  AlertCircle,
  ShoppingBag,
  Flame
} from 'lucide-react';

const STEPS = [
  { id: 1, name: 'Crust Base', desc: '5 Handcrafted doughs' },
  { id: 2, name: 'Sauce', desc: 'Italian simmered sauces' },
  { id: 3, name: 'Cheese', desc: 'Molten artisan cheeses' },
  { id: 4, name: 'Toppings', desc: 'Farm-fresh garden veggies' },
  { id: 5, name: 'Review', desc: 'Confirm & Add to Cart' },
];

export default function CustomPizzaBuilder() {
  const [currentStep, setCurrentStep] = useState(1);
  const [options, setOptions] = useState(DEFAULT_CUSTOM_OPTIONS);
  const [loading, setLoading] = useState(false);

  // Selections
  const [selectedBase, setSelectedBase] = useState(DEFAULT_CUSTOM_OPTIONS.bases[0]);
  const [selectedSauce, setSelectedSauce] = useState(DEFAULT_CUSTOM_OPTIONS.sauces[0]);
  const [selectedCheese, setSelectedCheese] = useState(DEFAULT_CUSTOM_OPTIONS.cheeses[0]);
  const [selectedVegetables, setSelectedVegetables] = useState([]);

  const { addCustomPizza } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await api.get('/pizzas/custom-options');
        if (res.data && res.data.bases?.length > 0) {
          setOptions(res.data);
          setSelectedBase(res.data.bases[0]);
          setSelectedSauce(res.data.sauces[0]);
          setSelectedCheese(res.data.cheeses[0]);
        }
      } catch (err) {
        console.warn('Backend custom options connection notice, using catalog default', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, []);

  const toggleVegetable = (veg) => {
    if (selectedVegetables.some((v) => v.id === veg.id)) {
      setSelectedVegetables(selectedVegetables.filter((v) => v.id !== veg.id));
    } else {
      setSelectedVegetables([...selectedVegetables, veg]);
    }
  };

  // Dynamic Price Calculation
  const basePrice = selectedBase?.price || 0;
  const saucePrice = selectedSauce?.price || 0;
  const cheesePrice = selectedCheese?.price || 0;
  const veggiesPrice = selectedVegetables.reduce((sum, v) => sum + v.price, 0);
  const totalPrice = basePrice + saucePrice + cheesePrice + veggiesPrice;

  const handleFinishAndAddToCart = () => {
    if (!selectedBase || !selectedSauce || !selectedCheese) {
      alert('Please select a base, sauce, and cheese before adding to cart.');
      return;
    }

    const customPizzaData = {
      pizza_name: `Custom ${selectedBase.name} (${selectedSauce.name})`,
      unit_price: totalPrice,
      quantity: 1,
      customization: {
        base_id: selectedBase.id,
        sauce_id: selectedSauce.id,
        cheese_id: selectedCheese.id,
        vegetable_ids: selectedVegetables.map((v) => v.id),
      },
      custom_details: {
        base_name: selectedBase.name,
        sauce_name: selectedSauce.name,
        cheese_name: selectedCheese.name,
        vegetable_names: selectedVegetables.map((v) => v.name),
      },
    };

    addCustomPizza(customPizzaData);
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pizza-red border-t-transparent"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Loading freshly prepared ingredients...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 transition-colors duration-300">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-pizza-darkRed dark:text-pizza-red text-xs font-bold uppercase tracking-wider border border-red-200 dark:border-red-900">
          <ChefHat size={14} /> Artisanal Customizer
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-pizza-textLight dark:text-pizza-headDark tracking-tight">
          Build Your Custom Masterpiece
        </h1>
        <p className="text-pizza-mutedLight dark:text-pizza-mutedDark text-sm">
          Follow the 5 simple steps to tailor crust, sauce, cheese, and garden toppings to your exact taste.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-[#FFF3DC] dark:bg-[#15100F] p-4 sm:p-6 rounded-3xl border border-[#EAD5C5] dark:border-[#2A1A18] shadow-sm">
        <div className="grid grid-cols-5 gap-2 sm:gap-4 relative">
          {STEPS.map((step) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;

            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex flex-col items-center text-center p-2 rounded-2xl transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#FFE4C4] dark:bg-[#201412] text-pizza-red dark:text-pizza-gold'
                    : isCompleted
                    ? 'text-pizza-textLight dark:text-pizza-secondaryDark hover:bg-[#FFE4C4]/60 dark:hover:bg-[#1C1412]'
                    : 'text-pizza-mutedLight dark:text-pizza-mutedDark opacity-60'
                }`}
              >
                <div
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-extrabold text-sm mb-1.5 transition-all ${
                    isCurrent
                      ? 'bg-pizza-red text-white shadow-md shadow-red-200 dark:shadow-red-950/60 scale-105'
                      : isCompleted
                      ? 'bg-green-600 text-white'
                      : 'bg-[#FFE4C4] dark:bg-[#181313] text-pizza-mutedLight dark:text-pizza-mutedDark border border-[#E5C3AB] dark:border-[#2A1A18]'
                  }`}
                >
                  {isCompleted ? <Check size={18} /> : step.id}
                </div>
                <span className="text-xs font-bold truncate max-w-full">{step.name}</span>
                <span className="text-[10px] text-pizza-mutedLight dark:text-pizza-mutedDark hidden sm:block truncate max-w-full">
                  {step.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Interactive Selection Area */}
        <div className="lg:col-span-8 bg-[#FFF3DC] dark:bg-[#15100F] p-6 sm:p-8 rounded-3xl border border-[#EAD5C5] dark:border-[#2A1A18] shadow-sm space-y-6">
          
          {/* STEP 1: BASES */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-pizza-textLight dark:text-pizza-headDark">Step 1: Choose Your Crust Base</h2>
                <p className="text-sm text-pizza-mutedLight dark:text-pizza-mutedDark">Pick from our 5 stone-baked specialty crusts.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {options.bases.map((base) => {
                  const isSelected = selectedBase?.id === base.id;
                  const isOutOfStock = base.stock <= 0;

                  return (
                    <button
                      key={base.id}
                      disabled={isOutOfStock}
                      onClick={() => setSelectedBase(base)}
                      className={`p-5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-pizza-red bg-[#FFE4C4] dark:bg-pizza-burgundy/40 shadow-sm ring-2 ring-pizza-red/30'
                          : 'border-[#E5C3AB] dark:border-[#2A1A18] hover:border-pizza-red/40 bg-[#FAF5EE] dark:bg-[#181313]'
                      } ${isOutOfStock ? 'opacity-40 cursor-not-allowed bg-stone-100 dark:bg-gray-800' : ''}`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-base text-pizza-textLight dark:text-pizza-headDark">{base.name}</span>
                          <span className="font-extrabold text-pizza-red dark:text-pizza-gold text-sm">₹{base.price}</span>
                        </div>
                        <p className="text-xs text-pizza-mutedLight dark:text-pizza-mutedDark mt-1.5 leading-relaxed">{base.description}</p>
                      </div>

                      <div className="mt-4 flex items-center justify-between pt-2 border-t border-[#EAD5C5] dark:border-[#2A1A18]">
                        <span className={`text-[11px] font-bold ${isOutOfStock ? 'text-red-500' : 'text-green-600 dark:text-[#8FE3B0]'}`}>
                          {isOutOfStock ? 'Out of Stock' : `✓ Stock: ${base.stock}`}
                        </span>
                        {isSelected && <span className="text-xs font-bold text-pizza-red dark:text-pizza-gold">Selected ✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: SAUCES */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-pizza-textLight dark:text-pizza-headDark">Step 2: Choose Your Sauce</h2>
                <p className="text-sm text-pizza-mutedLight dark:text-pizza-mutedDark">Slow-simmered artisanal Italian sauces (5 choices).</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {options.sauces.map((sauce) => {
                  const isSelected = selectedSauce?.id === sauce.id;
                  const isOutOfStock = sauce.stock <= 0;

                  return (
                    <button
                      key={sauce.id}
                      disabled={isOutOfStock}
                      onClick={() => setSelectedSauce(sauce)}
                      className={`p-5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-pizza-red bg-[#FFE4C4] dark:bg-pizza-burgundy/40 shadow-sm ring-2 ring-pizza-red/30'
                          : 'border-[#E5C3AB] dark:border-[#2A1A18] hover:border-pizza-red/40 bg-[#FAF5EE] dark:bg-[#181313]'
                      } ${isOutOfStock ? 'opacity-40 cursor-not-allowed bg-stone-100 dark:bg-gray-800' : ''}`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-base text-pizza-textLight dark:text-pizza-headDark">{sauce.name}</span>
                          <span className="font-extrabold text-pizza-red dark:text-pizza-gold text-sm">₹{sauce.price}</span>
                        </div>
                        <p className="text-xs text-pizza-mutedLight dark:text-pizza-mutedDark mt-1.5 leading-relaxed">{sauce.description}</p>
                      </div>

                      <div className="mt-4 flex items-center justify-between pt-2 border-t border-[#EAD5C5] dark:border-[#2A1A18]">
                        <span className={`text-[11px] font-bold ${isOutOfStock ? 'text-red-500' : 'text-green-600 dark:text-[#8FE3B0]'}`}>
                          {isOutOfStock ? 'Out of Stock' : `✓ Stock: ${sauce.stock}`}
                        </span>
                        {isSelected && <span className="text-xs font-bold text-pizza-red dark:text-pizza-gold">Selected ✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: CHEESES */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-pizza-textLight dark:text-pizza-headDark">Step 3: Choose Your Cheese</h2>
                <p className="text-sm text-pizza-mutedLight dark:text-pizza-mutedDark">Molten, golden, shredded or blended gourmet cheeses (5 choices).</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {options.cheeses.map((cheese) => {
                  const isSelected = selectedCheese?.id === cheese.id;
                  const isOutOfStock = cheese.stock <= 0;

                  return (
                    <button
                      key={cheese.id}
                      disabled={isOutOfStock}
                      onClick={() => setSelectedCheese(cheese)}
                      className={`p-5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-pizza-red bg-[#FFE4C4] dark:bg-pizza-burgundy/40 shadow-sm ring-2 ring-pizza-red/30'
                          : 'border-[#E5C3AB] dark:border-[#2A1A18] hover:border-pizza-red/40 bg-[#FAF5EE] dark:bg-[#181313]'
                      } ${isOutOfStock ? 'opacity-40 cursor-not-allowed bg-stone-100 dark:bg-gray-800' : ''}`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-base text-pizza-textLight dark:text-pizza-headDark">{cheese.name}</span>
                          <span className="font-extrabold text-pizza-red dark:text-pizza-gold text-sm">₹{cheese.price}</span>
                        </div>
                        <p className="text-xs text-pizza-mutedLight dark:text-pizza-mutedDark mt-1.5 leading-relaxed">{cheese.description}</p>
                      </div>

                      <div className="mt-4 flex items-center justify-between pt-2 border-t border-[#EAD5C5] dark:border-[#2A1A18]">
                        <span className={`text-[11px] font-bold ${isOutOfStock ? 'text-red-500' : 'text-green-600 dark:text-[#8FE3B0]'}`}>
                          {isOutOfStock ? 'Out of Stock' : `✓ Stock: ${cheese.stock}`}
                        </span>
                        {isSelected && <span className="text-xs font-bold text-pizza-red dark:text-pizza-gold">Selected ✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: VEGETABLES (MULTI-SELECT) */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-pizza-textLight dark:text-pizza-headDark">Step 4: Select Veggies (Multi-Select)</h2>
                <p className="text-sm text-pizza-mutedLight dark:text-pizza-mutedDark">Pick any number of farm-fresh crispy toppings.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {options.vegetables.map((veg) => {
                  const isSelected = selectedVegetables.some((v) => v.id === veg.id);
                  const isOutOfStock = veg.stock <= 0;

                  return (
                    <button
                      key={veg.id}
                      disabled={isOutOfStock}
                      onClick={() => toggleVegetable(veg)}
                      className={`p-4 rounded-2xl border-2 text-center transition-all relative flex flex-col items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border-green-600 bg-emerald-100 dark:bg-emerald-950/40 shadow-sm ring-2 ring-green-600/20'
                          : 'border-[#E5C3AB] dark:border-[#2A1A18] hover:border-emerald-500/40 bg-[#FAF5EE] dark:bg-[#181313]'
                      } ${isOutOfStock ? 'opacity-40 cursor-not-allowed bg-stone-100 dark:bg-gray-800' : ''}`}
                    >
                      <div className="w-full">
                        <span className="block font-bold text-xs sm:text-sm text-pizza-textLight dark:text-pizza-headDark truncate">
                          {veg.name}
                        </span>
                        <span className="block font-extrabold text-green-700 dark:text-[#8FE3B0] text-xs mt-1">
                          +₹{veg.price}
                        </span>
                      </div>

                      <div className="mt-3">
                        {isSelected ? (
                          <span className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">
                            ✓
                          </span>
                        ) : (
                          <span className="w-6 h-6 rounded-full border border-[#E5C3AB] dark:border-[#2A1A18] text-pizza-mutedLight dark:text-pizza-mutedDark flex items-center justify-center text-xs">
                            +
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & SUMMARY */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-pizza-textLight dark:text-pizza-headDark">Step 5: Review Custom Creation</h2>
                <p className="text-sm text-pizza-mutedLight dark:text-pizza-mutedDark">Verify your ingredients and add your pizza to the cart.</p>
              </div>

              <div className="bg-[#FFE4C4] dark:bg-[#181313] p-6 rounded-2xl border border-[#E5C3AB] dark:border-[#2A1A18] space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-[#EAD5C5] dark:border-[#2A1A18]">
                  <span className="text-sm text-pizza-textLight dark:text-pizza-secondaryDark font-medium">1. Dough Base</span>
                  <span className="text-sm font-bold text-pizza-textLight dark:text-pizza-headDark">{selectedBase?.name} (₹{basePrice})</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#EAD5C5] dark:border-[#2A1A18]">
                  <span className="text-sm text-pizza-textLight dark:text-pizza-secondaryDark font-medium">2. Sauce</span>
                  <span className="text-sm font-bold text-pizza-textLight dark:text-pizza-headDark">{selectedSauce?.name} (₹{saucePrice})</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#EAD5C5] dark:border-[#2A1A18]">
                  <span className="text-sm text-pizza-textLight dark:text-pizza-secondaryDark font-medium">3. Cheese</span>
                  <span className="text-sm font-bold text-pizza-textLight dark:text-pizza-headDark">{selectedCheese?.name} (₹{cheesePrice})</span>
                </div>
                <div className="py-2 border-b border-[#EAD5C5] dark:border-[#2A1A18] space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-pizza-textLight dark:text-pizza-secondaryDark font-medium">4. Toppings ({selectedVegetables.length})</span>
                    <span className="text-sm font-bold text-pizza-textLight dark:text-pizza-headDark">₹{veggiesPrice}</span>
                  </div>
                  {selectedVegetables.length > 0 ? (
                    <p className="text-xs text-green-700 dark:text-[#8FE3B0] font-medium">
                      {selectedVegetables.map((v) => v.name).join(', ')}
                    </p>
                  ) : (
                    <p className="text-xs text-pizza-mutedLight dark:text-pizza-mutedDark italic">No extra toppings selected</p>
                  )}
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-base font-extrabold text-pizza-textLight dark:text-pizza-headDark">Total Custom Pizza Price</span>
                  <span className="text-2xl font-black text-pizza-red dark:text-pizza-gold">₹{totalPrice}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-6 border-t border-[#EAD5C5] dark:border-[#2A1A18]">
            <button
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold text-pizza-textLight dark:text-pizza-secondaryDark bg-[#FFE4C4] dark:bg-[#181313] hover:bg-[#F8D4C0] dark:hover:bg-[#201816] border border-[#E5C3AB] dark:border-[#2A1A18] transition-colors ${
                currentStep === 1 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <ChevronLeft size={18} /> Previous Step
            </button>

            {currentStep < 5 ? (
              <button
                onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-pizza-red hover:bg-pizza-darkRed shadow-md shadow-red-200 dark:shadow-red-950/60 transition-all cursor-pointer"
              >
                Next Step <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleFinishAndAddToCart}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl text-base font-extrabold text-white bg-green-600 hover:bg-green-700 shadow-xl shadow-green-200 dark:shadow-green-950/60 transition-all hover:scale-105 cursor-pointer"
              >
                <ShoppingBag size={18} /> Add to Cart (₹{totalPrice})
              </button>
            )}
          </div>

        </div>

        {/* Right Dynamic Live Receipt / Preview Card */}
        <div className="lg:col-span-4 bg-[#2B1810] dark:bg-[#15100F] text-white p-6 sm:p-7 rounded-3xl shadow-xl space-y-6 sticky top-28 border border-[#4A2617] dark:border-[#4A0E17]/60">
          <div className="flex items-center justify-between pb-4 border-b border-[#4A2617] dark:border-[#2A1A18]">
            <span className="text-xs font-extrabold uppercase tracking-wider text-pizza-gold">Live Calculator</span>
            <span className="text-xs text-stone-300 dark:text-pizza-mutedDark">Step {currentStep}/5</span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-stone-300 dark:text-pizza-mutedDark">Base:</span>
              <span className="font-bold text-white truncate max-w-[150px]">{selectedBase?.name || '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-300 dark:text-pizza-mutedDark">Sauce:</span>
              <span className="font-bold text-white truncate max-w-[150px]">{selectedSauce?.name || '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-300 dark:text-pizza-mutedDark">Cheese:</span>
              <span className="font-bold text-white truncate max-w-[150px]">{selectedCheese?.name || '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-300 dark:text-pizza-mutedDark">Toppings:</span>
              <span className="font-bold text-white">{selectedVegetables.length} selected</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#4A2617] dark:border-[#2A1A18] flex justify-between items-baseline">
            <span className="text-xs font-bold text-stone-300 dark:text-pizza-mutedDark uppercase">Subtotal</span>
            <span className="text-3xl font-black text-pizza-gold">₹{totalPrice}</span>
          </div>

          <p className="text-[11px] text-stone-300 dark:text-pizza-mutedDark leading-relaxed">
            * 5% GST and standard delivery calculated during checkout. Guaranteed fresh & hot.
          </p>
        </div>

      </div>

    </div>
  );
}
