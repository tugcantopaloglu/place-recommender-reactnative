import { useContext } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  const { isDark, toggleTheme } = context;
  const systemColorScheme = useColorScheme();

  const theme = isDark ? darkTheme : lightTheme;
  const systemTheme = systemColorScheme === 'dark' ? darkTheme : lightTheme;

  return {
    theme: isDark === null ? systemTheme : theme,
    isDark,
    toggleTheme,
  };
};
