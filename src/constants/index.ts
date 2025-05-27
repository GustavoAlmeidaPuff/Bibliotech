// Animation constants
export const ANIMATION_DURATION = {
  SHORT: 0.2,
  MEDIUM: 0.6,
  LONG: 1.0,
} as const;

// Breakpoints
export const BREAKPOINTS = {
  MOBILE: '768px',
  TABLET: '1024px',
  DESKTOP: '1200px',
} as const;

// Colors
export const COLORS = {
  PRIMARY: '#0078d4',
  SECONDARY: '#4db5ff',
  SUCCESS: '#00b894',
  ERROR: '#d63031',
  WARNING: '#fdcb6e',
  TEXT: {
    PRIMARY: '#2c3e50',
    SECONDARY: '#6c7686',
    LIGHT: '#ffffff',
    DARK: '#1a1a1a',
  },
  BACKGROUND: {
    PRIMARY: '#ffffff',
    SECONDARY: '#f8f9fa',
    DARK: '#1a1a1a',
  },
} as const;

// Z-Index layers
export const Z_INDEX = {
  DROPDOWN: 100,
  STICKY: 200,
  MODAL: 1000,
  TOAST: 1100,
} as const;

// Common sizes
export const SIZES = {
  HEADER_HEIGHT: '60px',
  SIDEBAR_WIDTH: '250px',
  BORDER_RADIUS: '8px',
  MAX_WIDTH: '1200px',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  STUDENTS: '/students',
  STAFF: '/staff',
  BOOKS: '/books',
  LOANS: '/loans',
  RETURNS: '/returns',
  WITHDRAWALS: '/withdrawals',
  SETTINGS: '/settings',
} as const; 