import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { Place } from '../store/slices/placesSlice';
import { getRecommendations, getDailyRecommendations } from './recommendations';
import { calculateDistance } from '../utils/location';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

let locationTaskName = 'background-location-task';

// Bildirimleri yapılandır
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Bildirim izinlerini kontrol et ve iste
export const requestNotificationPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });

    await Notifications.setNotificationChannelAsync('nearby-places', {
      name: 'Yakındaki Mekanlar',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });

    await Notifications.setNotificationChannelAsync('daily-recommendations', {
      name: 'Günlük Öneriler',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return true;
};

// Konum izinlerini kontrol et ve iste
export const requestLocationPermissions = async () => {
  const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Location.requestForegroundPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return false;
  }

  const { status: backgroundStatus } = await Location.getBackgroundPermissionsAsync();
  let finalBackgroundStatus = backgroundStatus;

  if (backgroundStatus !== 'granted') {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    finalBackgroundStatus = status;
  }

  return finalBackgroundStatus === 'granted';
};

export const scheduleNearbyPlaceNotification = async (
  place: Place,
  distance: number
) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Yakınınızda Bir Mekan Var!',
      body: `${place.name} sadece ${distance.toFixed(1)}km uzaklıkta! ${
        place.rating
      } ★ (${place.reviews} değerlendirme)`,
      data: { placeId: place.id },
    },
    trigger: null,
  });
};

export const scheduleDailyRecommendationNotification = async (places: Place[]) => {
  const placeNames = places.map((place) => place.name).join(', ');
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Günün Mekan Önerileri',
      body: `Bugün için önerilerimiz: ${placeNames}`,
      data: { placeIds: places.map((p) => p.id) },
    },
    trigger: {
      hour: 11,
      minute: 0,
      repeats: true,
    },
  });
};

export const checkNearbyPlaces = async (
  currentLocation: { latitude: number; longitude: number },
  places: Place[],
  preferences: any,
  minRating: number = 4.0,
  maxDistance: number = 1 // km
) => {
  const nearbyPlaces = places.filter((place) => {
    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      place.location.latitude,
      place.location.longitude
    );
    return distance <= maxDistance && place.rating >= minRating;
  });

  for (const place of nearbyPlaces) {
    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      place.location.latitude,
      place.location.longitude
    );
    await scheduleNearbyPlaceNotification(place, distance);
  }
};

// Bildirim gönderme fonksiyonu
const sendNotification = async (userId: string, place: any, distance: number) => {
  try {
    // Kullanıcının bildirim ayarlarını al
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return;
    
    const userData = userDoc.data();
    const settings = userData.notificationSettings || {
      enabled: true,
      sound: true,
      vibration: true,
      minTimeBetweenNotifications: 30
    };

    // Son bildirim zamanını kontrol et
    const now = Date.now();
    const lastNotificationTime = userData.lastNotificationTimes?.[place.id] || 0;
    const timeSinceLastNotification = (now - lastNotificationTime) / (1000 * 60); // dakika cinsinden

    if (timeSinceLastNotification < settings.minTimeBetweenNotifications) {
      return; // Minimum bildirim aralığı geçmediyse bildirim gönderme
    }

    // Bildirim gönder
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Favori Mekanınıza Yakınsınız!',
        body: `${place.name} ${distance.toFixed(1)} km uzaklıkta.`,
        data: { placeId: place.id },
        sound: settings.sound,
        vibrate: settings.vibration ? [0, 250, 250, 250] : null,
      },
      trigger: null,
    });

    // Son bildirim zamanını güncelle
    await setDoc(doc(db, 'users', userId), {
      lastNotificationTimes: {
        ...userData.lastNotificationTimes,
        [place.id]: now
      }
    }, { merge: true });

  } catch (error) {
    console.error('Bildirim gönderilirken hata:', error);
  }
};

// Arka plan konum takibini başlat
export const startLocationTracking = async (userId: string) => {
  try {
    const hasPermissions = await requestLocationPermissions();
    if (!hasPermissions) return;

    // Mevcut task'i temizle
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(locationTaskName)
      .catch(() => false);
    
    if (hasStarted) {
      await Location.stopLocationUpdatesAsync(locationTaskName);
    }

    // Yeni task'i başlat
    await Location.startLocationUpdatesAsync(locationTaskName, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 300000, // 5 dakika
      distanceInterval: 100, // 100 metre
      foregroundService: {
        notificationTitle: 'Konum Takibi Aktif',
        notificationBody: 'Yakınızdaki mekanlar için konum takip ediliyor',
      },
      activityType: Location.ActivityType.Fitness,
      showsBackgroundLocationIndicator: true,
    });

    // Task tanımla
    Location.TaskManager.defineTask(locationTaskName, async ({ data, error }) => {
      if (error) return;

      const { locations } = data as { locations: Location.LocationObject[] };
      const location = locations[0];

      // Kullanıcı ayarlarını al
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      const settings = userData.notificationSettings;

      if (!settings?.enabled) return;

      // Favori mekanları kontrol et
      const favoritesDoc = await getDoc(doc(db, 'users', userId, 'favorites', 'places'));
      if (!favoritesDoc.exists()) return;

      const favorites = favoritesDoc.data();

      for (const [placeId, place] of Object.entries(favorites)) {
        const distance = calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          place.location.latitude,
          place.location.longitude
        );

        if (distance <= settings.distance) {
          await sendNotification(userId, place, distance);
        }
      }
    });

  } catch (error) {
    console.error('Konum takibi başlatılırken hata:', error);
  }
};

// Arka plan konum takibini durdur
export const stopLocationTracking = async () => {
  try {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(locationTaskName)
      .catch(() => false);
    
    if (hasStarted) {
      await Location.stopLocationUpdatesAsync(locationTaskName);
    }
  } catch (error) {
    console.error('Konum takibi durdurulurken hata:', error);
  }
};

// Favori mekanları kontrol et ve gerekirse bildirim gönder
export const checkFavoriteLocations = async (userId: string) => {
  try {
    // Kullanıcının bildirim mesafesi ayarını al
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return;
    
    const userData = userDoc.data();
    const notificationDistance = userData.notificationDistance || 1;

    // Konum izinlerini kontrol et
    const hasLocationPermission = await requestLocationPermissions();
    if (!hasLocationPermission) return;

    // Mevcut konumu al
    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    // Kullanıcının favori mekanlarını al
    const favoritesDoc = await getDoc(doc(db, 'users', userId, 'favorites', 'places'));
    if (!favoritesDoc.exists()) return;

    const favorites = favoritesDoc.data();

    // Her favori mekan için mesafeyi kontrol et
    for (const [placeId, place] of Object.entries(favorites)) {
      const distance = calculateDistance(
        latitude,
        longitude,
        place.location.latitude,
        place.location.longitude
      );

      // Belirlenen mesafe içindeyse bildirim gönder
      if (distance <= notificationDistance) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Favori Mekanınıza Yakınsınız!',
            body: `${place.name} ${distance.toFixed(1)} km uzaklıkta.`,
            data: { placeId },
          },
          trigger: null,
        });
      }
    }
  } catch (error) {
    console.error('Konum kontrolü sırasında hata:', error);
  }
}; 