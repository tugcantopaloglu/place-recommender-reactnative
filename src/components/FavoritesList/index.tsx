import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Place } from '../../store/slices/placesSlice';
import { toggleFavorite, toggleToVisit } from '../../store/slices/favoritesSlice';
import { RootState } from '../../store';
import { useTheme } from '../../hooks/useTheme';
import { Text, Card, Button, Icon } from 'react-native-elements';

interface FavoritesListProps {
  type: 'favorites' | 'toVisit';
  onPlacePress?: (place: Place) => void;
}

const FavoritesList: React.FC<FavoritesListProps> = ({ type, onPlacePress }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const places = useSelector((state: RootState) => 
    type === 'favorites' ? state.favorites.favorites : state.favorites.toVisit
  );

  const handleToggle = (place: Place) => {
    if (type === 'favorites') {
      dispatch(toggleFavorite(place));
    } else {
      dispatch(toggleToVisit(place));
    }
  };

  const renderItem = ({ item }: { item: Place }) => (
    <Card containerStyle={[styles.card, { backgroundColor: theme.colors.card }]}>
      <TouchableOpacity onPress={() => onPlacePress?.(item)}>
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {item.name}
            </Text>
            <Button
              type="clear"
              icon={
                <Icon
                  name={type === 'favorites' ? 'heart' : 'bookmark'}
                  type="font-awesome"
                  color={theme.colors.primary}
                  size={24}
                />
              }
              onPress={() => handleToggle(item)}
            />
          </View>
          <Text style={[styles.rating, { color: theme.colors.text }]}>
            {item.rating} ★ ({item.reviews} değerlendirme)
          </Text>
          <Text style={[styles.address, { color: theme.colors.text }]}>
            {item.address}
          </Text>
        </View>
      </TouchableOpacity>
    </Card>
  );

  return (
    <FlatList
      data={places}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            {type === 'favorites' 
              ? 'Henüz favori mekan eklemediniz'
              : 'Gidilecek mekan listeniz boş'}
          </Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
  },
  cardContent: {
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  rating: {
    fontSize: 14,
  },
  address: {
    fontSize: 14,
    opacity: 0.8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default FavoritesList; 