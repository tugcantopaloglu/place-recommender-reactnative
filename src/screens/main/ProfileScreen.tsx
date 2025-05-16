import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Avatar, Text, ListItem, Button } from 'react-native-elements';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { logout, updateUserAvatar } from '../../services/auth';
import { logout as logoutAction, updateUser } from '../../store/slices/authSlice';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { ScreenLayout } from '../../components/common/ScreenLayout';
import { MainTabParamList } from '../../navigation/types';

interface UserStats {
  favorites: number;
  visited: number;
  planned: number;
}

type ProfileScreenNavigationProp = NativeStackNavigationProp<MainTabParamList>;

const ProfileScreen = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [stats, setStats] = useState<UserStats>({
    favorites: 0,
    visited: 0,
    planned: 0,
  });
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (user?.id) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.id));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setStats({
              favorites: userData.favoritesCount || 0,
              visited: userData.visitedCount || 0,
              planned: userData.plannedCount || 0,
            });
          }
        } catch (error) {
          console.error('Kullanıcı istatistikleri alınamadı:', error);
        }
      }
    };

    fetchUserStats();
  }, [user?.id]);

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(logoutAction());
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
    }
  };

  const handleAvatarPress = async () => {
    if (!user?.id || isUpdatingAvatar) return;

    try {
      setIsUpdatingAvatar(true);
      setAvatarError(null);
      const newAvatarUrl = await updateUserAvatar(user.id);
      
      // Redux store'u güncelle
      dispatch(updateUser({ ...user, photoURL: newAvatarUrl }));
    } catch (error: any) {
      setAvatarError(error.message);
      console.error('Avatar güncellenirken hata:', error);
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  const menuItems = [
    {
      title: 'Favorilerim',
      icon: 'heart',
      onPress: () => navigation.navigate('Favorites', { filter: 'all' }),
    },
    {
      title: 'Ziyaret Edilecekler',
      icon: 'bookmark',
      onPress: () => navigation.navigate('Favorites', { filter: 'planned' }),
    },
    {
      title: 'Ziyaret Geçmişi',
      icon: 'history',
      onPress: () => navigation.navigate('Favorites', { filter: 'visited' }),
    },
    {
      title: 'Bildirim Ayarları',
      icon: 'bell',
      onPress: () => navigation.navigate('NotificationSettings'),
    },
    {
      title: isDark ? 'Açık Tema' : 'Koyu Tema',
      icon: isDark ? 'sun-o' : 'moon-o',
      onPress: toggleTheme,
    },
    {
      title: 'Çıkış Yap',
      icon: 'sign-out',
      onPress: handleLogout,
    },
  ];

  return (
    <ScreenLayout>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handleAvatarPress}
            disabled={isUpdatingAvatar}
          >
            <Avatar
              size="xlarge"
              rounded
              source={user?.photoURL ? { uri: user.photoURL } : undefined}
              icon={!user?.photoURL ? { name: 'user', type: 'font-awesome' } : undefined}
              containerStyle={[styles.avatar, { backgroundColor: theme.colors.primary }]}
            />
            {isUpdatingAvatar && (
              <View style={[styles.avatarOverlay, { backgroundColor: theme.colors.primary + '80' }]}>
                <Text style={[styles.avatarOverlayText, { color: theme.colors.text }]}>
                  Yükleniyor...
                </Text>
              </View>
            )}
          </TouchableOpacity>
          {avatarError && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {avatarError}
            </Text>
          )}
          <Text h3 style={[styles.name, { color: theme.colors.text }]}>
            {user?.name}
          </Text>
          <Text style={[styles.email, { color: theme.colors.text }]}>
            {user?.email}
          </Text>
        </View>

        <View style={styles.stats}>
          <View style={[styles.statItem, { backgroundColor: theme.colors.card }]}>
            <Text h4 style={{ color: theme.colors.text }}>{stats.favorites}</Text>
            <Text style={{ color: theme.colors.text }}>Favori</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: theme.colors.card }]}>
            <Text h4 style={{ color: theme.colors.text }}>{stats.visited}</Text>
            <Text style={{ color: theme.colors.text }}>Ziyaret</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: theme.colors.card }]}>
            <Text h4 style={{ color: theme.colors.text }}>{stats.planned}</Text>
            <Text style={{ color: theme.colors.text }}>Planlanan</Text>
          </View>
        </View>

        <View style={styles.menu}>
          {menuItems.map((item, index) => (
            <ListItem
              key={index}
              onPress={item.onPress}
              containerStyle={[
                styles.menuItem,
                { backgroundColor: theme.colors.card },
                item.title === 'Çıkış Yap' && { marginTop: 20 },
              ]}
            >
              <ListItem.Content>
                <ListItem.Title 
                  style={[
                    { color: theme.colors.text },
                    item.title === 'Çıkış Yap' && { color: theme.colors.error }
                  ]}
                >
                  {item.title}
                </ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron
                type="font-awesome"
                name={item.icon}
                color={item.title === 'Çıkış Yap' ? theme.colors.error : theme.colors.text}
                size={20}
              />
            </ListItem>
          ))}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    marginBottom: 16,
  },
  name: {
    marginBottom: 4,
  },
  email: {
    marginBottom: 16,
    opacity: 0.8,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    minWidth: 100,
  },
  menu: {
    paddingHorizontal: 16,
  },
  menuItem: {
    marginBottom: 8,
    borderRadius: 8,
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 16,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarOverlayText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },
});

export default ProfileScreen; 