/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // Primario corporativo
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        dark: {
          bg: '#0b0f17',            // Fondo principal de la app
          surface: '#111827',       // Tarjetas y paneles
          elevated: '#1f2937',      // Modales, dropdowns y dialogs
          hover: '#283548',         // Hover sobre items
          border: '#374151',        // Bordes principales
          borderSubtle: '#1f2937',  // Bordes secundarios
          muted: '#9ca3af',         // Texto secundario accesible
          subtle: '#6b7280',        // Texto terciario / placeholders
        },
        status: {
          active: '#10b981',       // Esmeralda: ACTIVA / Activo
          activeBg: 'rgba(16, 185, 129, 0.12)',
          activeBorder: 'rgba(16, 185, 129, 0.3)',
          canceled: '#ef4444',     // Rojo: ANULADA / Inactivo
          canceledBg: 'rgba(239, 68, 68, 0.12)',
          canceledBorder: 'rgba(239, 68, 68, 0.3)',
          warning: '#f59e0b',      // Ámbar: Comisiones / Alertas
          warningBg: 'rgba(245, 158, 11, 0.12)',
          warningBorder: 'rgba(245, 158, 11, 0.3)',
          info: '#6366f1',         // Índigo: Paquetes / Categorías
          infoBg: 'rgba(99, 102, 241, 0.12)',
          infoBorder: 'rgba(99, 102, 241, 0.3)',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        'DEFAULT': '8px',
        'md': '10px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
        'dropdown': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
        'focus-ring': '0 0 0 3px rgba(37, 99, 235, 0.45)',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite linear',
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'slide-up': 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
