import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from './src/context/ThemeContext';
import Navigation from './src/navigation';
import store from './src/store';

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Navigation />
      </ThemeProvider>
    </Provider>
  );
};

export default App; 