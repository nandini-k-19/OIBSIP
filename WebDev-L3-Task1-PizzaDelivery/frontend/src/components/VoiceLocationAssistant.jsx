import { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Check, 
  Edit3, 
  Sparkles, 
  Loader2, 
  AlertCircle,
  Compass,
  Navigation,
  CheckCircle2
} from 'lucide-react';

export default function VoiceLocationAssistant({ onAddressSelected, initialAddress = '' }) {
  const [state, setState] = useState('IDLE'); // IDLE, LISTENING, SEARCHING, PREVIEW, CONFIRMED
  const [pizzoMessage, setPizzoMessage] = useState("Hi! I'm Chef Pizzo 👨‍🍳 I can help you set your delivery location.");
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [detectedAddress, setDetectedAddress] = useState(initialAddress);
  const [coords, setCoords] = useState(null);
  const [isManualMode, setIsManualMode] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);

  // Check Web Speech API support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        setSpeechSupported(true);
        synthesisRef.current = window.speechSynthesis;
      }
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechRecognitionSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognition.onend = () => {
          setState((prevState) => (prevState === 'LISTENING' ? 'IDLE' : prevState));
        };

        recognition.onerror = (err) => {
          console.warn('Speech recognition error:', err);
          setState('IDLE');
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Voice speech synthesis helper
  const speak = (text) => {
    if (voiceMuted || !synthesisRef.current) return;
    try {
      synthesisRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.15; // Friendly chef tone
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      synthesisRef.current.speak(utterance);
    } catch (e) {
      console.warn('Speech error:', e);
      setIsSpeaking(false);
    }
  };

  // Handle voice commands from speech recognition
  useEffect(() => {
    if (transcript) {
      const lower = transcript.toLowerCase();
      if (lower.includes('location') || lower.includes('find') || lower.includes('here') || lower.includes('gps') || lower.includes('current')) {
        handleUseLiveLocation();
        setTranscript('');
      } else if (lower.includes('manual') || lower.includes('type') || lower.includes('write')) {
        handleEnterManually();
        setTranscript('');
      } else if (lower.includes('confirm') || lower.includes('yes') || lower.includes('done') || lower.includes('okay')) {
        if (state === 'PREVIEW') {
          handleConfirmLocation();
          setTranscript('');
        }
      }
    }
  }, [transcript, state]);

  // Talk to Chef Pizzo trigger
  const handleTalkToChef = () => {
    setErrorMessage('');
    setIsManualMode(false);
    const welcome = "Sure! I can help you find your delivery location. Tap the location button when you're ready, or speak to me.";
    setPizzoMessage(welcome);
    speak(welcome);

    if (speechRecognitionSupported && recognitionRef.current) {
      try {
        setState('LISTENING');
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Recognition start error:', e);
      }
    }
  };

  // Live Location Trigger
  const handleUseLiveLocation = () => {
    setErrorMessage('');
    setIsManualMode(false);
    setState('SEARCHING');

    const promptText = "Great! I'll check your current location. Please allow location access in your browser.";
    setPizzoMessage(promptText);
    speak(promptText);

    if (!navigator.geolocation) {
      const noGeoText = "Geolocation is not supported by your browser. Please enter your address manually.";
      setPizzoMessage(noGeoText);
      speak(noGeoText);
      setErrorMessage(noGeoText);
      setState('IDLE');
      setIsManualMode(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });

        let resolvedAddress = `Latitude: ${latitude.toFixed(4)}, Longitude: ${longitude.toFixed(4)}`;

        // Reverse geocoding via OpenStreetMap Nominatim with fallback
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`, {
            headers: { 'Accept-Language': 'en' }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.display_name) {
              resolvedAddress = data.display_name;
            }
          }
        } catch (err) {
          console.warn('Reverse geocoding fallback used:', err);
          resolvedAddress = `Near Current GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)}), Delivery Zone 1`;
        }

        setDetectedAddress(resolvedAddress);
        setState('PREVIEW');

        const foundText = "I found your location! Please check it before confirming your delivery.";
        setPizzoMessage(foundText);
        speak(foundText);
      },
      (error) => {
        setState('IDLE');
        let errMsg = '';
        if (error.code === 1) {
          errMsg = "No problem! Location permission wasn't allowed. You can enter your delivery address manually.";
        } else if (error.code === 2) {
          errMsg = "I couldn't find your location right now. Please try again or enter your address manually.";
        } else if (error.code === 3) {
          errMsg = "That took a little longer than expected. Please try again.";
        } else {
          errMsg = "Unable to fetch location. Please enter manually.";
        }

        setPizzoMessage(errMsg);
        speak(errMsg);
        setErrorMessage(errMsg);
        setIsManualMode(true);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Confirm Location
  const handleConfirmLocation = () => {
    setState('CONFIRMED');
    const successText = "Perfect! Your delivery location is ready. Your pizza knows where to go! 🍕";
    setPizzoMessage(successText);
    speak(successText);

    if (onAddressSelected) {
      onAddressSelected(detectedAddress);
    }
  };

  // Manual Mode Trigger
  const handleEnterManually = () => {
    setIsManualMode(true);
    setState('IDLE');
    const manualText = "Sure thing! Feel free to type in your exact door number, building, and street.";
    setPizzoMessage(manualText);
    speak(manualText);
  };

  return (
    <div className="rounded-3xl p-5 sm:p-6 bg-[#FFF3DC] dark:bg-[#15100F] border-2 border-[#EAD5C5] dark:border-[#4A0E17] shadow-lg space-y-5 transition-all">
      
      {/* =========================================================================
          TOP: CHEF PIZZO VOICE ASSISTANT HEADER & CHARACTER
          ========================================================================= */}
      <div className="flex items-start justify-between gap-4">
        
        {/* Animated 3D Chef Character */}
        <div className="flex items-center gap-3.5">
          <div className="relative group select-none">
            {/* Ambient Soundwave / Status Ring */}
            <div className={`absolute -inset-2 rounded-2xl blur-md transition-all duration-300 ${
              isSpeaking
                ? 'bg-gradient-to-r from-pizza-amber via-pizza-gold to-pizza-red animate-pulse opacity-80'
                : state === 'LISTENING'
                ? 'bg-pizza-red/60 animate-ping opacity-75'
                : state === 'SEARCHING'
                ? 'bg-cyan-500/50 animate-pulse opacity-70'
                : 'bg-pizza-amber/20 opacity-40'
            }`} />

            {/* Chef Avatar Frame */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#1C1C1C] via-[#2A080D] to-[#4A0E17] flex items-center justify-center border-2 border-pizza-gold/40 shadow-xl overflow-hidden">
              
              {/* Hat Icon */}
              <div className={`absolute top-1 text-base sm:text-lg transition-transform ${isSpeaking ? 'animate-bounce' : ''}`}>
                👨‍🍳
              </div>

              {/* Blinking Eyes */}
              <div className="mt-3 flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full shadow-sm transition-all duration-300 ${
                  state === 'SEARCHING' ? 'bg-cyan-400 animate-ping' : isSpeaking ? 'bg-pizza-gold scale-110' : 'bg-pizza-amber'
                }`} />
                <span className={`w-2.5 h-2.5 rounded-full shadow-sm transition-all duration-300 ${
                  state === 'SEARCHING' ? 'bg-cyan-400 animate-ping' : isSpeaking ? 'bg-pizza-gold scale-110' : 'bg-pizza-amber'
                }`} />
              </div>

              {/* GPS Pin Badge */}
              <div className="absolute -bottom-0.5 right-1 text-xs">📍</div>

              {/* Soundwaves overlay when speaking */}
              {isSpeaking && (
                <div className="absolute inset-0 bg-pizza-burgundy/80 flex items-center justify-center gap-0.5 pointer-events-none">
                  <span className="w-1 bg-pizza-gold rounded-full animate-wave-1" />
                  <span className="w-1 bg-pizza-gold rounded-full animate-wave-2" />
                  <span className="w-1 bg-pizza-gold rounded-full animate-wave-3" />
                  <span className="w-1 bg-pizza-gold rounded-full animate-wave-4" />
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-pizza-textLight dark:text-pizza-headDark">
                Chef Pizzo Voice Guide
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-pizza-red text-white uppercase tracking-wider">
                AI GPS
              </span>
            </div>
            <p className="text-xs text-pizza-mutedLight dark:text-pizza-mutedDark font-medium">
              Where should we deliver your pizza?
            </p>
          </div>
        </div>

        {/* Voice Controls Panel (Mute / Unmute) */}
        <div className="flex items-center gap-1.5 bg-[#FFE4C4] dark:bg-[#1C1412] p-1 rounded-xl border border-[#E5C3AB] dark:border-[#2A1A18]">
          <button
            type="button"
            onClick={() => setVoiceMuted(!voiceMuted)}
            className={`p-2 rounded-lg text-xs font-bold transition-colors ${
              voiceMuted 
                ? 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-200' 
                : 'text-pizza-red dark:text-pizza-gold bg-[#FFF3DC] dark:bg-[#252525] shadow-sm'
            }`}
            title={voiceMuted ? "Enable Voice Assistant" : "Mute Voice Assistant"}
            aria-label={voiceMuted ? "Enable Voice Assistant" : "Mute Voice Assistant"}
          >
            {voiceMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>

      </div>

      {/* =========================================================================
          CHEF PIZZO DIALOGUE BUBBLE
          ========================================================================= */}
      <div className="p-4 rounded-2xl bg-[#FFE4C4] dark:bg-[#181313] border border-[#E5C3AB] dark:border-[#2A1A18] shadow-sm flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-pizza-red text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm mt-0.5">
          🍕
        </div>
        <div className="space-y-1">
          <p className="text-xs sm:text-sm font-semibold text-pizza-textLight dark:text-pizza-textDark leading-relaxed">
            {pizzoMessage}
          </p>
          {state === 'SEARCHING' && (
            <div className="flex items-center gap-2 text-xs font-bold text-pizza-amber pt-1">
              <Loader2 size={13} className="animate-spin" />
              <span>Finding your location...</span>
            </div>
          )}
          {state === 'LISTENING' && (
            <div className="flex items-center gap-2 text-xs font-bold text-pizza-red dark:text-pizza-gold pt-1">
              <span className="w-2 h-2 rounded-full bg-pizza-red animate-ping" />
              <span>{transcript || "Listening for 'location' or 'manual'..."}</span>
            </div>
          )}
        </div>
      </div>

      {/* Error / Alert notice if any */}
      {errorMessage && (
        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* =========================================================================
          ACTION BUTTONS ROW (VOICE / LIVE LOCATION / MANUAL)
          ========================================================================= */}
      {state !== 'PREVIEW' && state !== 'CONFIRMED' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* 1. Talk to Chef Pizzo */}
          <button
            type="button"
            onClick={handleTalkToChef}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-black transition-all duration-300 cursor-pointer ${
              state === 'LISTENING'
                ? 'bg-pizza-red text-white shadow-lg shadow-red-500/30 animate-pulse'
                : 'bg-gradient-to-r from-pizza-red via-pizza-tomato to-pizza-amber text-white hover:shadow-lg shadow-md active:scale-95'
            }`}
          >
            <Mic size={15} className={state === 'LISTENING' ? 'animate-bounce' : ''} />
            <span>{state === 'LISTENING' ? 'Listening...' : '🎙️ Talk to Pizzo'}</span>
          </button>

          {/* 2. Use Live Location */}
          <button
            type="button"
            disabled={state === 'SEARCHING'}
            onClick={handleUseLiveLocation}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-black bg-[#FFE4C4] dark:bg-[#1E1412] text-pizza-textLight dark:text-pizza-headDark border border-[#E5C3AB] dark:border-[#3A1F1B] hover:border-pizza-red dark:hover:border-pizza-gold shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {state === 'SEARCHING' ? (
              <Loader2 size={15} className="animate-spin text-pizza-red" />
            ) : (
              <MapPin size={15} className="text-pizza-red dark:text-pizza-gold" />
            )}
            <span>📍 Use Live GPS</span>
          </button>

          {/* 3. Enter Address Manually */}
          <button
            type="button"
            onClick={handleEnterManually}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold bg-[#F8D4C0] dark:bg-[#181313] text-pizza-textLight dark:text-pizza-textDark hover:bg-[#FFE4C4] dark:hover:bg-[#201816] border border-[#E4B59D] dark:border-[#2A1A18] transition-all cursor-pointer"
          >
            <Edit3 size={15} />
            <span>✍️ Manual Entry</span>
          </button>

        </div>
      )}

      {/* =========================================================================
          DETECTED ADDRESS CONFIRMATION CARD (PREVIEW STATE)
          ========================================================================= */}
      {state === 'PREVIEW' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FFE4C4] dark:bg-[#181313] border-2 border-pizza-red/40 dark:border-pizza-gold/40 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-pizza-red dark:text-pizza-gold">
                Detected Live Location
              </span>
            </div>
            {coords && (
              <span className="text-[10px] text-pizza-mutedLight dark:text-pizza-mutedDark font-mono">
                GPS: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
              </span>
            )}
          </div>

          <div className="p-3 rounded-xl bg-[#FFF3DC] dark:bg-[#130E0D] border border-[#EAD5C5] dark:border-[#2A1A18] text-xs font-medium text-pizza-textLight dark:text-pizza-textDark leading-relaxed">
            {detectedAddress}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={handleConfirmLocation}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-black bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-green-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Check size={16} />
              <span>✓ Confirm Location</span>
            </button>

            <button
              type="button"
              onClick={handleEnterManually}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold bg-[#F8D4C0] dark:bg-[#1E1412] text-pizza-textLight dark:text-pizza-textDark hover:bg-[#FFE4C4] dark:hover:bg-[#251A18] border border-[#E4B59D] dark:border-[#351F1C] transition-all cursor-pointer"
            >
              <Edit3 size={15} />
              <span>✏️ Edit Address</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONFIRMED STATE BADGE
          ========================================================================= */}
      {state === 'CONFIRMED' && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                Delivery Location Confirmed
              </p>
              <p className="text-[11px] text-stone-600 dark:text-stone-300 truncate max-w-xs sm:max-w-md">
                {detectedAddress}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setState('IDLE')}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0 cursor-pointer"
          >
            Change
          </button>
        </div>
      )}

      {/* Manual Input Fallback / Overwrite Textarea */}
      {isManualMode && (
        <div className="space-y-2 pt-2 border-t border-[#EAD5C5] dark:border-[#2A1A18] animate-in fade-in duration-200">
          <label className="block text-xs font-bold text-pizza-textLight dark:text-pizza-headDark uppercase tracking-wider">
            Edit Exact Delivery Address
          </label>
          <textarea
            rows={3}
            value={detectedAddress}
            onChange={(e) => {
              setDetectedAddress(e.target.value);
              if (onAddressSelected) onAddressSelected(e.target.value);
            }}
            placeholder="House / Flat No., Apartment / Building Name, Street, Landmark, City..."
            className="w-full px-4 py-3 rounded-2xl border border-[#EAD5C5] dark:border-[#2A1A18] bg-[#FAF5EE] dark:bg-[#181313] text-pizza-textLight dark:text-pizza-textDark focus:ring-2 focus:ring-pizza-red/30 focus:border-pizza-red text-xs sm:text-sm resize-none transition-all"
          />
        </div>
      )}

    </div>
  );
}
