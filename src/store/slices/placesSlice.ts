import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Place {
  id: string;
  name: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  rating: number;
  reviews: number;
  categories: string[];
  types: string[];
  photos?: string[];
  priceLevel?: number;
  userRating?: number;
  isFavorite: boolean;
}

interface PlacesState {
  places: Place[];
  favorites: Place[];
  toVisit: Place[];
  recommendations: Place[];
  loading: boolean;
  error: string | null;
  selectedPlace: Place | null;
  minRating: number;
}

const initialState: PlacesState = {
  places: [],
  favorites: [],
  toVisit: [],
  recommendations: [],
  loading: false,
  error: null,
  selectedPlace: null,
  minRating: 4.0,
};

const placesSlice = createSlice({
  name: 'places',
  initialState,
  reducers: {
    setPlaces: (state, action: PayloadAction<Place[]>) => {
      state.places = action.payload;
    },
    addPlace: (state, action: PayloadAction<Place>) => {
      state.places.push(action.payload);
    },
    updatePlace: (state, action: PayloadAction<Place>) => {
      const index = state.places.findIndex(
        (place) => place.id === action.payload.id
      );
      if (index !== -1) {
        state.places[index] = action.payload;
      }
    },
    removePlace: (state, action: PayloadAction<string>) => {
      state.places = state.places.filter((place) => place.id !== action.payload);
    },
    addToFavorites: (state, action: PayloadAction<Place>) => {
      state.favorites.push(action.payload);
      const place = state.places.find(p => p.id === action.payload.id);
      if (place) {
        place.isFavorite = true;
      }
    },
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter(place => place.id !== action.payload);
      const place = state.places.find(p => p.id === action.payload);
      if (place) {
        place.isFavorite = false;
      }
    },
    addToVisit: (state, action: PayloadAction<Place>) => {
      state.toVisit.push(action.payload);
    },
    removeFromToVisit: (state, action: PayloadAction<string>) => {
      state.toVisit = state.toVisit.filter(place => place.id !== action.payload);
    },
    setRecommendations: (state, action: PayloadAction<Place[]>) => {
      state.recommendations = action.payload;
    },
    setSelectedPlace: (state, action: PayloadAction<Place | null>) => {
      state.selectedPlace = action.payload;
    },
    setMinRating: (state, action: PayloadAction<number>) => {
      state.minRating = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setPlaces,
  addPlace,
  updatePlace,
  removePlace,
  addToFavorites,
  removeFromFavorites,
  addToVisit,
  removeFromToVisit,
  setRecommendations,
  setSelectedPlace,
  setMinRating,
  setLoading,
  setError,
} = placesSlice.actions;

export default placesSlice.reducer; 