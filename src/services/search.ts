import { collection, query, where, getDocs, orderBy, limit, startAt, endAt } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Place } from '../store/slices/placesSlice';

export const searchPlaces = async (searchText: string): Promise<Place[]> => {
  try {
    const placesRef = collection(db, 'places');
    const searchTextLower = searchText.toLowerCase();
    const searchTextUpper = searchText.toLowerCase() + '\uf8ff';

    // Farklı arama kriterleri için sorgular
    const nameQuery = query(
      placesRef,
      orderBy('searchName'),
      startAt(searchTextLower),
      endAt(searchTextUpper),
      limit(5)
    );

    const categoryQuery = query(
      placesRef,
      orderBy('categories'),
      startAt(searchTextLower),
      endAt(searchTextUpper),
      limit(5)
    );

    const locationQuery = query(
      placesRef,
      orderBy('searchAddress'),
      startAt(searchTextLower),
      endAt(searchTextUpper),
      limit(5)
    );

    // Tüm sorguları paralel olarak çalıştır
    const [nameResults, categoryResults, locationResults] = await Promise.all([
      getDocs(nameQuery),
      getDocs(categoryQuery),
      getDocs(locationQuery)
    ]);

    // Sonuçları birleştir ve tekrar edenleri kaldır
    const results = new Map<string, Place>();

    const addResults = (querySnapshot: any) => {
      querySnapshot.forEach((doc: any) => {
        if (!results.has(doc.id)) {
          results.set(doc.id, {
            id: doc.id,
            ...doc.data()
          });
        }
      });
    };

    addResults(nameResults);
    addResults(categoryResults);
    addResults(locationResults);

    // Map'i diziye çevir ve puanlarına göre sırala
    return Array.from(results.values()).sort((a, b) => b.rating - a.rating);
  } catch (error) {
    console.error('Arama yapılırken hata oluştu:', error);
    return [];
  }
}; 