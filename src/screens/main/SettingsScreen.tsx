import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, ListItem, Switch, Slider, Button, Divider } from 'react-native-elements';
import { useTheme } from '../../context/ThemeContext';

interface NotificationSettings {
  nearbyPlaces: boolean;
  dailyRecommendations: boolean;
  minRating: number;
  maxDistance: number;
}

interface MapSettings {
  showTraffic: boolean;
  clusterMarkers: boolean;
}

interface PrivacySettings {
  shareLocation: boolean;
  shareVisitHistory: boolean;
  shareFavorites: boolean;
}

const SettingsScreen = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    nearbyPlaces: true,
    dailyRecommendations: true,
    minRating: 4.0,
    maxDistance: 1.0,
  });
  const [mapSettings, setMapSettings] = useState<MapSettings>({
    showTraffic: false,
    clusterMarkers: true,
  });
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    shareLocation: true,
    shareVisitHistory: true,
    shareFavorites: true,
  });

  const renderNotificationSettings = () => (
    <View style={styles.section}>
      <Text h4 style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Bildirim Ayarları
      </Text>
      <ListItem containerStyle={{ backgroundColor: theme.colors.card }}>
        <ListItem.Content>
          <ListItem.Title style={{ color: theme.colors.text }}>
            Yakındaki Mekanlar
          </ListItem.Title>
          <ListItem.Subtitle style={{ color: theme.colors.text }}>
            Yakınınızdaki mekanlar için bildirim alın
          </ListItem.Subtitle>
        </ListItem.Content>
        <Switch
          value={notificationSettings.nearbyPlaces}
          onValueChange={(value) =>
            setNotificationSettings({ ...notificationSettings, nearbyPlaces: value })
          }
        />
      </ListItem>
      <ListItem containerStyle={{ backgroundColor: theme.colors.card }}>
        <ListItem.Content>
          <ListItem.Title style={{ color: theme.colors.text }}>
            Günlük Öneriler
          </ListItem.Title>
          <ListItem.Subtitle style={{ color: theme.colors.text }}>
            Her gün size özel mekan önerileri alın
          </ListItem.Subtitle>
        </ListItem.Content>
        <Switch
          value={notificationSettings.dailyRecommendations}
          onValueChange={(value) =>
            setNotificationSettings({ ...notificationSettings, dailyRecommendations: value })
          }
        />
      </ListItem>
      <ListItem containerStyle={{ backgroundColor: theme.colors.card }}>
        <ListItem.Content>
          <ListItem.Title style={{ color: theme.colors.text }}>
            Minimum Puan
          </ListItem.Title>
          <Slider
            value={notificationSettings.minRating}
            onValueChange={(value) =>
              setNotificationSettings({ ...notificationSettings, minRating: value })
            }
            minimumValue={1}
            maximumValue={5}
            step={0.5}
            thumbStyle={{ backgroundColor: theme.colors.primary }}
            trackStyle={{ backgroundColor: theme.colors.border }}
          />
          <Text style={{ color: theme.colors.text, textAlign: 'center' }}>
            {notificationSettings.minRating.toFixed(1)}
          </Text>
        </ListItem.Content>
      </ListItem>
      <ListItem containerStyle={{ backgroundColor: theme.colors.card }}>
        <ListItem.Content>
          <ListItem.Title style={{ color: theme.colors.text }}>
            Maksimum Mesafe (km)
          </ListItem.Title>
          <Slider
            value={notificationSettings.maxDistance}
            onValueChange={(value) =>
              setNotificationSettings({ ...notificationSettings, maxDistance: value })
            }
            minimumValue={0.5}
            maximumValue={5}
            step={0.5}
            thumbStyle={{ backgroundColor: theme.colors.primary }}
            trackStyle={{ backgroundColor: theme.colors.border }}
          />
          <Text style={{ color: theme.colors.text, textAlign: 'center' }}>
            {notificationSettings.maxDistance.toFixed(1)} km
          </Text>
        </ListItem.Content>
      </ListItem>
    </View>
  );

  const renderMapSettings = () => (
    <View style={styles.section}>
      <Text h4 style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Harita Ayarları
      </Text>
      <ListItem containerStyle={{ backgroundColor: theme.colors.card }}>
        <ListItem.Content>
          <ListItem.Title style={{ color: theme.colors.text }}>
            Trafik Bilgisi
          </ListItem.Title>
          <ListItem.Subtitle style={{ color: theme.colors.text }}>
            Haritada trafik durumunu göster
          </ListItem.Subtitle>
        </ListItem.Content>
        <Switch
          value={mapSettings.showTraffic}
          onValueChange={(value) =>
            setMapSettings({ ...mapSettings, showTraffic: value })
          }
        />
      </ListItem>
      <ListItem containerStyle={{ backgroundColor: theme.colors.card }}>
        <ListItem.Content>
          <ListItem.Title style={{ color: theme.colors.text }}>
            Mekanları Grupla
          </ListItem.Title>
          <ListItem.Subtitle style={{ color: theme.colors.text }}>
            Yakın mekanları haritada grupla
          </ListItem.Subtitle>
        </ListItem.Content>
        <Switch
          value={mapSettings.clusterMarkers}
          onValueChange={(value) =>
            setMapSettings({ ...mapSettings, clusterMarkers: value })
          }
        />
      </ListItem>
    </View>
  );

  const renderPrivacySettings = () => (
    <View style={styles.section}>
      <Text h4 style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Gizlilik Ayarları
      </Text>
      <ListItem containerStyle={{ backgroundColor: theme.colors.card }}>
        <ListItem.Content>
          <ListItem.Title style={{ color: theme.colors.text }}>
            Konum Paylaşımı
          </ListItem.Title>
          <ListItem.Subtitle style={{ color: theme.colors.text }}>
            Konumunuzu daha iyi öneriler için paylaşın
          </ListItem.Subtitle>
        </ListItem.Content>
        <Switch
          value={privacySettings.shareLocation}
          onValueChange={(value) =>
            setPrivacySettings({ ...privacySettings, shareLocation: value })
          }
        />
      </ListItem>
      <ListItem containerStyle={{ backgroundColor: theme.colors.card }}>
        <ListItem.Content>
          <ListItem.Title style={{ color: theme.colors.text }}>
            Ziyaret Geçmişi
          </ListItem.Title>
          <ListItem.Subtitle style={{ color: theme.colors.text }}>
            Ziyaret ettiğiniz yerleri paylaşın
          </ListItem.Subtitle>
        </ListItem.Content>
        <Switch
          value={privacySettings.shareVisitHistory}
          onValueChange={(value) =>
            setPrivacySettings({ ...privacySettings, shareVisitHistory: value })
          }
        />
      </ListItem>
      <ListItem containerStyle={{ backgroundColor: theme.colors.card }}>
        <ListItem.Content>
          <ListItem.Title style={{ color: theme.colors.text }}>
            Favori Mekanlar
          </ListItem.Title>
          <ListItem.Subtitle style={{ color: theme.colors.text }}>
            Favori mekanlarınızı paylaşın
          </ListItem.Subtitle>
        </ListItem.Content>
        <Switch
          value={privacySettings.shareFavorites}
          onValueChange={(value) =>
            setPrivacySettings({ ...privacySettings, shareFavorites: value })
          }
        />
      </ListItem>
    </View>
  );

  const renderAppearanceSettings = () => (
    <View style={styles.section}>
      <Text h4 style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Görünüm Ayarları
      </Text>
      <ListItem containerStyle={{ backgroundColor: theme.colors.card }}>
        <ListItem.Content>
          <ListItem.Title style={{ color: theme.colors.text }}>
            Karanlık Tema
          </ListItem.Title>
          <ListItem.Subtitle style={{ color: theme.colors.text }}>
            Uygulamanın karanlık temasını kullanın
          </ListItem.Subtitle>
        </ListItem.Content>
        <Switch value={isDark} onValueChange={toggleTheme} />
      </ListItem>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderNotificationSettings()}
      <Divider style={styles.divider} />
      {renderMapSettings()}
      <Divider style={styles.divider} />
      {renderPrivacySettings()}
      <Divider style={styles.divider} />
      {renderAppearanceSettings()}
      <View style={styles.resetContainer}>
        <Button
          title="Ayarları Sıfırla"
          onPress={() => {
            // TODO: Ayarları varsayılana sıfırla
          }}
          type="outline"
          buttonStyle={styles.resetButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  divider: {
    height: 8,
    opacity: 0.1,
  },
  resetContainer: {
    padding: 16,
    alignItems: 'center',
  },
  resetButton: {
    width: 200,
  },
});

export default SettingsScreen; 