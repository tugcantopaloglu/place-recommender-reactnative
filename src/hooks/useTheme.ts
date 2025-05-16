import { useContext } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme';

export const useTheme = () => {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const systemColorScheme = useColorScheme();

  const theme = isDark ? darkTheme : lightTheme;
  const systemTheme = systemColorScheme === 'dark' ? darkTheme : lightTheme;

  return {
    theme: isDark === null ? systemTheme : theme,
    isDark,
    toggleTheme,
  };
}; 