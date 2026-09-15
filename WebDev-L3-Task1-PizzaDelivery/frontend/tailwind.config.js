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
          amber: '#F77F00',
          gold: '#FFC857',
          cheese: '#FCBF49',
          basil: '#2D6A4F',
          basilLight: '#52B788',

          // Dark Mode Backgrounds & Surfaces
          dark: '#070707',
          darkSection: '#0B0B0B',
          darkCard: '#15100F',
          cardDark: '#15100F',
          darkCardAlt: '#181313',
          darkNav: '#090909',
          darkFooter: '#050505',
          borderDark: '#2A1A18',
          borderDarkBurgundy: 'rgba(74, 14, 23, 0.6)',

          // Dark Mode Text System (Warm, Visible, Cinematic)
          headDark: '#e7afbc',          // Warm Ivory / Cream
          textDark: '#179fe3',          // Soft Champagne
          secondaryDark: '#340003',     // Warm Beige
          mutedDark: '#9f0a39',         // Warm Gray
          linkDark: '#FF9A3D',          // Warm Orange
          activeNav: '#FF7043',         // Tomato Orange
          successDark: '#8FE3B0',       // Soft Mint
          errorDark: '#cc1010',         // Soft Coral

          // Light Mode Backgrounds & Non-White Cards
          bgLight: '#d87a8b',           // Warm Pizza World Cream
          cream: '#27bfde',             // Warm Cream Card
          peach: '#422d12',             // Peach Cream Card
          terracotta: '#a83a52',        // Soft Terracotta Card
          goldCream: '#a1f5b4',         // Light Golden Cream Card
          borderLight: '#d99dea',
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
