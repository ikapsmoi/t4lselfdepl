/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      xs: "320px",
      sm: "480px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        // New Brand Color System
        brand: {
          navy: "#0F2F6B",
          aqua: "#47B5C4",
          forest: "#3E6A4F",
          midnight: "#0E1521",
          charcoal: "#1E1E1E",
          slate: "#5B6673",
          white: "#FFFFFF",
          light: "#F4F6F8",
        },
        // Legacy colors maintained for compatibility
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          black: "#1E1E1E", // mapped to charcoal
          darkGray: "#0E1521", // mapped to midnight
          mediumGray: "#5B6673", // mapped to slate
          lightGray: "#5B6673",
          white: "#FFFFFF",
        },
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          yellow: "#47B5C4", // mapped to aqua
          brightYellow: "#47B5C4",
          gold: "#47B5C4",
          orange: "#47B5C4",
        },
        nature: {
          skyBlue: "#47B5C4", // mapped to aqua
          lightBlue: "#47B5C4",
          paleBlue: "#F4F6F8", // mapped to light
          mountainGray: "#5B6673", // mapped to slate
          forestGreen: "#3E6A4F", // mapped to forest
          lakeBlue: "#0F2F6B", // mapped to navy
          sandBeige: "#F4F6F8", // mapped to light
        },
        ui: {
          background: "#FFFFFF",
          cardBackground: "rgba(244, 246, 248, 0.9)",
          overlay: "rgba(14, 21, 33, 0.4)",
          border: "#F4F6F8",
          shadow: "rgba(14, 21, 33, 0.1)",
        },
        text: {
          primary: "#111827", // darker for better contrast
          secondary: "#374151", // darker gray for better contrast
          light: "#4b5563", // improved contrast
          onDark: "#FFFFFF",
          onOverlay: "#FFFFFF",
        },
        // Contiki-inspired brand colors
        contiki: {
          teal: "#00B3A6",     // Primary brand teal
          navy: "#00263A",     // Dark navy for backgrounds
          coral: "#FF4C61",    // Accent red/coral
          grayLight: "#F7F7F7",
          grayMid: "#666666",
          white: "#FFFFFF",
        },
        earth: {
          50: '#faf7f0',
          100: '#f4ede0',
          200: '#e8d8c0',
          300: '#d9bf9a',
          400: '#c8a372',
          500: '#b8875a',
          600: '#a6734e',
          700: '#8a5d42',
          800: '#704c39',
          900: '#5c3f30',
        },
        adventure: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        culture: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        wellness: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
        // VisitRenoTahoe specific colors
        tahoe: {
          blue: '#1e40af',
          sky: '#0ea5e9',
          mountain: '#6b7280',
          snow: '#f8fafc',
          forest: '#059669',
          sunset: '#f59e0b',
        }
      },
      fontFamily: {
        // Unified Plus Jakarta Sans Typography
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        display: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        heading: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        body: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.4" }],
        sm: ["0.875rem", { lineHeight: "1.5" }],
        base: ["1rem", { lineHeight: "1.6" }],
        lg: ["1.125rem", { lineHeight: "1.6" }],
        xl: ["1.25rem", { lineHeight: "1.5" }],
        "2xl": ["1.5rem", { lineHeight: "1.35" }],
        "3xl": ["2rem", { lineHeight: "1.3" }],
        "4xl": ["2.5rem", { lineHeight: "1.2" }],
        "5xl": ["3.25rem", { lineHeight: "1.15" }],
        "6xl": ["4rem", { lineHeight: "1.1" }],
        "7xl": ["5rem", { lineHeight: "1.05" }],
        "8xl": ["6.5rem", { lineHeight: "1.05" }],
        hero: ["8rem", { lineHeight: "1.05", fontWeight: "800" }],
        "hero-mobile": ["3rem", { lineHeight: "1.15", fontWeight: "800" }],
        "hero-tablet": ["5rem", { lineHeight: "1.1", fontWeight: "800" }],
      },
      fontWeight: {
        light: "300",
        normal: "400", // Lato body
        medium: "500", // Lato medium
        semibold: "600", // Montserrat headings
        bold: "700", // Montserrat bold headings
        extrabold: "800",
        black: "900",
      },
      letterSpacing: {
        tight: "-0.025em",
        normal: "0em",
        wide: "0.025em",
        wider: "0.05em",
        widest: "0.1em",
      },
      spacing: {
        xs: "0.25rem", // 4px
        sm: "0.5rem", // 8px
        md: "1rem", // 16px
        lg: "1.5rem", // 24px
        xl: "2rem", // 32px
        "2xl": "3rem", // 48px
        "3xl": "4rem", // 64px
        "4xl": "6rem", // 96px
        "5xl": "8rem", // 128px
        // Touch-friendly spacing
        touch: "3rem", // 48px minimum touch target
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      minHeight: {
        touch: "3rem", // 48px minimum touch target
      },
      minWidth: {
        touch: "3rem", // 48px minimum touch target
      },
      borderRadius: {
        none: "0px",
        sm: "0.25rem", // 4px
        md: "8px", // Contiki standard
        lg: "0.75rem", // 12px - Button radius
        xl: "1rem", // 16px
        "2xl": "1.5rem", // 24px
        "3xl": "2rem",
        full: "9999px",
        button: "0.75rem", // 12px - Specific button radius
        contiki: "8px", // Contiki standard
      },
      boxShadow: {
        sm: "0 2px 4px rgba(14, 21, 33, 0.1)",
        md: "0 4px 8px rgba(14, 21, 33, 0.1)",
        lg: "0 8px 16px rgba(14, 21, 33, 0.1)",
        xl: "0 16px 32px rgba(14, 21, 33, 0.1)",
        card: "0 4px 12px rgba(14, 21, 33, 0.1)",
        overlay: "0 8px 24px rgba(14, 21, 33, 0.2)",
        contiki: "0px 4px 12px rgba(0,0,0,0.1)", // Contiki standard
        // Mobile-specific shadows
        "mobile-card": "0 2px 8px rgba(14, 21, 33, 0.1)",
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.08)',
        'medium': '0 8px 30px -4px rgba(0, 0, 0, 0.12)',
        'strong': '0 16px 40px -8px rgba(0, 0, 0, 0.16)',
        'card-hover': '0 8px 25px -5px rgba(0, 0, 0, 0.12)',
        'button': '0 4px 14px -2px rgba(14, 165, 233, 0.3)',
        'button-hover': '0 6px 20px -4px rgba(14, 165, 233, 0.4)',
      },
      backgroundImage: {
        "gradient-hero": "linear-gradient(135deg, rgba(15, 47, 107, 0.8) 0%, rgba(71, 181, 196, 0.6) 100%)",
        "gradient-card": "linear-gradient(145deg, rgba(244, 246, 248, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)",
        "gradient-overlay": "linear-gradient(180deg, rgba(14, 21, 33, 0.6) 0%, rgba(14, 21, 33, 0.3) 100%)",
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-up': 'slideUp 0.8s ease-out',
        'scale-in': 'scaleIn 0.6s ease-out',
        'bounce-gentle': 'bounceGentle 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'drift-clouds': 'driftClouds 120s linear infinite',
        'fly-plane': 'flyPlane 90s linear infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        "hover-lift": "hoverLift 0.3s ease-in-out",
        "hover-scale": "hoverScale 0.3s ease-in-out",
        "hover-darken": "hoverDarken 0.3s ease-in-out",
        'golden-border': 'goldenBorder 3s linear infinite',
        // Mobile-optimized animations
        "mobile-bounce": "mobileBounce 0.6s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(40px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-8px) rotate(1deg)' },
          '66%': { transform: 'translateY(4px) rotate(-1deg)' },
        },
        driftClouds: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        flyPlane: {
          '0%': { transform: 'translateX(-400px) translateY(0px) rotate(0deg)' },
          '25%': { transform: 'translateX(25vw) translateY(-20px) rotate(2deg)' },
          '50%': { transform: 'translateX(50vw) translateY(10px) rotate(-1deg)' },
          '75%': { transform: 'translateX(75vw) translateY(-15px) rotate(1deg)' },
          '100%': { transform: 'translateX(calc(100vw + 400px)) translateY(0px) rotate(0deg)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        hoverLift: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-4px)" },
        },
        hoverScale: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.05)" },
        },
        hoverDarken: {
          "0%": { filter: "brightness(1)" },
          "100%": { filter: "brightness(0.9)" },
        },
        mobileBounce: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },
        goldenBorder: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        textFloatShimmer: "float 4s ease-in-out infinite, shimmer 3s linear infinite",
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      transitionDuration: {
        fast: "150ms",
        normal: "300ms",
        slow: "500ms",
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}