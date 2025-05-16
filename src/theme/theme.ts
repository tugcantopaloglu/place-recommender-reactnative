export const lightTheme = {
  colors: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
    text: '#000000',
    textSecondary: '#666666',
    accent: '#007AFF',
    border: '#E0E0E0',
    error: '#FF3B30',
    success: '#34C759',
    background: '#FFFFFF',
    card: '#FFFFFF',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    h3: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    body: {
      fontSize: 16,
    },
    caption: {
      fontSize: 14,
    },
  },
};

export const darkTheme = {
  ...lightTheme,
  colors: {
    primary: '#000000',
    secondary: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#AEAEB2',
    accent: '#0A84FF',
    border: '#38383A',
    error: '#FF453A',
    success: '#32D74B',
    background: '#000000',
    card: '#1C1C1E',
  },
}; 