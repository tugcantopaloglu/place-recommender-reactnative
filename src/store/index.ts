import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import placesReducer from './slices/placesSlice';
import favoritesReducer from './slices/favoritesSlice';
import settingsReducer from './slices/settingsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    places: placesReducer,
    favorites: favoritesReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Tarih nesnelerini kontrol etmeyi devre dışı bırak
        ignoredActions: ['auth/loginSuccess', 'auth/updateUser'],
        ignoredPaths: ['auth.user.createdAt', 'auth.user.lastLoginAt'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
