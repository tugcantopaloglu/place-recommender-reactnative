// İki nokta arasındaki mesafeyi hesapla (Haversine formülü)
export const calculateDistance = (
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

// Dereceyi radyana çevir
const toRad = (value: number): number => {
  return (value * Math.PI) / 180;
};

// Belirli bir yarıçap içindeki mekanları filtrele
export const filterPlacesByDistance = (
  places: any[],
  currentLocation: { latitude: number; longitude: number },
  radius: number // km
): any[] => {
  return places.filter((place) => {
    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      place.location.latitude,
      place.location.longitude
    );
    return distance <= radius;
  });
};

// Konumları sırala (en yakından en uzağa)
export const sortPlacesByDistance = (
  places: any[],
  currentLocation: { latitude: number; longitude: number }
): any[] => {
  return [...places].sort((a, b) => {
    const distanceA = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      a.location.latitude,
      a.location.longitude
    );
    const distanceB = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      b.location.latitude,
      b.location.longitude
    );
    return distanceA - distanceB;
  });
};

// Konumun merkez noktasını hesapla
export const calculateCenterPoint = (
  locations: Array<{ latitude: number; longitude: number }>
): { latitude: number; longitude: number } => {
  if (locations.length === 0) {
    throw new Error('Locations array is empty');
  }

  const totalLat = locations.reduce((sum, loc) => sum + loc.latitude, 0);
  const totalLon = locations.reduce((sum, loc) => sum + loc.longitude, 0);

  return {
    latitude: totalLat / locations.length,
    longitude: totalLon / locations.length,
  };
};

// Konumlar için sınırlayıcı kutu hesapla
export const calculateBoundingBox = (
  locations: Array<{ latitude: number; longitude: number }>,
  padding: number = 0.1 // derece cinsinden padding
): {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
} => {
  if (locations.length === 0) {
    throw new Error('Locations array is empty');
  }

  const lats = locations.map((loc) => loc.latitude);
  const lons = locations.map((loc) => loc.longitude);

  return {
    minLat: Math.min(...lats) - padding,
    maxLat: Math.max(...lats) + padding,
    minLon: Math.min(...lons) - padding,
    maxLon: Math.max(...lons) + padding,
  };
}; 