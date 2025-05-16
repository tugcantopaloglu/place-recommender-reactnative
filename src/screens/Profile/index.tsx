import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import {
  Text,
  Avatar,
  Button,
  ListItem,
  Icon,
  Card,
} from 'react-native-elements';
import { RootState } from '../../store';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const favorites = useSelector((state: RootState) => state.favorites.favorites);
  const toVisit = useSelector((state: RootState) => state.favorites.toVisit);
  const settings = useSelector((state: RootState) => state.settings);

  const renderHeader = () => (
    <View style={styles.header}>
      <Avatar
        size="xlarge"
        rounded
        source={{ uri: 'https://via.placeholder.com/150' }}
        containerStyle={styles.avatar}
      />
      <Text h3 style={[styles.name, { color: theme.colors.text }]}>
        Kullanıcı Adı
      </Text>
      <Text style={[styles.email, { color: theme.colors.text }]}>
        kullanici@email.com
      </Text>
      <Button
        title="Profili Düzenle"
        type="outline"
        containerStyle={styles.editButton}
        onPress={() => {/* Profil düzenleme navigasyonu */}}
      />
    </View>
  );

  const renderStats = () => (
    <Card containerStyle={[styles.statsCard, { backgroundColor: theme.colors.card }]}>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text h4 style={{ color: theme.colors.text }}>
            {favorites.length}
          </Text>
          <Text style={{ color: theme.colors.text }}>Favori</Text>
        </View>
        <View style={styles.statItem}>
          <Text h4 style={{ color: theme.colors.text }}>
            {toVisit.length}
          </Text>
          <Text style={{ color: theme.colors.text }}>Gidilecek</Text>
        </View>
        <View style={styles.statItem}>
          <Text h4 style={{ color: theme.colors.text }}>
            {/* Ziyaret edilen mekan sayısı */}
            15
          </Text>
          <Text style={{ color: theme.colors.text }}>Ziyaret</Text>
        </View>
      </View>
    </Card>
  );

  const renderMenuItems = () => (
    <View style={styles.menuContainer}>
      <ListItem
        containerStyle={{ backgroundColor: theme.colors.card }}
        onPress={() => navigation.navigate('Favorites' as never)}
      >
        <Icon name="heart" type="font-awesome" color={theme.colors.text} />
        <ListItem.Content>
          <ListItem.Title style={{ color: theme.colors.text }}>
            Favorilerim
          </ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>

      <ListItem
        containerStyle={{ backgroundColor: theme.colors.card }}
        onPress={() => navigation.navigate('ToVisit' as never)}
      >
        <Icon name="bookmark" type="font-awesome" color={theme.colors.text} />
        <ListItem.Content>
          <ListItem.Title style={{ color: theme.colors.text }}>
            Gidilecek Yerler
          </ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>

      <ListItem
        containerStyle={{ backgroundColor: theme.colors.card }}
        onPress={() => navigation.navigate('Settings' as never)}
      >
        <Icon name="cog" type="font-awesome" color={theme.colors.text} />
        <ListItem.Content>
          <ListItem.Title style={{ color: theme.colors.text }}>
            Ayarlar
          </ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>

      <ListItem
        containerStyle={{ backgroundColor: theme.colors.card }}
        onPress={() => {/* Çıkış işlemi */}}
      >
        <Icon name="sign-out" type="font-awesome" color={theme.colors.text} />
        <ListItem.Content>
          <ListItem.Title style={{ color: theme.colors.text }}>
            Çıkış Yap
          </ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {renderHeader()}
      {renderStats()}
      {renderMenuItems()}
    </ScrollView>
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
    marginBottom: 15,
  },
  name: {
    marginBottom: 5,
  },
  email: {
    marginBottom: 15,
    opacity: 0.8,
  },
  editButton: {
    width: 200,
  },
  statsCard: {
    margin: 15,
    borderRadius: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  menuContainer: {
    marginTop: 15,
  },
});

export default ProfileScreen; 