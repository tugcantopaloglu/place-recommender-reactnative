import { Place } from '../store/slices/placesSlice';

// Expo'da çevre değişkenlerinin güvenli bir şekilde kullanımı
const GOOGLE_PLACES_API_KEY = 'DUMMY_API_KEY'; // Gerçek uygulamada EXPO_PUBLIC_GOOGLE_PLACES_API_KEY kullanılmalıdır
const GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place';

export const searchPlacesWithGoogle = async (query: string): Promise<Place[]> => {
  try {
    // Text Search API endpoint
    const url = `${GOOGLE_PLACES_BASE_URL}/textsearch/json?query=${encodeURIComponent(query)}&language=tr&region=tr&key=${GOOGLE_PLACES_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(data.error_message || 'Google Places API hatası');
    }

    // Google Places sonuçlarını uygulama formatına dönüştür
    return data.results.map((result: any) => ({
      id: result.place_id,
      name: result.name,
      address: result.formatted_address,
      location: {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
      },
      rating: result.rating || 0,
      reviews: result.user_ratings_total || 0,
      categories: result.types || [],
      types: result.types || [],
      photos: result.photos ? [`${GOOGLE_PLACES_BASE_URL}/photo?maxwidth=400&photoreference=${result.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`] : [],
      priceLevel: result.price_level,
      isFavorite: false
    }));
  } catch (error) {
    console.error('Google Places araması sırasında hata:', error);
    throw error;
  }
};

export const getPlaceDetails = async (placeId: string): Promise<Place> => {
  try {
    // Place Details API endpoint
    const url = `${GOOGLE_PLACES_BASE_URL}/details/json?place_id=${placeId}&language=tr&key=${GOOGLE_PLACES_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(data.error_message || 'Google Places API hatası');
    }

    const result = data.result;
    
    return {
      id: result.place_id,
      name: result.name,
      address: result.formatted_address,
      location: {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
      },
      rating: result.rating || 0,
      reviews: result.user_ratings_total || 0,
      categories: result.types || [],
      types: result.types || [],
      photos: result.photos?.map((photo: any) => 
        `${GOOGLE_PLACES_BASE_URL}/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
      ) || [],
      priceLevel: result.price_level,
      isFavorite: false
    };
  } catch (error) {
    console.error('Mekan detayları alınırken hata:', error);
    throw error;
  }
}; 