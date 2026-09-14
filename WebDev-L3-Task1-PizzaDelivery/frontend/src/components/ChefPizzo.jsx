import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  Flame, 
  ShoppingBag, 
  ArrowRight,
  Bot,
  MessageSquare,
  RefreshCw
} from 'lucide-react';

export default function ChefPizzo({ pizzas = [] }) {
  const { addStandardPizza } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [pizzoMessage, setPizzoMessage] = useState("Hi! I'm Chef Pizzo 👨‍🍳 What kind of pizza are you craving today?");
  const [recommendedPizzas, setRecommendedPizzas] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceDenied, setVoiceDenied] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [addedToast, setAddedToast] = useState(null);

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);

  // Intent categories
  const categories = [
    { id: 'spicy', label: '🔥 Spicy', keywords: ['spicy', 'hot', 'diablo', 'fire', 'chilli', 'jalapeno', 'pepper'] },
    { id: 'cheese', label: '🧀 Extra Cheese', keywords: ['cheese', 'cheesy', 'margherita', 'four cheese', 'mozzarella', 'burst', 'melt'] },
    { id: 'veggie', label: '🍄 Veggie Garden', keywords: ['veggie', 'vegetable', 'mushroom', 'farmhouse', 'corn', 'spinach', 'garden', 'onion', 'capsicum'] },
    { id: 'fresh', label: '🌿 Fresh & Light', keywords: ['fresh', 'light', 'pesto', 'herb', 'basil', 'tomato', 'olive', 'classic'] },
    { id: 'premium', label: '👑 Premium', keywords: ['premium', 'truffle', 'royal', 'gold', 'signature', 'special', 'deluxe', 'supreme'] }
  ];

  // Feature detection for Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setVoiceSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceDenied(false);
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);

        // Reset silence timer
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          recognition.stop();
        }, 1800);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setVoiceDenied(true);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Process transcript once recognition ends
  useEffect(() => {
    if (!isListening && transcript.trim().length > 0) {
      handleQueryText(transcript);
      setTranscript('');
    }
  }, [isListening]);

  // Voice Speech Synthesis reply
  const speakReply = (text) => {
    if (voiceMuted || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.15; // Friendly upbeat chef pitch
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis failed:', e);
    }
  };

  // Match pizza recommendations from query text or category tag
  const handleQueryText = (query) => {
    const cleanQuery = query.toLowerCase();
    let matchedTag = null;

    // Check category keywords
    for (const cat of categories) {
      if (cat.keywords.some(k => cleanQuery.includes(k))) {
        matchedTag = cat;
        break;
      }
    }

    if (matchedTag) {
      applyRecommendation(matchedTag);
    } else {
      // Look for direct pizza name match in pizzas list
      const directMatch = pizzas.filter(p => cleanQuery.includes(p.name.toLowerCase()));
      if (directMatch.length > 0) {
        setRecommendedPizzas(directMatch);
        const reply = `Delicioso! Here is our authentic ${directMatch[0].name}.`;
        setPizzoMessage(reply);
        speakReply(reply);
      } else {
        const fallbackReply = "Could you say that again? Try asking for spicy, cheesy, veggie, light, or premium pizzas!";
        setPizzoMessage(fallbackReply);
        speakReply(fallbackReply);
      }
    }
  };

  const applyRecommendation = (category) => {
    setSelectedTag(category.id);
    let matched = [];

    if (pizzas.length > 0) {
      matched = pizzas.filter(p => {
        const text = `${p.name} ${p.description || ''} ${p.category || ''}`.toLowerCase();
        return category.keywords.some(k => text.includes(k));
      });
    }

    // Fallback if no exact keyword match in available pizzas
    if (matched.length === 0 && pizzas.length > 0) {
      matched = pizzas.slice(0, 2);
    }

    setRecommendedPizzas(matched.slice(0, 3));
    
    let reply = "";
    if (category.id === 'spicy') {
      reply = "Excellent choice! Try our fiery spicy creations with zesty peppers and artisanal hot sauce 🔥🍕";
    } else if (category.id === 'cheese') {
      reply = "A cheese lover! Here are our rich mozzarella and golden parmesan pizzas 🧀✨";
    } else if (category.id === 'veggie') {
      reply = "Fresh from the garden! Handpicked Tuscan mushrooms, baby spinach, and crisp veggies 🍄🌿";
    } else if (category.id === 'fresh') {
      reply = "Light and aromatic! Fresh Italian basil, plum tomatoes, and cold-pressed olive oil 🌿🍕";
    } else {
      reply = "Royalty treatment! Indulge in our artisan truffle and gourmet signature selection 👑✨";
    }

    setPizzoMessage(reply);
    speakReply(reply);
  };

  const toggleMic = () => {
    if (!voiceSupported) return;
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsOpen(true);
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.warn('Recognition start issue:', e);
      }
    }
  };

  const handleAddToCart = (pizza) => {
    addStandardPizza(pizza, 1);
    setAddedToast(`Added ${pizza.name} to cart!`);
    setTimeout(() => setAddedToast(null), 2500);
  };

  return (
    <>
      {/* =========================================================================
          FLOATING 3D-TOY CHEF PIZZO CHARACTER (Hero / Global Assistant)
          ========================================================================= */}
      <div className="relative inline-block select-none">
        
        {/* Floating Ambient Halo */}
        <div className={`absolute -inset-2 rounded-3xl blur-lg opacity-60 transition-all duration-500 ${
          isListening 
            ? 'bg-gradient-to-r from-pizza-red via-pizza-orange to-pizza-amber animate-ping' 
            : 'bg-gradient-to-r from-pizza-red/40 via-pizza-orange/30 to-pizza-gold/30 group-hover:opacity-100'
        }`} />

        {/* Robot Chef Character Button */}
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="relative group cursor-pointer p-3 sm:p-4 rounded-3xl bg-[#FFF3DC] dark:bg-[#15100F] border-2 border-[#EAD5C5] dark:border-[#4A0E17] shadow-xl hover:shadow-2xl hover:scale-[1.03] active:scale-95 transition-all duration-300 flex items-center gap-3.5 backdrop-blur-md"
          role="button"
          aria-label="Talk to Chef Pizzo AI Assistant"
        >
          {/* Animated 3D Chef Robot Avatar */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#1C1C1C] via-[#2A080D] to-[#4A0E17] flex items-center justify-center shadow-inner overflow-hidden border border-pizza-gold/60">
            
            {/* Chef Hat */}
            <div className="absolute top-1 text-base sm:text-lg animate-bounce duration-1000">
              👨‍🍳
            </div>

            {/* Glowing Robot Eyes */}
            <div className="mt-3 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full shadow-sm transition-all duration-300 ${
                isListening ? 'bg-pizza-gold animate-pulse scale-125' : 'bg-cyan-400 group-hover:bg-pizza-gold'
              }`} />
              <span className={`w-2.5 h-2.5 rounded-full shadow-sm transition-all duration-300 ${
                isListening ? 'bg-pizza-gold animate-pulse scale-125' : 'bg-cyan-400 group-hover:bg-pizza-gold'
              }`} />
            </div>

            {/* Pizza Peel Badge */}
            <div className="absolute -bottom-1 right-1 text-xs">🍕</div>

            {/* Listening Waveform Overlay */}
            {isListening && (
              <div className="absolute inset-0 bg-pizza-burgundy/80 flex items-center justify-center gap-0.5">
                <span className="w-1 bg-pizza-gold rounded-full animate-wave-1" />
                <span className="w-1 bg-pizza-gold rounded-full animate-wave-2" />
                <span className="w-1 bg-pizza-gold rounded-full animate-wave-3" />
                <span className="w-1 bg-pizza-gold rounded-full animate-wave-4" />
                <span className="w-1 bg-pizza-gold rounded-full animate-wave-5" />
              </div>
            )}
          </div>

          {/* Character Label & Status */}
          <div className="text-left hidden sm:block pr-2">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-pizza-textLight dark:text-pizza-headDark">Chef Pizzo</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-pizza-red/15 dark:bg-pizza-red/40 text-pizza-red dark:text-pizza-gold uppercase tracking-wider border border-pizza-red/30">AI ASSISTANT</span>
            </div>
            <p className="text-[11px] font-semibold text-pizza-mutedLight dark:text-pizza-mutedDark">
              {isListening ? "Listening live..." : "Tap or Talk 🎙️ (Voice AI)"}
            </p>
          </div>

          {/* Mic Quick Trigger */}
          {voiceSupported && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMic();
              }}
              className={`p-2.5 rounded-2xl transition-all ${
                isListening 
                  ? 'bg-pizza-red text-white shadow-lg shadow-red-500/50 animate-pulse' 
                  : 'bg-[#FFE4C4] dark:bg-[#1C1412] text-pizza-textLight dark:text-pizza-textDark hover:text-pizza-red dark:hover:text-pizza-gold border border-[#E5C3AB] dark:border-[#2A1A18]'
              }`}
              title={isListening ? "Stop Listening" : "Talk to Chef Pizzo"}
            >
              <Mic size={18} className={isListening ? "animate-bounce" : ""} />
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          CHEF PIZZO INTERACTIVE ASSISTANT MODAL PANEL
          ========================================================================= */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="w-full max-w-xl bg-[#FFF3DC] dark:bg-[#15100F] rounded-3xl shadow-2xl border-2 border-[#EAD5C5] dark:border-[#4A0E17] overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-pizza-burgundy via-pizza-deepWine to-[#1F040A] text-white flex items-center justify-between border-b border-pizza-amber/30">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-2xl shadow-inner">
                  👨‍🍳
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">Chef Pizzo AI</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-pizza-gold text-pizza-dark uppercase">
                      Voice & Tap Sommelier
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 font-medium">Your personal pizza expert</p>
                </div>
              </div>

              {/* Action Buttons: Mute Voice & Close */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVoiceMuted(!voiceMuted)}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white transition-colors"
                  title={voiceMuted ? "Unmute Voice" : "Mute Voice"}
                >
                  {voiceMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white transition-colors"
                  title="Close Assistant"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Chat Bubble Dialogue */}
            <div className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              
              {/* Chef Speech Bubble */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-pizza-red text-white flex items-center justify-center text-base font-bold shrink-0 shadow-md">
                  🍕
                </div>
                <div className="p-4 rounded-2xl rounded-tl-sm bg-[#FFE4C4] dark:bg-[#181313] border border-[#E5C3AB] dark:border-[#2A1A18] text-pizza-textLight dark:text-pizza-textDark text-sm font-medium leading-relaxed shadow-sm">
                  {pizzoMessage}
                </div>
              </div>

              {/* Live Voice Transcript or Listening State */}
              {isListening && (
                <div className="p-3.5 rounded-2xl bg-pizza-burgundy/15 dark:bg-pizza-burgundy/40 border border-pizza-red/40 flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-4 bg-pizza-red rounded-full animate-wave-1" />
                      <span className="w-1.5 h-6 bg-pizza-orange rounded-full animate-wave-2" />
                      <span className="w-1.5 h-3 bg-pizza-gold rounded-full animate-wave-3" />
                    </div>
                    <span className="text-xs font-bold text-pizza-red dark:text-pizza-gold">
                      {transcript || "Listening... speak naturally (e.g. 'I want something spicy')"}
                    </span>
                  </div>
                  <button
                    onClick={() => recognitionRef.current?.stop()}
                    className="text-xs font-extrabold px-3 py-1 rounded-lg bg-pizza-red text-white hover:bg-pizza-darkRed transition-colors"
                  >
                    Done
                  </button>
                </div>
              )}

              {/* Voice Denied Notice */}
              {voiceDenied && (
                <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-900 dark:text-amber-300 text-xs font-semibold">
                  🎙️ Microphone permission was denied. You can still tap any crave option below!
                </div>
              )}

              {/* Crave Category Tags (Tap Path) */}
              <div>
                <p className="text-xs font-bold text-pizza-mutedLight dark:text-pizza-mutedDark mb-2.5 uppercase tracking-wider">
                  What are you craving today?
                </p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => applyRecommendation(cat)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                        selectedTag === cat.id
                          ? 'bg-pizza-red text-white shadow-lg shadow-red-500/30 scale-105'
                          : 'bg-[#FFE4C4] dark:bg-[#181313] text-pizza-textLight dark:text-pizza-textDark hover:bg-[#F8D4C0] dark:hover:bg-[#201A18] border border-[#E5C3AB] dark:border-[#2A1A18]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pizza Recommendations Result List */}
              {recommendedPizzas.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-pizza-mutedLight dark:text-pizza-mutedDark uppercase tracking-wider">
                      Chef Pizzo's Handcrafted Picks:
                    </p>
                    <span className="text-[11px] font-bold text-pizza-red dark:text-pizza-gold">
                      {recommendedPizzas.length} ready to bake
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {recommendedPizzas.map((pizza) => (
                      <div 
                        key={pizza.id}
                        className="p-3 rounded-2xl bg-[#FFE4C4] dark:bg-[#181313] border border-[#E5C3AB] dark:border-[#2A1A18] flex items-center justify-between gap-3 hover:border-pizza-red/60 transition-all group"
                      >
                        {/* Pizza Thumbnail & Info */}
                        <div className="flex items-center gap-3 min-w-0">
                          <img 
                            src={pizza.image_url || "/cinematic_pizza_hero.jpg"} 
                            alt={pizza.name}
                            className="w-14 h-14 rounded-xl object-cover border border-[#EAD5C5] dark:border-[#4A0E17] group-hover:scale-105 transition-transform"
                            onError={(e) => { e.target.src = "/cinematic_pizza_hero.jpg"; }}
                          />
                          <div className="min-w-0">
                            <h4 className="text-sm font-extrabold text-pizza-textLight dark:text-pizza-headDark truncate">
                              {pizza.name}
                            </h4>
                            <p className="text-xs text-pizza-mutedLight dark:text-pizza-mutedDark truncate">
                              {pizza.description || "Authentic stone-oven baked"}
                            </p>
                            <span className="text-xs font-black text-pizza-red dark:text-pizza-gold">
                              ₹{pizza.base_price || pizza.price || 399}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleAddToCart(pizza)}
                            className="px-3.5 py-2 rounded-xl text-xs font-black bg-pizza-red text-white hover:bg-pizza-darkRed shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <ShoppingBag size={13} />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Footer Bar with Voice Trigger & Menu Redirect */}
            <div className="p-4 bg-[#FFE4C4]/60 dark:bg-[#0B0B0B] border-t border-[#EAD5C5] dark:border-[#2A1A18] flex items-center justify-between gap-3">
              {voiceSupported ? (
                <button
                  onClick={toggleMic}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isListening 
                      ? 'bg-pizza-red text-white shadow-lg animate-pulse' 
                      : 'bg-[#FFF3DC] dark:bg-[#181313] text-pizza-textLight dark:text-pizza-textDark hover:bg-[#F8D4C0] dark:hover:bg-[#201A18] border border-[#EAD5C5] dark:border-[#2A1A18]'
                  }`}
                >
                  <Mic size={14} className={isListening ? "animate-bounce" : ""} />
                  <span>{isListening ? "Listening... (Tap to stop)" : "Speak to Chef Pizzo"}</span>
                </button>
              ) : (
                <span className="text-[11px] text-pizza-mutedLight dark:text-pizza-mutedDark font-medium">Tap any tag above for instant recommendations</span>
              )}

              <Link
                to="/menu"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-pizza-red dark:text-pizza-gold hover:underline"
              >
                <span>Full Menu</span>
                <ArrowRight size={13} />
              </Link>
            </div>

          </div>
        </div>
      )}

      {/* Added Toast */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-pizza-burgundy text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-pizza-gold/40 animate-in fade-in slide-in-from-bottom-3">
          <span>🍕</span>
          <span className="text-xs font-bold">{addedToast}</span>
        </div>
      )}
    </>
  );
}
