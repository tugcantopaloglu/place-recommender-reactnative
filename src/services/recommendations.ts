import { Place } from '../store/slices/placesSlice';

interface UserPreferences {
  favoriteTypes: { [key: string]: number };
  visitedPlaces: string[];
  ratings: { [key: string]: number };
  pricePreference: number[];
  locationPreference: {
    latitude: number;
    longitude: number;
    radius: number;
  };
}

// Kullanıcı tercihlerini hesapla
export const calculateUserPreferences = (
  places: Place[],
  favorites: Place[],
  visited: Place[]
): UserPreferences => {
  const preferences: UserPreferences = {
    favoriteTypes: {},
    visitedPlaces: [],
    ratings: {},
    pricePreference: [0, 0, 0, 0, 0], // 0-4 arası fiyat seviyeleri
    locationPreference: {
      latitude: 0,
      longitude: 0,
      radius: 5000, // varsayılan 5km
    },
  };

  // Favori ve ziyaret edilen yerleri analiz et
  [...favorites, ...visited].forEach((place) => {
    // Mekan türlerinin ağırlıklarını hesapla
    place.types.forEach((type) => {
      preferences.favoriteTypes[type] = (preferences.favoriteTypes[type] || 0) + 1;
      if (favorites.find(f => f.id === place.id)) {
        preferences.favoriteTypes[type] += 2; // Favorilere ekstra ağırlık
      }
    });

    // Ziyaret edilen yerleri kaydet
    if (visited.find(v => v.id === place.id)) {
      preferences.visitedPlaces.push(place.id);
      preferences.ratings[place.id] = place.userRating || place.rating;
    }

    // Fiyat tercihlerini güncelle
    if (place.priceLevel !== undefined) {
      preferences.pricePreference[place.priceLevel]++;
    }

    // Konum tercihlerini güncelle
    if (place.location) {
      preferences.locationPreference.latitude += place.location.latitude;
      preferences.locationPreference.longitude += place.location.longitude;
    }
  });

  // Ortalama konum hesapla
  const totalPlaces = favorites.length + visited.length;
  if (totalPlaces > 0) {
    preferences.locationPreference.latitude /= totalPlaces;
    preferences.locationPreference.longitude /= totalPlaces;
  }

  return preferences;
};

// Mekan puanını hesapla
const calculatePlaceScore = (
  place: Place,
  preferences: UserPreferences,
  currentLocation: { latitude: number; longitude: number }
): number => {
  let score = 0;

  // 1. Tür tercihleri (30%)
  const typeScore = place.types.reduce((sum, type) => 
    sum + (preferences.favoriteTypes[type] || 0), 0);
  score += (typeScore / place.types.length) * 0.3;

  // 2. Değerlendirme puanı (25%)
  score += (place.rating / 5) * 0.25;

  // 3. Fiyat seviyesi uyumu (15%)
  if (place.priceLevel !== undefined) {
    const pricePreference = preferences.pricePreference[place.priceLevel];
    const totalPricePreferences = preferences.pricePreference.reduce((a, b) => a + b, 0);
    if (totalPricePreferences > 0) {
      score += (pricePreference / totalPricePreferences) * 0.15;
    }
  }

  // 4. Konum yakınlığı (20%)
  const distance = calculateDistance(
    currentLocation.latitude,
    currentLocation.longitude,
    place.location.latitude,
    place.location.longitude
  );
  score += Math.max(0, 1 - distance / preferences.locationPreference.radius) * 0.2;

  // 5. Popülerlik (10%)
  score += Math.min(place.reviews / 1000, 1) * 0.1;

  return score;
};

// Önerileri getir
export const getRecommendations = (
  allPlaces: Place[],
  preferences: UserPreferences,
  currentLocation: { latitude: number; longitude: number },
  limit: number = 10
): Place[] => {
  // Ziyaret edilmemiş yerleri filtrele ve puanla
  const recommendations = allPlaces
    .filter(place => !preferences.visitedPlaces.includes(place.id))
    .map(place => ({
      ...place,
      score: calculatePlaceScore(place, preferences, currentLocation),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return recommendations;
};

// Günlük önerileri getir
export const getDailyRecommendations = (
  allPlaces: Place[],
  preferences: UserPreferences,
  currentLocation: { latitude: number; longitude: number },
  limit: number = 3
): Place[] => {
  const baseRecommendations = getRecommendations(
    allPlaces,
    preferences,
    currentLocation
  );

  // Yakındaki yerlere öncelik ver
  const nearbyRecommendations = baseRecommendations
    .filter(place => {
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        place.location.latitude,
        place.location.longitude
      );
      return distance <= 2; // 2km içindeki yerler
    })
    .slice(0, limit);

  return nearbyRecommendations;
};

// İki nokta arasındaki mesafeyi hesapla (Haversine formülü)
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Dünya'nın yarıçapı (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (value: number): number => {
  return (value * Math.PI) / 180;
}; 