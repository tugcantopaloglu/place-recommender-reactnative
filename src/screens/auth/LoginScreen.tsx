import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { Button, Input, Divider, Text } from '@rneui/themed';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { loginSuccess, loginFailure } from '../../store/slices/authSlice';
import { CustomStatusBar } from '../../components/common/CustomStatusBar';
import { loginWithEmail, signInWithGoogle } from '../../services/auth';

interface LoginScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const { theme } = useTheme();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const userData = await loginWithEmail(email, password);
      dispatch(loginSuccess(userData));
    } catch (err: any) {
      setError(err.message);
      dispatch(loginFailure(err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const userData = await signInWithGoogle();
      dispatch(loginSuccess(userData));
    } catch (err: any) {
      setError(err.message);
      dispatch(loginFailure(err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
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
            <Button
              title="Giriş Yap"
              onPress={handleLogin}
              loading={loading}
              buttonStyle={[styles.button, { backgroundColor: theme.colors.primary }]}
              containerStyle={styles.buttonContainer}
              raised
            />
            <Button
              title="Hesabın yok mu? Kayıt ol"
              onPress={() => navigation.navigate('Register')}
              type="clear"
              titleStyle={{ color: theme.colors.primary }}
            />
            <Button
              title="Şifremi Unuttum"
              onPress={handleForgotPassword}
              type="clear"
              titleStyle={{ color: theme.colors.primary }}
              containerStyle={styles.forgotPasswordButton}
            />
            <View style={styles.dividerContainer}>
              <Divider style={[styles.divider, { backgroundColor: theme.colors.text }]} />
              <Text style={[styles.dividerText, { color: theme.colors.text }]}>veya</Text>
              <Divider style={[styles.divider, { backgroundColor: theme.colors.text }]} />
            </View>

            <Button
              title="Google ile Giriş Yap"
              onPress={handleGoogleLogin}
              icon={
                <FontAwesome
                  name="google"
                  size={20}
                  color="white"
                  style={styles.googleIcon}
                />
              }
              buttonStyle={[styles.googleButton, { backgroundColor: '#DB4437' }]}
              containerStyle={styles.buttonContainer}
              raised
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
  forgotPasswordButton: {
    marginBottom: 10,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 10,
  },
  googleButton: {
    paddingVertical: 12,
    borderRadius: 8,
  },
  googleIcon: {
    marginRight: 10,
  },
}); 