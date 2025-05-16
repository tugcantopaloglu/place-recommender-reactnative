import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { Text, Slider, Divider } from 'react-native-elements';
import { useTheme } from '../../context/ThemeContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { ScreenLayout } from '../../components/common/ScreenLayout';
import { startLocationTracking, stopLocationTracking } from '../../services/notifications';

interface NotificationSettings {
  distance: number;
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  minTimeBetweenNotifications: number; // dakika cinsinden
}

const NotificationSettings = () => {
  const { theme } = useTheme();
  const user = useSelector((state: RootState) => state.auth.user);
  const [settings, setSettings] = useState<NotificationSettings>({
    distance: 1,
    enabled: true,
    sound: true,
    vibration: true,
    minTimeBetweenNotifications: 30,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      if (user?.id) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.id));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.notificationSettings) {
              setSettings(userData.notificationSettings);
              
              // Bildirimleri etkinleştir/devre dışı bırak
              if (userData.notificationSettings.enabled) {
                await startLocationTracking(user.id);
              } else {
                await stopLocationTracking();
              }
            }
          }
        } catch (error) {
          console.error('Ayarlar alınamadı:', error);
        }
      }
    };

    fetchSettings();
  }, [user?.id]);

  const saveSettings = async (newSettings: Partial<NotificationSettings>) => {
    if (user?.id && !isSaving) {
      setIsSaving(true);
      try {
        const updatedSettings = { ...settings, ...newSettings };
        setSettings(updatedSettings);
        
        await setDoc(doc(db, 'users', user.id), {
          notificationSettings: updatedSettings
        }, { merge: true });

        // Bildirimleri etkinleştir/devre dışı bırak
        if (updatedSettings.enabled) {
          await startLocationTracking(user.id);
        } else {
          await stopLocationTracking();
        }
      } catch (error) {
        console.error('Ayarlar kaydedilemedi:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <ScreenLayout>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={[styles.switchText, { color: theme.colors.text }]}>
              Bildirimleri Etkinleştir
            </Text>
            <Switch
              value={settings.enabled}
              onValueChange={(value) => saveSettings({ enabled: value })}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>

          <Divider style={styles.divider} />

          <Text h4 style={[styles.title, { color: theme.colors.text }]}>
            Bildirim Mesafesi
          </Text>
          <Text style={[styles.description, { color: theme.colors.text }]}>
            Favori mekanlarınıza ne kadar yaklaştığınızda bildirim almak istediğinizi seçin
          </Text>
          <View style={styles.sliderContainer}>
            <Slider
              value={settings.distance}
              onValueChange={(value) => saveSettings({ distance: value })}
              minimumValue={1}
              maximumValue={5}
              step={1}
              thumbStyle={{ backgroundColor: theme.colors.primary }}
              trackStyle={{ height: 4 }}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={theme.colors.border}
              disabled={!settings.enabled}
            />
            <Text style={[styles.distanceText, { color: theme.colors.text }]}>
              {settings.distance} km
            </Text>
          </View>

          <Divider style={styles.divider} />

          <Text h4 style={[styles.title, { color: theme.colors.text }]}>
            Bildirim Sıklığı
          </Text>
          <Text style={[styles.description, { color: theme.colors.text }]}>
            Aynı mekan için en az ne kadar sürede bir bildirim almak istediğinizi seçin
          </Text>
          <View style={styles.sliderContainer}>
            <Slider
              value={settings.minTimeBetweenNotifications}
              onValueChange={(value) => saveSettings({ minTimeBetweenNotifications: value })}
              minimumValue={15}
              maximumValue={120}
              step={15}
              thumbStyle={{ backgroundColor: theme.colors.primary }}
              trackStyle={{ height: 4 }}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={theme.colors.border}
              disabled={!settings.enabled}
            />
            <Text style={[styles.distanceText, { color: theme.colors.text }]}>
              {settings.minTimeBetweenNotifications} dakika
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.switchRow}>
            <Text style={[styles.switchText, { color: theme.colors.text }]}>
              Bildirim Sesi
            </Text>
            <Switch
              value={settings.sound}
              onValueChange={(value) => saveSettings({ sound: value })}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              disabled={!settings.enabled}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={[styles.switchText, { color: theme.colors.text }]}>
              Titreşim
            </Text>
            <Switch
              value={settings.vibration}
              onValueChange={(value) => saveSettings({ vibration: value })}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              disabled={!settings.enabled}
            />
          </View>

          {isSaving && (
            <Text style={[styles.savingText, { color: theme.colors.text }]}>
              Kaydediliyor...
            </Text>
          )}
        </View>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 16,
    opacity: 0.8,
  },
  sliderContainer: {
    marginTop: 16,
  },
  distanceText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  savingText: {
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  switchText: {
    fontSize: 16,
  },
  divider: {
    marginVertical: 16,
  },
});

export default NotificationSettings; 