import React from 'react';
import { View, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { CustomStatusBar } from './CustomStatusBar';

interface ScreenLayoutProps {
  children: React.ReactNode;
  style?: any;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({ children, style }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <CustomStatusBar />
      <SafeAreaView style={[styles.safeArea, style]}>
        {children}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
}); 