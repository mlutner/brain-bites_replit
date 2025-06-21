// Brain Bites Design System
// Comprehensive design tokens and utilities for consistent UI

export const DESIGN_TOKENS = {
  // Colors - Brain Bites green and pink theme
  colors: {
    primary: {
      50: 'hsl(150, 60%, 95%)',
      100: 'hsl(150, 60%, 90%)',
      200: 'hsl(150, 60%, 80%)',
      300: 'hsl(150, 60%, 70%)',
      400: 'hsl(150, 60%, 60%)',
      500: 'hsl(150, 70%, 35%)', // Main brand green
      600: 'hsl(150, 70%, 30%)',
      700: 'hsl(150, 70%, 25%)',
      800: 'hsl(150, 70%, 20%)',
      900: 'hsl(150, 70%, 15%)',
    },
    secondary: {
      50: 'hsl(340, 85%, 95%)',
      100: 'hsl(340, 85%, 90%)',
      200: 'hsl(340, 85%, 85%)',
      300: 'hsl(340, 85%, 80%)',
      400: 'hsl(340, 85%, 75%)', // Main brand pink
      500: 'hsl(340, 85%, 70%)',
      600: 'hsl(340, 85%, 65%)',
      700: 'hsl(340, 85%, 60%)',
      800: 'hsl(340, 85%, 55%)',
      900: 'hsl(340, 85%, 50%)',
    },
    neutral: {
      50: 'hsl(32, 50%, 98%)',
      100: 'hsl(32, 50%, 95%)',
      200: 'hsl(32, 30%, 90%)',
      300: 'hsl(32, 20%, 85%)',
      400: 'hsl(32, 15%, 70%)',
      500: 'hsl(200, 15%, 50%)',
      600: 'hsl(200, 20%, 40%)',
      700: 'hsl(200, 25%, 30%)',
      800: 'hsl(200, 25%, 20%)',
      900: 'hsl(200, 25%, 15%)',
    },
    status: {
      success: 'hsl(150, 70%, 35%)',
      warning: 'hsl(45, 90%, 55%)',
      error: 'hsl(0, 84%, 60%)',
      info: 'hsl(210, 90%, 60%)',
    }
  },

  // Typography
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Consolas', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
      '6xl': '4rem',    // 64px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    }
  },

  // Spacing
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
    '2xl': '2rem',   // 32px
    '3xl': '3rem',   // 48px
    '4xl': '4rem',   // 64px
    '5xl': '6rem',   // 96px
    '6xl': '8rem',   // 128px
  },

  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px - Brand standard
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    brand: '0 8px 25px rgba(var(--primary), 0.15)',
    hover: '0 12px 30px rgba(0, 0, 0, 0.1)',
  },

  // Animations
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    }
  }
} as const;

// Component styling patterns
export const COMPONENT_STYLES = {
  // Card variants
  card: {
    base: 'bg-white border-2 border-neutral-300 rounded-lg shadow-md transition-all duration-300',
    hover: 'hover:border-primary-500 hover:shadow-brand hover:-translate-y-1',
    selected: 'border-primary-500 shadow-brand',
    gradient: 'bg-gradient-to-br from-white to-neutral-100',
  },

  // Button variants
  button: {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg px-6 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg',
    secondary: 'bg-secondary-400 hover:bg-secondary-500 text-white font-semibold rounded-lg px-6 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white font-semibold rounded-lg px-6 py-3 transition-all duration-300',
    ghost: 'text-neutral-700 hover:bg-neutral-100 font-medium rounded-lg px-4 py-2 transition-all duration-300',
  },

  // Input styles
  input: {
    base: 'border-2 border-neutral-300 rounded-lg px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-300',
    error: 'border-error focus:border-error focus:ring-error/20',
  },

  // Badge styles
  badge: {
    primary: 'bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium',
    secondary: 'bg-secondary-100 text-secondary-700 px-3 py-1 rounded-full text-sm font-medium',
    neutral: 'bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-sm font-medium',
    success: 'bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium',
    warning: 'bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium',
    error: 'bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium',
  },

  // Layout patterns
  layout: {
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    section: 'py-12 lg:py-16',
    grid: 'grid gap-6',
    flex: 'flex items-center space-x-4',
  },

  // Interactive states
  interactive: {
    hover: 'hover:-translate-y-1 hover:shadow-hover transition-all duration-300',
    focus: 'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    active: 'active:translate-y-0 active:shadow-md',
    disabled: 'opacity-50 cursor-not-allowed',
  }
} as const;

// Gradient combinations
export const GRADIENTS = {
  brand: 'bg-gradient-to-r from-primary-500 to-secondary-400',
  brandLight: 'bg-gradient-to-r from-primary-50 to-secondary-50',
  brandVertical: 'bg-gradient-to-b from-primary-500 to-secondary-400',
  subtle: 'bg-gradient-to-br from-white to-neutral-50',
  warm: 'bg-gradient-to-br from-neutral-50 to-neutral-100',
} as const;

// Icon sizes
export const ICON_SIZES = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
  '2xl': 'w-10 h-10',
  '3xl': 'w-12 h-12',
} as const;

// Utility functions
export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getColorVariant(color: keyof typeof DESIGN_TOKENS.colors, variant: number = 500): string {
  return DESIGN_TOKENS.colors[color]?.[variant as keyof typeof DESIGN_TOKENS.colors[typeof color]] || '';
}