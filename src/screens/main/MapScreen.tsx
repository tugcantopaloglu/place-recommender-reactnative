import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { Text } from 'react-native-elements';
import { useLocation } from '../../hooks/useLocation';
import { useTheme } from '../../context/ThemeContext';

let MapView: any;
let Marker: any;
let PROVIDER_GOOGLE: any;

if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
}

export const MapScreen: React.FC = () => {
  const { location, errorMsg } = useLocation();
  const { theme } = useTheme();
  const [region, setRegion] = useState({
    latitude: 41.0082,
    longitude: 28.9784,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    if (location) {
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, [location]);

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
        style={styles.map}
        provider={Platform.OS === 'ios' ? undefined : PROVIDER_GOOGLE}
        region={region}
        showsUserLocation
        showsMyLocationButton
        showsTraffic
        showsBuildings
        showsIndoors
        loadingEnabled
        onUserLocationChange={(event: { nativeEvent: { coordinate?: { latitude: number; longitude: number } } }) => {
          if (event.nativeEvent.coordinate) {
            const { latitude, longitude } = event.nativeEvent.coordinate;
            setRegion(prev => ({
              ...prev,
              latitude,
              longitude
            }));
          }
        }}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Buradasınız"
            description="Şu anki konumunuz"
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export default MapScreen; 