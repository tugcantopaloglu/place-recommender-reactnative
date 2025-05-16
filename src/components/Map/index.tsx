import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Dimensions, Platform } from 'react-native';
import { Place } from '../../store/slices/placesSlice';
import { useTheme } from '../../hooks/useTheme';
import { Text } from 'react-native-elements';

let MapView: any;
let Marker: any;
let PROVIDER_GOOGLE: any;

// Web platformunda react-native-maps'i import etme
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
}

interface MapComponentProps {
  places: Place[];
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  onMarkerPress?: (place: Place) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({
  places,
  initialRegion = {
    latitude: 41.0082,
    longitude: 28.9784,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  onMarkerPress,
}) => {
  const mapRef = useRef<any>(null);
  const { theme } = useTheme();
  const [region, setRegion] = useState(initialRegion);

  useEffect(() => {
    if (places.length > 0) {
      fitToMarkers();
    }
  }, [places]);

  const fitToMarkers = () => {
    if (mapRef.current && places.length > 0 && Platform.OS !== 'web') {
      mapRef.current.fitToCoordinates(
        places.map((place) => ({
          latitude: place.location.latitude,
          longitude: place.location.longitude,
        })),
        {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        }
      );
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.colors.text }}>
          Harita görünümü web platformunda kullanılamıyor.
        </Text>
        <Text style={{ color: theme.colors.text, marginTop: 8 }}>
          Lütfen mobil uygulamayı kullanın.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {places.map((place) => (
          <Marker
            key={place.id}
            coordinate={{
              latitude: place.location.latitude,
              longitude: place.location.longitude,
            }}
            title={place.name}
            description={`${place.rating} ★ (${place.reviews} değerlendirme)`}
            onPress={() => onMarkerPress?.(place)}
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: Dimensions.get('window').width,
    height: '100%',
  },
});

export default MapComponent; 