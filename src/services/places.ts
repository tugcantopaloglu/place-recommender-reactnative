import { Place } from '../store/slices/placesSlice';

// Expo'da çevre değişkenlerinin güvenli bir şekilde kullanımı
const GOOGLE_PLACES_API_KEY = 'DUMMY_API_KEY'; // Gerçek uygulamada EXPO_PUBLIC_GOOGLE_PLACES_API_KEY kullanılmalıdır

export const searchPlaces = async (query: string, location?: { latitude: number; longitude: number }) => {
  try {
    const locationString = location ? `&location=${location.latitude},${location.longitude}` : '';
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        query
      )}${locationString}&key=${GOOGLE_PLACES_API_KEY}`
    );
    const data = await response.json();
    return data.results.map((place: any) => ({
      id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      location: {
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
      },
      rating: place.rating || 0,
      reviews: place.user_ratings_total || 0,
      types: place.types,
      photos: place.photos ? place.photos.map((photo: any) => 
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
      ) : [],
      isFavorite: false,
    }));
  } catch (error) {
    console.error('Error searching places:', error);
    throw error;
  }
};

export const getNearbyPlaces = async (location: { latitude: number; longitude: number }, radius: number = 1000) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.latitude},${location.longitude}&radius=${radius}&key=${GOOGLE_PLACES_API_KEY}`
    );
    const data = await response.json();
    return data.results.map((place: any) => ({
      id: place.place_id,
      name: place.name,
      address: place.vicinity,
      location: {
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
      },
      rating: place.rating || 0,
      reviews: place.user_ratings_total || 0,
      types: place.types,
      photos: place.photos ? place.photos.map((photo: any) =>
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
      ) : [],
      isFavorite: false,
    }));
  } catch (error) {
    console.error('Error getting nearby places:', error);
    throw error;
  }
};

export const getPlaceDetails = async (placeId: string) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_PLACES_API_KEY}`
    );
    const data = await response.json();
    const place = data.result;
    return {
      id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      location: {
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
      },
      rating: place.rating || 0,
      reviewsCount: place.user_ratings_total || 0,
      types: place.types,
      photos: place.photos ? place.photos.map((photo: any) =>
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
      ) : [],
      phoneNumber: place.formatted_phone_number,
      website: place.website,
      openingHours: place.opening_hours?.weekday_text || [],
      reviews: place.reviews?.map((review: any) => ({
        authorName: review.author_name,
        rating: review.rating,
        text: review.text,
        time: review.time,
      })) || [],
      priceLevel: place.price_level,
      isFavorite: false,
    };
  } catch (error) {
    console.error('Error getting place details:', error);
    throw error;
  }
}; 