import { Place } from '../store/slices/placesSlice';
import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<MainStackParamList>;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  PlaceDetails: { placeId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Map: undefined;
  Profile: undefined;
  NotificationSettings: undefined;
  Favorites: {
    filter: 'all' | 'planned' | 'visited';
  };
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  PlaceDetails: { placeId: string };
  Settings: undefined;
}; 