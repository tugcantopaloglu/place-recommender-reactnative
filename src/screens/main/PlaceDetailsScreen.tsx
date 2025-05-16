import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { Text, Button, Icon, Image, Divider } from 'react-native-elements';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';

let MapView: any;
let Marker: any;
let PROVIDER_GOOGLE: any;

if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
}

interface Place {
  id: string;
  name: string;
  address: string;
  description: string;
  rating: number;
  reviews: number;
  photos: string[];
  location: {
    latitude: number;
    longitude: number;
  };
  isFavorite: boolean;
  isToVisit: boolean;
  priceLevel: number;
  openingHours: string[];
  phoneNumber?: string;
  website?: string;
}

const { width } = Dimensions.get('window');

const PlaceDetailsScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const [place, setPlace] = useState<Place | null>(null);

  // TODO: placeId'ye göre mekan bilgilerini getir
  // const { placeId } = route.params;

  const renderPriceLevel = (level: number) => {
    return '₺'.repeat(level);
  };

  const handleFavorite = () => {
    // TODO: Favori işlemlerini gerçekleştir
  };

  const handleToVisit = () => {
    // TODO: Ziyaret listesi işlemlerini gerçekleştir
  };

  if (!place) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView horizontal pagingEnabled style={styles.imageContainer}>
        {place.photos.map((photo, index) => (
          <Image
            key={index}
            source={{ uri: photo }}
            style={styles.image}
            PlaceholderContent={<Icon name="image" type="font-awesome" />}
          />
        ))}
      </ScrollView>

      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text h4 style={[styles.title, { color: theme.colors.text }]}>
              {place.name}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.text }]}>
              {place.address}
            </Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity onPress={handleFavorite} style={styles.actionButton}>
              <Icon
                type="font-awesome"
                name={place.isFavorite ? 'heart' : 'heart-o'}
                color={theme.colors.primary}
                size={24}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleToVisit} style={styles.actionButton}>
              <Icon
                type="font-awesome"
                name={place.isToVisit ? 'bookmark' : 'bookmark-o'}
                color={theme.colors.primary}
                size={24}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Icon type="font-awesome" name="star" color={theme.colors.text} size={16} />
            <Text style={[styles.infoText, { color: theme.colors.text }]}>
              {place.rating} ({place.reviews} değerlendirme)
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Icon type="font-awesome" name="money" color={theme.colors.text} size={16} />
            <Text style={[styles.infoText, { color: theme.colors.text }]}>
              {renderPriceLevel(place.priceLevel)}
            </Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Açıklama</Text>
        <Text style={[styles.description, { color: theme.colors.text }]}>
          {place.description}
        </Text>

        <Divider style={styles.divider} />

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Çalışma Saatleri</Text>
        {place.openingHours.map((hour, index) => (
          <Text key={index} style={[styles.hourText, { color: theme.colors.text }]}>
            {hour}
          </Text>
        ))}

        <Divider style={styles.divider} />

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Konum</Text>
        <View style={styles.mapContainer}>
          {Platform.OS === 'web' ? (
            <View style={[styles.mapContainer, { justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ color: theme.colors.text }}>
                Harita görünümü web platformunda kullanılamıyor.
              </Text>
              <Text style={{ color: theme.colors.text, marginTop: 8 }}>
                Lütfen mobil uygulamayı kullanın.
              </Text>
            </View>
          ) : (
            <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: place.location.latitude,
                longitude: place.location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: place.location.latitude,
                  longitude: place.location.longitude,
                }}
                title={place.name}
                description={place.address}
              />
            </MapView>
          )}
        </View>

        {(place.phoneNumber || place.website) && (
          <>
            <Divider style={styles.divider} />
            <View style={styles.contactContainer}>
              {place.phoneNumber && (
                <Button
                  title="Ara"
                  icon={{ name: 'phone', type: 'font-awesome', color: 'white' }}
                  buttonStyle={[styles.contactButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => {/* TODO: Arama işlemi */}}
                />
              )}
              {place.website && (
                <Button
                  title="Web Sitesi"
                  icon={{ name: 'globe', type: 'font-awesome', color: 'white' }}
                  buttonStyle={[styles.contactButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => {/* TODO: Web sitesini aç */}}
                />
              )}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    height: 250,
  },
  image: {
    width,
    height: 250,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    marginLeft: 4,
    fontSize: 16,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  hourText: {
    fontSize: 16,
    marginBottom: 4,
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  contactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  contactButton: {
    paddingHorizontal: 32,
  },
});

export default PlaceDetailsScreen; 