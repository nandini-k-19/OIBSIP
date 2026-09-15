# 🌡️ ThermoFlow — Smart Real-Time Temperature Converter

A modern, responsive, and visually dynamic **Temperature Conversion Web Application** developed for the **Oasis Infobyte Internship (OIBSIP) — Web Development Level 1 Task 3**.

---

## 🌟 Features & Highlights

- **⚡ Instant 3-Way Conversions**: Convert seamlessly between **Celsius (°C)**, **Fahrenheit (°F)**, and **Kelvin (K)** in real time.
- **🎨 Dynamic Atmospheric Themes**:
  - Automatically adapts background scenery and particle animations based on the converted temperature:
    - ❄️ **Freezing / Cold** (< 10°C): Glacial blues, drifting snowflakes, and frost crystals.
    - 🍃 **Comfortable / Pleasant** (10°C – 28°C): Emerald green breezes, gentle clouds, and floating sunbeams.
    - 🔥 **Scorching / Hot** (> 28°C): Radiant golden sunbursts, atmospheric embers, and heat shimmer.
- **📐 Interactive Formula Calculation Breakdown**: Step-by-step mathematical breakdown of the applied conversion formula.
- **🕒 Conversion History Log**: Tracks recent conversions with 1-click recall and export options.
- **⚡ Quick Temperature Presets**: Rapidly test common reference points (Absolute Zero, Freezing Point, Human Body Temp, Boiling Point).
- **📋 1-Click Clipboard Copy**: Instantly copy formatted conversion results.
- **🌓 Dual Dark / Light Mode**: Built-in glassmorphism theme switcher.
- **📱 100% Mobile & Tablet Responsive**: Optimized for touch controls and varied viewports.

---

## 🛠️ Technology Stack

- **HTML5**: Semantic markup, accessible labels, and structured layout.
- **CSS3 / Modern Vanilla CSS**: Custom properties (CSS variables), glassmorphism effects, flexbox & CSS grid, volumetric cloud keyframe animations.
- **JavaScript (ES6+)**: Real-time conversion algorithms, DOM manipulation, dynamic particle system, local storage history persistence.

---

## 🚀 How to Run

No build step or external dependencies required!

1. Clone or download the repository:
   ```bash
   git clone https://github.com/nandini-k-19/OIBSIP.git
   ```
2. Navigate to the project folder:
   ```bash
   cd WebDev-L1-Task3-TemperatureConverter
   ```
3. Open `index.html` directly in your favorite web browser (or use VS Code Live Server).

---

## 📊 Conversion Formulas

| From | To | Formula |
| :--- | :--- | :--- |
| **Celsius (°C)** | **Fahrenheit (°F)** | $F = (C \times 9/5) + 32$ |
| **Celsius (°C)** | **Kelvin (K)** | $K = C + 273.15$ |
| **Fahrenheit (°F)** | **Celsius (°C)** | $C = (F - 32) \times 5/9$ |
| **Fahrenheit (°F)** | **Kelvin (K)** | $K = (F - 32) \times 5/9 + 273.15$ |
| **Kelvin (K)** | **Celsius (°C)** | $C = K - 273.15$ |
| **Kelvin (K)** | **Fahrenheit (°F)** | $F = (K - 273.15) \times 9/5 + 32$ |

---

## 👩‍💻 Author & Submission

- **Intern**: Komala Nandini ([@nandini-k-19](https://github.com/nandini-k-19))
- **Track**: Oasis Infobyte Web Development Internship
- **Task**: Level 1 - Task 3: Temperature Converter Website
