/* ==========================================================================
   ThermoFlow — Smart Temperature Converter
   Vanilla JavaScript Application Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // ------------------------------------------------------------------------
  // 1. DOM Element References
  // ------------------------------------------------------------------------
  const tempInput = document.getElementById('tempInput');
  const clearInputBtn = document.getElementById('clearInputBtn');
  const unitSelect = document.getElementById('unitSelect');
  const unitSegmentedControl = document.getElementById('unitSegmentedControl');
  const unitButtons = unitSegmentedControl ? unitSegmentedControl.querySelectorAll('.unit-btn') : [];
  const swapUnitsBtn = document.getElementById('swapUnitsBtn');
  
  const liveToggle = document.getElementById('liveToggle');
  const convertBtn = document.getElementById('convertBtn');
  const resetBtn = document.getElementById('resetBtn');
  const errorAlert = document.getElementById('errorAlert');
  const errorMessage = document.getElementById('errorMessage');

  const valCelsius = document.getElementById('valCelsius');
  const valFahrenheit = document.getElementById('valFahrenheit');
  const valKelvin = document.getElementById('valKelvin');
  const cardCelsius = document.getElementById('cardCelsius');
  const cardFahrenheit = document.getElementById('cardFahrenheit');
  const cardKelvin = document.getElementById('cardKelvin');
  const copyResultsBtn = document.getElementById('copyResultsBtn');
  const copyBtnText = document.getElementById('copyBtnText');
  
  const scaleMarker = document.getElementById('scaleMarker');
  const scaleStatusText = document.getElementById('scaleStatusText');

  const weatherBackground = document.getElementById('weatherBackground');
  const particlesContainer = document.getElementById('particlesContainer');
  const atmosphereStatusBadge = document.getElementById('atmosphereStatusBadge');
  const statusIcon = document.getElementById('statusIcon');
  const statusText = document.getElementById('statusText');

  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeLabelText = document.getElementById('themeLabelText');

  const formulasToggleBtn = document.getElementById('formulasToggleBtn');
  const formulasContent = document.getElementById('formulasContent');

  const historyList = document.getElementById('historyList');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const presetCards = document.querySelectorAll('.preset-card');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');

  // State Variables
  let currentUnit = 'C';
  let lastValidCalculatedResults = null;
  const HISTORY_KEY = 'thermoflow_conversion_history';
  const THEME_KEY = 'thermoflow_preferred_theme';

  // ------------------------------------------------------------------------
  // 2. Initialization
  // ------------------------------------------------------------------------
  initApp();

  function initApp() {
    loadSavedTheme();
    loadConversionHistory();
    setupEventListeners();

    // Default starting conversion (e.g. 25°C)
    if (tempInput) {
      tempInput.value = '25';
      toggleClearButton();
      performConversion({ isAutomatic: true, saveHistory: false });
    }
  }

  // ------------------------------------------------------------------------
  // 3. Event Listeners Setup
  // ------------------------------------------------------------------------
  function setupEventListeners() {
    // Input typing events
    if (tempInput) {
      tempInput.addEventListener('input', () => {
        toggleClearButton();
        if (liveToggle && liveToggle.checked) {
          performConversion({ isAutomatic: true, saveHistory: false });
        } else {
          clearError();
        }
      });
    }

    // Clear input button
    if (clearInputBtn) {
      clearInputBtn.addEventListener('click', () => {
        if (tempInput) {
          tempInput.value = '';
          tempInput.focus();
        }
        toggleClearButton();
        clearError();
        if (liveToggle && liveToggle.checked) {
          resetResultsDisplay();
        }
      });
    }

    // Segmented unit buttons
    unitButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedUnit = btn.getAttribute('data-unit');
        setUnit(selectedUnit);
        if ((liveToggle && liveToggle.checked) || (tempInput && tempInput.value.trim() !== '')) {
          performConversion({ isAutomatic: true, saveHistory: false });
        }
      });
    });

    // Cycle / Swap Unit button
    if (swapUnitsBtn) {
      swapUnitsBtn.addEventListener('click', () => {
        const units = ['C', 'F', 'K'];
        const currentIndex = units.indexOf(currentUnit);
        const nextUnit = units[(currentIndex + 1) % units.length];
        setUnit(nextUnit);
        performConversion({ isAutomatic: false, saveHistory: true });
      });
    }

    // Convert CTA button
    if (convertBtn) {
      convertBtn.addEventListener('click', () => {
        performConversion({ isAutomatic: false, saveHistory: true });
      });
    }

    // Reset button
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        resetConverter();
      });
    }

    // Formulas accordion toggle
    if (formulasToggleBtn && formulasContent) {
      formulasToggleBtn.addEventListener('click', () => {
        const isExpanded = formulasToggleBtn.getAttribute('aria-expanded') === 'true';
        formulasToggleBtn.setAttribute('aria-expanded', !isExpanded);
        formulasContent.classList.toggle('hidden', isExpanded);
      });
    }

    // Theme toggle button
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        toggleTheme();
      });
    }

    // Copy results button
    if (copyResultsBtn) {
      copyResultsBtn.addEventListener('click', () => {
        copyResultsToClipboard();
      });
    }

    // Clear history button
    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener('click', () => {
        clearHistory();
      });
    }

    // Preset benchmark cards ("At a Glance")
    presetCards.forEach(card => {
      card.addEventListener('click', () => {
        const temp = card.getAttribute('data-temp');
        const unit = card.getAttribute('data-unit');
        if (tempInput) tempInput.value = temp;
        setUnit(unit);
        toggleClearButton();
        performConversion({ isAutomatic: false, saveHistory: true });
        
        // Smooth scroll up to converter
        const converterElem = document.getElementById('converter');
        if (converterElem) {
          converterElem.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Keyboard shortcuts: Enter to convert, Escape to clear/reset
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && tempInput && document.activeElement === tempInput) {
        e.preventDefault();
        performConversion({ isAutomatic: false, saveHistory: true });
      } else if (e.key === 'Escape' && tempInput && document.activeElement === tempInput) {
        resetConverter();
      }
    });
  }

  // ------------------------------------------------------------------------
  // 4. Core Conversion Logic & Math
  // ------------------------------------------------------------------------
  function performConversion({ isAutomatic = false, saveHistory = false }) {
    const rawVal = tempInput.value;

    // Validate input
    const validation = validateInput(rawVal, currentUnit);

    if (!validation.isValid) {
      // Don't show empty error when user is just typing in live mode and field is empty
      if (isAutomatic && rawVal.trim() === '') {
        clearError();
        resetResultsDisplay();
        return;
      }
      showError(validation.errorMsg);
      return;
    }

    // Input is valid
    clearError();
    const val = validation.numValue;

    // Calculate all units
    let results;
    if (currentUnit === 'C') {
      results = convertFromCelsius(val);
    } else if (currentUnit === 'F') {
      results = convertFromFahrenheit(val);
    } else {
      results = convertFromKelvin(val);
    }

    lastValidCalculatedResults = { inputVal: val, inputUnit: currentUnit, results };

    // Update UI elements
    displayResults(results);
    updateTemperatureTheme(results.C);
    updateTemperatureScale(results.C);

    // Save to history if explicitly converted by button/preset/swap
    if (saveHistory) {
      saveToHistory(val, currentUnit, results);
    }
  }

  // Input Validation & Absolute Zero Rules
  function validateInput(valueStr, unit) {
    if (valueStr === null || valueStr === undefined || valueStr.trim() === '') {
      return { isValid: false, errorMsg: 'Please enter a temperature.' };
    }

    const num = Number(valueStr);
    if (isNaN(num)) {
      return { isValid: false, errorMsg: 'Please enter a valid numeric temperature.' };
    }

    // Absolute Zero Validation Limits
    if (unit === 'C' && num < -273.15) {
      return { isValid: false, errorMsg: 'Celsius temperature cannot be below absolute zero (-273.15°C).' };
    }
    if (unit === 'F' && num < -459.67) {
      return { isValid: false, errorMsg: 'Fahrenheit temperature cannot be below absolute zero (-459.67°F).' };
    }
    if (unit === 'K' && num < 0) {
      return { isValid: false, errorMsg: 'Kelvin temperature cannot be below absolute zero (0 K).' };
    }

    return { isValid: true, errorMsg: '', numValue: num };
  }

  // Conversion Mathematical Formulas
  function convertFromCelsius(c) {
    const f = (c * 9 / 5) + 32;
    const k = c + 273.15;
    return { C: c, F: f, K: k };
  }

  function convertFromFahrenheit(f) {
    const c = (f - 32) * 5 / 9;
    const k = c + 273.15;
    return { C: c, F: f, K: k };
  }

  function convertFromKelvin(k) {
    const c = k - 273.15;
    const f = (c * 9 / 5) + 32;
    return { C: c, F: f, K: k };
  }

  // Format numbers for crisp presentation (max 2 decimal places, no trailing zeros)
  function formatNumber(num) {
    if (Object.is(num, -0)) num = 0; // Fix negative zero (-0)
    const rounded = Math.round(num * 100) / 100;
    return rounded.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }

  // ------------------------------------------------------------------------
  // 5. Display & UI Update Functions
  // ------------------------------------------------------------------------
  function displayResults(results) {
    valCelsius.textContent = formatNumber(results.C);
    valFahrenheit.textContent = formatNumber(results.F);
    valKelvin.textContent = formatNumber(results.K);

    // Highlight source unit card
    cardCelsius.classList.toggle('active-source', currentUnit === 'C');
    cardFahrenheit.classList.toggle('active-source', currentUnit === 'F');
    cardKelvin.classList.toggle('active-source', currentUnit === 'K');
  }

  function resetResultsDisplay() {
    valCelsius.textContent = '--';
    valFahrenheit.textContent = '--';
    valKelvin.textContent = '--';
  }

  function setUnit(unit) {
    currentUnit = unit;
    unitSelect.value = unit;

    // Update segmented button styles
    unitButtons.forEach(btn => {
      const isMatch = btn.getAttribute('data-unit') === unit;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-checked', isMatch ? 'true' : 'false');
      btn.setAttribute('tabIndex', isMatch ? '0' : '-1');
    });
  }

  function toggleClearButton() {
    if (tempInput.value.length > 0) {
      clearInputBtn.style.display = 'block';
    } else {
      clearInputBtn.style.display = 'none';
    }
  }

  function showError(msg) {
    errorMessage.textContent = msg;
    errorAlert.classList.remove('hidden');
    tempInput.classList.add('input-error');
  }

  function clearError() {
    errorAlert.classList.add('hidden');
    tempInput.classList.remove('input-error');
  }

  function resetConverter() {
    tempInput.value = '';
    setUnit('C');
    clearError();
    toggleClearButton();
    resetResultsDisplay();
    updateTemperatureTheme(20); // Reset to comfortable ambient
    updateTemperatureScale(20);
    tempInput.focus();
  }

  // ------------------------------------------------------------------------
  // 6. Dynamic Visual Weather Atmosphere & Particles
  // ------------------------------------------------------------------------
  function updateTemperatureTheme(celsiusVal) {
    if (!weatherBackground) return;

    weatherBackground.classList.remove('theme-cold', 'theme-comfortable', 'theme-hot');

    let themeClass, iconStr, textStr;

    if (celsiusVal < 10) {
      themeClass = 'theme-cold';
      iconStr = '❄️';
      textStr = `Cool Atmosphere (${formatNumber(celsiusVal)}°C)`;
    } else if (celsiusVal <= 30) {
      themeClass = 'theme-comfortable';
      iconStr = '🌿';
      textStr = `Comfortable Atmosphere (${formatNumber(celsiusVal)}°C)`;
    } else {
      themeClass = 'theme-hot';
      iconStr = '🔥';
      textStr = `Warm Atmosphere (${formatNumber(celsiusVal)}°C)`;
    }

    weatherBackground.classList.add(themeClass);
    if (statusIcon) statusIcon.textContent = iconStr;
    if (statusText) statusText.textContent = textStr;

    generateAmbientParticles(themeClass);
  }

  function generateAmbientParticles(themeClass) {
    if (!particlesContainer) return;
    particlesContainer.innerHTML = '';

    const fragment = document.createDocumentFragment();

    if (themeClass === 'theme-cold') {
      // Create 24 dynamic falling snowflakes with sway
      const snowCount = 24;
      const snowIcons = ['❄', '❅', '❆', '•'];
      for (let i = 0; i < snowCount; i++) {
        const p = document.createElement('div');
        p.className = 'particle snowflake';
        p.textContent = snowIcons[Math.floor(Math.random() * snowIcons.length)];

        const size = Math.floor(Math.random() * 10) + 12;
        const left = Math.random() * 100;
        const duration = Math.random() * 8 + 6;
        const delay = Math.random() * 6;

        p.style.fontSize = `${size}px`;
        p.style.left = `${left}%`;
        p.style.top = '0px';
        p.style.animationDuration = `${duration}s`;
        p.style.animationDelay = `-${delay.toFixed(2)}s`;

        fragment.appendChild(p);
      }
    } else if (themeClass === 'theme-hot') {
      // Create 28 rising flickering embers
      const emberCount = 28;
      for (let i = 0; i < emberCount; i++) {
        const p = document.createElement('div');
        p.className = 'particle ember';

        const size = Math.floor(Math.random() * 9) + 4;
        const left = Math.random() * 100;
        const duration = Math.random() * 5 + 4;
        const delay = Math.random() * 5;

        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = `${left}%`;
        p.style.bottom = '0px';
        p.style.animationDuration = `${duration}s`;
        p.style.animationDelay = `-${delay.toFixed(2)}s`;

        fragment.appendChild(p);
      }
    } else {
      // Comfortable - Create 20 floating ambient sunbeams/orbs
      const orbCount = 20;
      for (let i = 0; i < orbCount; i++) {
        const p = document.createElement('div');
        p.className = 'particle sunbeam';

        const size = Math.floor(Math.random() * 14) + 6;
        const left = Math.random() * 100;
        const top = Math.random() * 90 + 5;
        const duration = Math.random() * 8 + 6;
        const delay = Math.random() * 5;

        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = `${left}%`;
        p.style.top = `${top}%`;
        p.style.animationDuration = `${duration}s`;
        p.style.animationDelay = `-${delay.toFixed(2)}s`;

        fragment.appendChild(p);
      }
    }

    particlesContainer.appendChild(fragment);
  }

  // ------------------------------------------------------------------------
  // 7. Temperature Scale Indicator Logic
  // ------------------------------------------------------------------------
  function updateTemperatureScale(celsiusVal) {
    // Map -50°C (0%) to 100°C (100%)
    const minScale = -50;
    const maxScale = 100;

    let percentage = ((celsiusVal - minScale) / (maxScale - minScale)) * 100;
    percentage = Math.max(0, Math.min(100, percentage));

    scaleMarker.style.left = `${percentage}%`;

    // Dynamic descriptive status
    let statusLabel = '';
    if (celsiusVal < 0) {
      statusLabel = `Freezing Cold (${formatNumber(celsiusVal)}°C)`;
    } else if (celsiusVal < 15) {
      statusLabel = `Chilly (${formatNumber(celsiusVal)}°C)`;
    } else if (celsiusVal <= 26) {
      statusLabel = `Mild & Pleasant (${formatNumber(celsiusVal)}°C)`;
    } else if (celsiusVal <= 38) {
      statusLabel = `Warm (${formatNumber(celsiusVal)}°C)`;
    } else {
      statusLabel = `Scorching Hot (${formatNumber(celsiusVal)}°C)`;
    }

    scaleStatusText.textContent = statusLabel;
  }

  // ------------------------------------------------------------------------
  // 8. Clipboard Copy Results
  // ------------------------------------------------------------------------
  function copyResultsToClipboard() {
    if (!lastValidCalculatedResults) {
      showToast('No conversion results to copy.');
      return;
    }

    const { inputVal, inputUnit, results } = lastValidCalculatedResults;
    const textToCopy = `${inputVal}°${inputUnit} = ${formatNumber(results.C)}°C | ${formatNumber(results.F)}°F | ${formatNumber(results.K)} K`;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('Copied results to clipboard!');
      }).catch(() => {
        fallbackCopyText(textToCopy);
      });
    } else {
      fallbackCopyText(textToCopy);
    }
  }

  function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('Copied results to clipboard!');
    } catch (err) {
      showToast('Failed to copy results.');
    }
    document.body.removeChild(textArea);
  }

  function showToast(msg) {
    toastMessage.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 2800);
  }

  // ------------------------------------------------------------------------
  // 9. History Storage (`localStorage`)
  // ------------------------------------------------------------------------
  function saveToHistory(val, unit, results) {
    let history = getHistoryFromStorage();

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newItem = {
      id: Date.now(),
      inputStr: `${val}°${unit}`,
      outputStr: `${formatNumber(results.C)}°C = ${formatNumber(results.F)}°F = ${formatNumber(results.K)} K`,
      timestamp: `Today, ${timestamp}`
    };

    // Prevent duplicate consecutive entries
    if (history.length > 0 && history[0].inputStr === newItem.inputStr) {
      return;
    }

    history.unshift(newItem);
    if (history.length > 8) history = history.slice(0, 8); // Keep latest 8

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    renderHistory(history);
  }

  function getHistoryFromStorage() {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function loadConversionHistory() {
    const history = getHistoryFromStorage();
    renderHistory(history);
  }

  function renderHistory(history) {
    historyList.innerHTML = '';

    if (history.length === 0) {
      historyList.innerHTML = `
        <div class="history-empty-state">
          <p>No recent conversions yet. Perform a conversion to record history!</p>
        </div>
      `;
      return;
    }

    history.forEach(item => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `
        <span class="history-item-calc">${item.inputStr} &rarr; ${item.outputStr}</span>
        <span class="history-item-time">${item.timestamp}</span>
      `;
      historyList.appendChild(div);
    });
  }

  function clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory([]);
    showToast('History cleared.');
  }

  // ------------------------------------------------------------------------
  // 10. Light / Dark Theme Management
  // ------------------------------------------------------------------------
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    setTheme(newTheme);
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);

    themeLabelText.textContent = theme === 'dark' ? 'Dark' : 'Light';
  }

  function loadSavedTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
    setTheme(savedTheme);
  }

  // ------------------------------------------------------------------------
  // 11. Interactive Mouse Parallax Background Motion
  // ------------------------------------------------------------------------
  let isParallaxTicking = false;
  window.addEventListener('mousemove', (e) => {
    if (!isParallaxTicking) {
      window.requestAnimationFrame(() => {
        const moveX = (e.clientX / window.innerWidth - 0.5) * 35;
        const moveY = (e.clientY / window.innerHeight - 0.5) * 35;
        
        const aurora = document.getElementById('auroraContainer');
        if (aurora) {
          aurora.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
        }
        
        const clouds = document.getElementById('cloudsWrapper');
        if (clouds) {
          clouds.style.transform = `translate3d(${moveX * 0.45}px, ${moveY * 0.45}px, 0)`;
        }

        const sunMoon = document.getElementById('sunMoonElement');
        if (sunMoon) {
          sunMoon.style.transform = `translate3d(${-moveX * 0.6}px, ${-moveY * 0.6}px, 0)`;
        }
        
        isParallaxTicking = false;
      });
      isParallaxTicking = true;
    }
  });
});
