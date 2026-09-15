/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pizza: {
          // Core Accents
          burgundy: '#4A0E17',
          deepWine: '#38040E',
          red: '#E63946',
          darkRed: '#C1121F',
          tomato: '#D90429',
          orange: '#FF9A3D',
          accent: '#FF7043',
          amber: '#F77F00',
          gold: '#FFC857',
          cheese: '#FCBF49',
          basil: '#2D6A4F',
          basilLight: '#52B788',

          // Dark Mode Backgrounds & Surfaces (Exact User Spec)
          dark: '#0B0909',
          darkSection: '#100C0C',
          darkCard: '#15100F',
          cardDark: '#15100F',
          darkCardAlt: '#181313',
          darkElevated: '#1B1412',
          darkNav: '#0B0909',
          darkFooter: '#0B0909',
          borderDark: '#3A2520',
          borderDarkBurgundy: 'rgba(74, 14, 23, 0.6)',

          // Dark Mode Text System (Warm, High-Contrast, Crystal Clear)
          headDark: '#FFF1D6',          // Warm Ivory / Cream
          textDark: '#F3DFC0',          // Soft Champagne Body Text
          secondaryDark: '#D6C2A5',     // Warm Beige Secondary Text
          mutedDark: '#AFA08F',         // Warm Gray Muted Text
          linkDark: '#FF9A3D',          // Warm Orange Links
          activeNav: '#FF7043',         // Tomato Active Link Accent
          successDark: '#8FE3B0',       // Soft Mint Success
          errorDark: '#FF7B7B',         // Soft Coral Error
          warningDark: '#FFD166',       // Golden Sun Warning

          // Light Mode Backgrounds & Non-White Cards
          bgLight: '#FAF5EE',           // Warm Pizza World Cream
          cream: '#FFF3DC',             // Warm Cream Card
          peach: '#FFE4C4',             // Peach Cream Card
          terracotta: '#F8D4C0',        // Soft Terracotta Card
          goldCream: '#FFF0C2',         // Light Golden Cream Card
          borderLight: '#EAD5C5',
          textLight: '#2B1810',
          mutedLight: '#6B5E55',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float-slow': 'floatSlow 6s ease-in-out infinite',
        'float-medium': 'floatMedium 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'steam-rise': 'steamRise 4s ease-in-out infinite',
      },
      keyframes: {
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(1deg)' },
        },
        floatMedium: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.05)' },
        },
        steamRise: {
          '0%': { opacity: '0.2', transform: 'translateY(0) scale(0.95)' },
          '50%': { opacity: '0.5', transform: 'translateY(-15px) scale(1.05)' },
          '100%': { opacity: '0', transform: 'translateY(-30px) scale(1.1)' },
        }
      }
    },
  },
  plugins: [],
}
