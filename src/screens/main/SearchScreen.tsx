import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { ListItem, Text, Icon } from 'react-native-elements';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';
import { searchPlacesWithGoogle } from '../../services/placesApi';
import { debounce } from 'lodash';
import { ScreenLayout } from '../../components/common/ScreenLayout';
import { Place } from '../../store/slices/placesSlice';
import { useDispatch, useSelector } from 'react-redux';
import { addToFavorites, removeFromFavorites, addToVisit, removeFromToVisit } from '../../store/slices/placesSlice';
import { RootState } from '../../store';

type SearchScreenNavigationProp = NativeStackNavigationProp<MainStackParamList>;

const CustomSearchBar = ({ 
  value, 
  onChangeText, 
  onClear,
  loading,
  theme
}: { 
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  loading: boolean;
  theme: any;
}) => (
  <View style={[styles.searchBarContainer, { backgroundColor: theme.colors.background }]}>
    <View style={[styles.searchInputContainer, { backgroundColor: theme.colors.card }]}>
      <Icon
        type="font-awesome"
        name="search"
        size={18}
        color={theme.colors.text}
        containerStyle={styles.searchIcon}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Mekan, yemek veya konum ara..."
        placeholderTextColor={theme.colors.text}
        style={[styles.searchInput, { color: theme.colors.text }]}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear}>
          <Icon
            type="font-awesome"
            name="times-circle"
            size={18}
            color={theme.colors.text}
          />
        </TouchableOpacity>
      )}
      {loading && (
        <ActivityIndicator 
          size="small" 
          color={theme.colors.primary}
          style={styles.loadingIndicator}
        />
      )}
    </View>
  </View>
);

const SearchScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const dispatch = useDispatch();
  const favorites = useSelector((state: RootState) => state.places.favorites);
  const toVisit = useSelector((state: RootState) => state.places.toVisit);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isInFavorites = useCallback((placeId: string) => {
    return favorites.some(place => place.id === placeId);
  }, [favorites]);

  const isInToVisit = useCallback((placeId: string) => {
    return toVisit.some(place => place.id === placeId);
  }, [toVisit]);

  const handleToggleFavorite = useCallback((place: Place, event: any) => {
    event.stopPropagation();
    if (isInFavorites(place.id)) {
      dispatch(removeFromFavorites(place.id));
    } else {
      dispatch(addToFavorites({ ...place, isFavorite: true }));
    }
  }, [dispatch, isInFavorites]);

  const handleToggleToVisit = useCallback((place: Place, event: any) => {
    event.stopPropagation();
    if (isInToVisit(place.id)) {
      dispatch(removeFromToVisit(place.id));
    } else {
      dispatch(addToVisit(place));
    }
  }, [dispatch, isInToVisit]);

  const performSearch = useCallback(async (text: string) => {
    if (text.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const searchResults = await searchPlacesWithGoogle(text);
      setResults(searchResults);
    } catch (error: any) {
      console.error('Arama yapılırken hata oluştu:', error);
      setError(error.message || 'Arama sırasında bir hata oluştu');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useCallback(
    debounce((text: string) => performSearch(text), 500),
    [performSearch]
  );

  const handleSearch = useCallback((text: string) => {
    setSearch(text);
    debouncedSearch(text);
  }, [debouncedSearch]);

  const renderActionButton = useCallback(({ 
    onPress, 
    icon, 
    isActive, 
    color = theme.colors.primary 
  }: { 
    onPress: (e: any) => void; 
    icon: string; 
    isActive: boolean; 
    color?: string;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.actionButton,
        { backgroundColor: isActive ? color + '20' : 'transparent' }
      ]}
    >
      <Icon
        type="font-awesome"
        name={icon}
        color={color}
        size={20}
      />
    </TouchableOpacity>
  ), [theme]);

  const renderItem = useCallback(({ item }: { item: Place }) => (
    <ListItem
      containerStyle={[styles.listItem, { backgroundColor: theme.colors.card }]}
      onPress={() => {
        // @ts-ignore
        navigation.navigate('PlaceDetails', { placeId: item.id });
      }}
    >
      <ListItem.Content>
        <View style={styles.titleContainer}>
          <ListItem.Title 
            style={[styles.title, { color: theme.colors.text }]}
            numberOfLines={1}
          >
            {item.name}
          </ListItem.Title>
          <View style={styles.actionButtons}>
            {renderActionButton({
              onPress: (e) => handleToggleFavorite(item, e),
              icon: isInFavorites(item.id) ? 'heart' : 'heart-o',
              isActive: isInFavorites(item.id),
              color: theme.colors.error
            })}
            {renderActionButton({
              onPress: (e) => handleToggleToVisit(item, e),
              icon: isInToVisit(item.id) ? 'bookmark' : 'bookmark-o',
              isActive: isInToVisit(item.id)
            })}
          </View>
        </View>
        <ListItem.Subtitle 
          style={[styles.subtitle, { color: theme.colors.text }]}
          numberOfLines={1}
        >
          {item.address}
        </ListItem.Subtitle>
        <View style={styles.detailsContainer}>
          <View style={styles.ratingContainer}>
            <Icon
              type="font-awesome"
              name="star"
              size={14}
              color={theme.colors.primary}
              containerStyle={styles.ratingIcon}
            />
            <Text style={[styles.ratingText, { color: theme.colors.text }]}>
              {item.rating > 0 ? `${item.rating} (${item.reviews})` : 'Değerlendirilmemiş'}
            </Text>
          </View>
          <View style={styles.categoriesContainer}>
            {item.categories?.slice(0, 3).map((category, index) => (
              <Text
                key={index}
                style={[
                  styles.category, 
                  { 
                    backgroundColor: theme.colors.primary + '20',
                    color: theme.colors.text 
                  }
                ]}
                numberOfLines={1}
              >
                {category}
              </Text>
            ))}
          </View>
        </View>
      </ListItem.Content>
    </ListItem>
  ), [theme, navigation, handleToggleFavorite, handleToggleToVisit, isInFavorites, isInToVisit, renderActionButton]);

  return (
    <ScreenLayout>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <CustomSearchBar
          value={search}
          onChangeText={handleSearch}
          onClear={() => {
            setSearch('');
            setResults([]);
          }}
          loading={loading}
          theme={theme}
        />
        {error && (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {error}
          </Text>
        )}
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                {loading ? (
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                ) : search.length > 0 ? (
                  'Sonuç bulunamadı'
                ) : (
                  'Mekan, yemek veya konum aramak için yukarıdaki arama çubuğunu kullanın'
                )}
              </Text>
            </View>
          }
        />
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBarContainer: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  listContainer: {
    padding: 10,
    flexGrow: 1,
  },
  listItem: {
    marginBottom: 8,
    borderRadius: 12,
    padding: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 20,
  },
  detailsContainer: {
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingIcon: {
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  category: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    overflow: 'hidden',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
  },
  errorText: {
    textAlign: 'center',
    padding: 10,
    fontSize: 14,
  },
});

export default SearchScreen; 