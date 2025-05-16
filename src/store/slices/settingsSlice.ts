import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserSettings {
  notificationSettings: {
    nearbyPlaces: boolean;
    dailyRecommendations: boolean;
    minRating: number;
    maxDistance: number;
  };
  mapSettings: {
    preferredMapType: 'google' | 'apple';
    showTraffic: boolean;
    clusterMarkers: boolean;
  };
  filterSettings: {
    priceRange: number[];
    categories: string[];
    minRating: number;
  };
  privacySettings: {
    shareLocation: boolean;
    shareVisitHistory: boolean;
    shareFavorites: boolean;
  };
}

const initialState: UserSettings = {
  notificationSettings: {
    nearbyPlaces: true,
    dailyRecommendations: true,
    minRating: 4.0,
    maxDistance: 1,
  },
  mapSettings: {
    preferredMapType: 'google',
    showTraffic: false,
    clusterMarkers: true,
  },
  filterSettings: {
    priceRange: [1, 4],
    categories: [],
    minRating: 3.5,
  },
  privacySettings: {
    shareLocation: true,
    shareVisitHistory: true,
    shareFavorites: true,
  },
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateNotificationSettings: (
      state,
      action: PayloadAction<Partial<UserSettings['notificationSettings']>>
    ) => {
      state.notificationSettings = {
        ...state.notificationSettings,
        ...action.payload,
      };
    },
    updateMapSettings: (
      state,
      action: PayloadAction<Partial<UserSettings['mapSettings']>>
    ) => {
      state.mapSettings = {
        ...state.mapSettings,
        ...action.payload,
      };
    },
    updateFilterSettings: (
      state,
      action: PayloadAction<Partial<UserSettings['filterSettings']>>
    ) => {
      state.filterSettings = {
        ...state.filterSettings,
        ...action.payload,
      };
    },
    updatePrivacySettings: (
      state,
      action: PayloadAction<Partial<UserSettings['privacySettings']>>
    ) => {
      state.privacySettings = {
        ...state.privacySettings,
        ...action.payload,
      };
    },
    resetSettings: (state) => {
      return initialState;
    },
  },
});

export const {
  updateNotificationSettings,
  updateMapSettings,
  updateFilterSettings,
  updatePrivacySettings,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer; 