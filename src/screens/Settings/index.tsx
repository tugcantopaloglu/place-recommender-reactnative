import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../../hooks/useTheme';
import {
  Text,
  Switch,
  Slider,
  Button,
  Divider,
  ListItem,
} from 'react-native-elements';
import {
  updateNotificationSettings,
  updateMapSettings,
  updateFilterSettings,
  updatePrivacySettings,
  resetSettings,
} from '../../store/slices/settingsSlice';
import { RootState } from '../../store';

const SettingsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { theme, isDark, toggleTheme } = useTheme();
  const settings = useSelector((state: RootState) => state.settings);

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
          value={settings.notificationSettings.nearbyPlaces}
          onValueChange={(value) =>
            dispatch(updateNotificationSettings({ nearbyPlaces: value }))
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
          value={settings.notificationSettings.dailyRecommendations}
          onValueChange={(value) =>
            dispatch(updateNotificationSettings({ dailyRecommendations: value }))
          }
        />
      </ListItem>
      <ListItem containerStyle={{ backgroundColor: theme.colors.card }}>
        <ListItem.Content>
          <ListItem.Title style={{ color: theme.colors.text }}>
            Minimum Puan
          </ListItem.Title>
          <Slider
            value={settings.notificationSettings.minRating}
            onValueChange={(value) =>
              dispatch(updateNotificationSettings({ minRating: value }))
            }
            minimumValue={1}
            maximumValue={5}
            step={0.5}
            thumbStyle={{ backgroundColor: theme.colors.primary }}
            trackStyle={{ backgroundColor: theme.colors.border }}
          />
          <Text style={{ color: theme.colors.text, textAlign: 'center' }}>
            {settings.notificationSettings.minRating.toFixed(1)}
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
            Harita Servisi
          </ListItem.Title>
          <ListItem.Subtitle style={{ color: theme.colors.text }}>
            Tercih ettiğiniz harita servisini seçin
          </ListItem.Subtitle>
        </ListItem.Content>
        <Button
          title={settings.mapSettings.preferredMapType === 'google' ? 'Google' : 'Apple'}
          onPress={() =>
            dispatch(
              updateMapSettings({
                preferredMapType:
                  settings.mapSettings.preferredMapType === 'google'
                    ? 'apple'
                    : 'google',
              })
            )
          }
          type="outline"
        />
      </ListItem>
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
          value={settings.mapSettings.showTraffic}
          onValueChange={(value) =>
            dispatch(updateMapSettings({ showTraffic: value }))
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
          value={settings.privacySettings.shareLocation}
          onValueChange={(value) =>
            dispatch(updatePrivacySettings({ shareLocation: value }))
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
          value={settings.privacySettings.shareVisitHistory}
          onValueChange={(value) =>
            dispatch(updatePrivacySettings({ shareVisitHistory: value }))
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
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
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
          onPress={() => dispatch(resetSettings())}
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