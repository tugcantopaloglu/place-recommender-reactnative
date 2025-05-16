import React from 'react';
import { StatusBar, Platform, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export const CustomStatusBar: React.FC = () => {
  const { theme, isDark } = useTheme();

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
        translucent
      />
      {Platform.OS === 'ios' && (
        <View
          style={{
            width: '100%',
            height: 47, // Dynamic Island için yeterli yükseklik
            backgroundColor: theme.colors.background,
          }}
        />
      )}
    </>
  );
}; 