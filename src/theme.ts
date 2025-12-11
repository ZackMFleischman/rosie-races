import { createTheme } from '@mui/material/styles';

// Kid-friendly color palette for Rosie Races
const theme = createTheme({
  palette: {
    primary: {
      main: '#FF69B4', // Hot pink - playful and energetic
      light: '#FF9DD3',
      dark: '#E03D8A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#7B68EE', // Medium slate blue - fun purple
      light: '#A599F7',
      dark: '#5A4BC0',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#50C878', // Emerald green - positive feedback
      light: '#7DD99A',
      dark: '#3BA35D',
    },
    error: {
      main: '#FF6B6B', // Coral red - gentle error color
      light: '#FF9494',
      dark: '#E04545',
    },
    warning: {
      main: '#FFD93D', // Bright yellow - attention
      light: '#FFE57A',
      dark: '#E6C000',
    },
    info: {
      main: '#6BC5E8', // Sky blue - informational
      light: '#99D9F2',
      dark: '#4AA8C9',
    },
    background: {
      default: '#FFF5F8', // Very light pink background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2D3748', // Dark gray for readability
      secondary: '#718096',
    },
  },
  typography: {
    fontFamily: '"Fredoka", "Bubblegum Sans", "Comic Sans MS", cursive, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none', // Don't uppercase buttons
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12, // Rounded corners for kid-friendly feel
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          padding: '12px 24px',
          fontSize: '1.1rem',
          minWidth: 48,
          minHeight: 48, // Touch-friendly minimum size
        },
        sizeLarge: {
          padding: '16px 32px',
          fontSize: '1.25rem',
          minHeight: 56,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: 48,
          minHeight: 48, // Touch-friendly minimum size
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

export default theme;
