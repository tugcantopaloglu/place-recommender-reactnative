import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Place } from './placesSlice';

interface FavoritesState {
  favorites: Place[];
  toVisit: Place[];
}

const initialState: FavoritesState = {
  favorites: [],
  toVisit: [],
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleFavorite: (state, action: PayloadAction<Place>) => {
      const index = state.favorites.findIndex((place) => place.id === action.payload.id);
      if (index === -1) {
        state.favorites.push(action.payload);
      } else {
        state.favorites.splice(index, 1);
      }
    },
    toggleToVisit: (state, action: PayloadAction<Place>) => {
      const index = state.toVisit.findIndex((place) => place.id === action.payload.id);
      if (index === -1) {
        state.toVisit.push(action.payload);
      } else {
        state.toVisit.splice(index, 1);
      }
    },
    clearFavorites: (state) => {
      state.favorites = [];
    },
    clearToVisit: (state) => {
      state.toVisit = [];
    },
  },
});

export const { toggleFavorite, toggleToVisit, clearFavorites, clearToVisit } = favoritesSlice.actions;
export default favoritesSlice.reducer; 