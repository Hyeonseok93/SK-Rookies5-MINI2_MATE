import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6C63FF', // Primary
      light: '#8B85FF',
      soft: '#EDE9FF', // Primary Soft
    },
    secondary: {
      main: '#6B7280', // Secondary (Gray 600)
      contrastText: '#ffffff',
    },
    accent: {
      main: '#FF6B9D', // Accent
    },
    background: {
      default: '#EEF2F8', // BG
      paper: '#ffffff', // Surface
    },
    text: {
      primary: '#1A1A2E', // Text Primary
      secondary: '#6B7280', // Text Secondary
      muted: '#9CA3AF', // Text Muted
    },
    error: {
      main: '#f44336',
    },
  },
  typography: {
    fontFamily: [
      'Pretendard',
      '-apple-system',
      'BlinkMacSystemFont',
      'system-ui',
      'Roboto',
      'Helvetica Neue',
      'Segoe UI',
      'Apple SD Gothic Neo',
      'Noto Sans KR',
      'Malgun Gothic',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
      letterSpacing: '-1.5px',
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 16, // Radius
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 99, // Radius Pill
          textTransform: 'none',
          fontWeight: 600,
        },
        containedPrimary: {
          boxShadow: '0 4px 14px rgba(108,99,255,0.35)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(108,99,255,0.45)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.06)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 99,
        },
      },
    },
  },
});

export default theme;
