import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Input } from '@rneui/themed';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { loginSuccess } from '../../store/slices/authSlice';
import { CustomStatusBar } from '../../components/common/CustomStatusBar';
import { registerWithEmail } from '../../services/auth';

interface RegisterScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const { theme } = useTheme();

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Lütfen tüm alanları doldurun');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return false;
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    
    try {
      const userData = await registerWithEmail(email, password, name);
      dispatch(loginSuccess(userData));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <CustomStatusBar />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            <Input
              placeholder="Ad Soyad"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setError('');
              }}
              leftIcon={<FontAwesome name="user" size={24} color={theme.colors.text} />}
              errorMessage={error}
              inputStyle={{ color: theme.colors.text }}
              placeholderTextColor={theme.colors.text}
              containerStyle={styles.inputContainer}
            />
            <Input
              placeholder="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError('');
              }}
              leftIcon={<FontAwesome name="envelope" size={24} color={theme.colors.text} />}
              autoCapitalize="none"
              keyboardType="email-address"
              errorMessage={error}
              inputStyle={{ color: theme.colors.text }}
              placeholderTextColor={theme.colors.text}
              containerStyle={styles.inputContainer}
            />
            <Input
              placeholder="Şifre"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError('');
              }}
              leftIcon={<FontAwesome name="lock" size={24} color={theme.colors.text} />}
              secureTextEntry
              errorMessage={error}
              inputStyle={{ color: theme.colors.text }}
              placeholderTextColor={theme.colors.text}
              containerStyle={styles.inputContainer}
            />
            <Input
              placeholder="Şifre Tekrar"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setError('');
              }}
              leftIcon={<FontAwesome name="lock" size={24} color={theme.colors.text} />}
              secureTextEntry
              errorMessage={error}
              inputStyle={{ color: theme.colors.text }}
              placeholderTextColor={theme.colors.text}
              containerStyle={styles.inputContainer}
            />
            <Button
              title="Kayıt Ol"
              onPress={handleRegister}
              loading={loading}
              buttonStyle={[styles.button, { backgroundColor: theme.colors.primary }]}
              containerStyle={styles.buttonContainer}
              raised
            />
            <Button
              title="Zaten hesabın var mı? Giriş yap"
              onPress={() => navigation.navigate('Login')}
              type="clear"
              titleStyle={{ color: theme.colors.primary }}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    marginTop: Platform.OS === 'ios' ? -40 : 0,
  },
  inputContainer: {
    paddingHorizontal: 0,
    marginBottom: 10,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonContainer: {
    marginVertical: 10,
    borderRadius: 8,
  },
}); 