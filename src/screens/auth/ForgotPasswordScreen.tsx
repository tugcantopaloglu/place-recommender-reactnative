import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Input, Text } from '@rneui/themed';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { CustomStatusBar } from '../../components/common/CustomStatusBar';
import { resetPassword } from '../../services/auth';

interface ForgotPasswordScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { theme } = useTheme();

  const handleResetPassword = async () => {
    if (!email) {
      setError('Lütfen email adresinizi girin');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await resetPassword(email);
      setSuccess(true);
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
            {success ? (
              <View style={styles.successContainer}>
                <FontAwesome name="check-circle" size={64} color={theme.colors.success} />
                <Text h4 style={[styles.successTitle, { color: theme.colors.text }]}>
                  Email Gönderildi
                </Text>
                <Text style={[styles.successText, { color: theme.colors.text }]}>
                  Şifre sıfırlama bağlantısı email adresinize gönderildi.
                  Lütfen email'inizi kontrol edin.
                </Text>
                <Button
                  title="Giriş Ekranına Dön"
                  onPress={() => navigation.navigate('Login')}
                  buttonStyle={[styles.button, { backgroundColor: theme.colors.primary }]}
                  containerStyle={styles.buttonContainer}
                  raised
                />
              </View>
            ) : (
              <>
                <Text h4 style={[styles.title, { color: theme.colors.text }]}>
                  Şifremi Unuttum
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.text }]}>
                  Şifrenizi sıfırlamak için kayıtlı email adresinizi girin.
                  Size şifre sıfırlama bağlantısı göndereceğiz.
                </Text>
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
                <Button
                  title="Şifremi Sıfırla"
                  onPress={handleResetPassword}
                  loading={loading}
                  buttonStyle={[styles.button, { backgroundColor: theme.colors.primary }]}
                  containerStyle={styles.buttonContainer}
                  raised
                />
                <Button
                  title="Giriş Ekranına Dön"
                  onPress={() => navigation.navigate('Login')}
                  type="clear"
                  titleStyle={{ color: theme.colors.primary }}
                />
              </>
            )}
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
  },
  title: {
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.8,
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
  successContainer: {
    alignItems: 'center',
    padding: 20,
  },
  successTitle: {
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  successText: {
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.8,
  },
}); 