import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, ListItem, Tab, TabView, Icon } from 'react-native-elements';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { removeFromFavorites, removeFromToVisit } from '../../store/slices/placesSlice';
import { ScreenLayout } from '../../components/common/ScreenLayout';
import { Place } from '../../store/slices/placesSlice';

const FavoritesScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [index, setIndex] = useState(0);
  
  const favorites = useSelector((state: RootState) => state.places.favorites);
  const toVisit = useSelector((state: RootState) => state.places.toVisit);

  const handleRemove = (place: Place) => {
    if (index === 0) {
      dispatch(removeFromFavorites(place.id));
    } else {
      dispatch(removeFromToVisit(place.id));
    }
  };

  const renderItem = ({ item }: { item: Place }) => (
    <ListItem
      containerStyle={[styles.listItem, { backgroundColor: theme.colors.card }]}
      onPress={() => {
        // @ts-ignore
        navigation.navigate('PlaceDetails', { placeId: item.id });
      }}
    >
      <ListItem.Content>
        <ListItem.Title style={[styles.title, { color: theme.colors.text }]}>
          {item.name}
        </ListItem.Title>
        <ListItem.Subtitle style={[styles.subtitle, { color: theme.colors.text }]}>
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
      <TouchableOpacity
        onPress={() => handleRemove(item)}
        style={styles.removeButton}
      >
        <Icon
          type="font-awesome"
          name={index === 0 ? 'heart' : 'bookmark'}
          color={theme.colors.error}
          size={24}
        />
      </TouchableOpacity>
    </ListItem>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.colors.text }]}>
        {index === 0
          ? 'Henüz favori mekanınız yok'
          : 'Ziyaret etmek istediğiniz mekan listesi boş'}
      </Text>
    </View>
  );

  return (
    <ScreenLayout>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Tab
          value={index}
          onChange={setIndex}
          indicatorStyle={{ backgroundColor: theme.colors.primary }}
          containerStyle={{ backgroundColor: theme.colors.card }}
        >
          <Tab.Item
            title="Favoriler"
            titleStyle={{ color: theme.colors.text }}
            icon={{ name: 'heart', type: 'font-awesome', color: theme.colors.text }}
          />
          <Tab.Item
            title="Ziyaret Edilecek"
            titleStyle={{ color: theme.colors.text }}
            icon={{ name: 'bookmark', type: 'font-awesome', color: theme.colors.text }}
          />
        </Tab>

        <TabView value={index} onChange={setIndex} animationType="spring">
          <TabView.Item style={styles.tabContent}>
            <FlatList
              data={favorites}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={renderEmptyComponent}
            />
          </TabView.Item>
          <TabView.Item style={styles.tabContent}>
            <FlatList
              data={toVisit}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={renderEmptyComponent}
            />
          </TabView.Item>
        </TabView>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContent: {
    width: '100%',
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
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
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
  removeButton: {
    padding: 8,
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
});

export default FavoritesScreen; 