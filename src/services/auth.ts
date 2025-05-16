import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import * as Google from 'expo-auth-session/providers/google';
import { maybeCompleteAuthSession } from 'expo-web-browser';

// Web tarayıcı oturumunu tamamla
maybeCompleteAuthSession();

export interface UserData {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastLoginAt: string;
  photoURL?: string;
}

// Google ile giriş yapma fonksiyonu
export const signInWithGoogle = async (): Promise<UserData> => {
  try {
    // Google OAuth yapılandırması
    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
      clientId: process.env.EXPO_PUBLIC_FIREBASE_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_FIREBASE_IOS_CLIENT_ID,
      androidClientId: process.env.EXPO_PUBLIC_FIREBASE_ANDROID_CLIENT_ID,
    });

    // Google oturum açma isteğini başlat
    const result = await promptAsync();
    
    if (result?.type === 'success') {
      // Google kimlik bilgilerini al
      const { id_token } = result.params;
      
      // Firebase kimlik bilgilerini oluştur
      const credential = GoogleAuthProvider.credential(id_token);
      
      // Firebase'de oturum aç
      const userCredential = await signInWithCredential(auth, credential);
      const { user } = userCredential;

      const now = new Date().toISOString();

      // Kullanıcı verilerini hazırla
      const userData: UserData = {
        id: user.uid,
        email: user.email || '',
        name: user.displayName || '',
        photoURL: user.photoURL || undefined,
        createdAt: user.metadata.creationTime || now,
        lastLoginAt: now,
      };

      // Kullanıcı Firestore'da var mı kontrol et
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Yeni kullanıcıyı Firestore'a kaydet
        await setDoc(doc(db, 'users', user.uid), userData);
      } else {
        // Son giriş zamanını güncelle
        await setDoc(doc(db, 'users', user.uid), {
          lastLoginAt: now,
        }, { merge: true });
      }

      return userData;
    } else {
      throw new Error('Google ile giriş başarısız oldu');
    }
  } catch (error: any) {
    console.error('Google ile giriş yaparken hata:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

export const loginWithEmail = async (email: string, password: string): Promise<UserData> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;

    const now = new Date().toISOString();
    
    // Kullanıcı bilgilerini Firestore'dan al veya oluştur
    const userData: UserData = {
      id: user.uid,
      email: user.email || '',
      name: user.displayName || '',
      photoURL: user.photoURL || generateAvatarUrl(user.uid), // Eğer avatar yoksa yeni oluştur
      createdAt: user.metadata.creationTime || now,
      lastLoginAt: now,
    };

    // Son giriş zamanını güncelle
    await setDoc(doc(db, 'users', user.uid), {
      ...userData,
      lastLoginAt: now,
    }, { merge: true });

    return userData;
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

export const registerWithEmail = async (
  email: string, 
  password: string, 
  name: string
): Promise<UserData> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;

    // Rastgele avatar oluştur
    const avatarUrl = generateAvatarUrl(user.uid);

    // Kullanıcı profilini güncelle
    await updateProfile(user, {
      displayName: name,
      photoURL: avatarUrl
    });

    const now = new Date().toISOString();

    // Kullanıcı verilerini Firestore'a kaydet
    const userData: UserData = {
      id: user.uid,
      email: user.email || '',
      name: name,
      photoURL: avatarUrl,
      createdAt: now,
      lastLoginAt: now,
    };

    await setDoc(doc(db, 'users', user.uid), userData);

    return userData;
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Geçersiz email adresi';
    case 'auth/user-disabled':
      return 'Bu hesap devre dışı bırakılmış';
    case 'auth/user-not-found':
      return 'Bu email adresi ile kayıtlı kullanıcı bulunamadı';
    case 'auth/wrong-password':
      return 'Hatalı şifre';
    case 'auth/email-already-in-use':
      return 'Bu email adresi zaten kullanımda';
    case 'auth/operation-not-allowed':
      return 'Bu işlem şu anda kullanılamıyor';
    case 'auth/weak-password':
      return 'Şifre çok zayıf';
    case 'auth/popup-closed-by-user':
      return 'Google giriş penceresi kapatıldı';
    case 'auth/cancelled-popup-request':
      return 'İşlem iptal edildi';
    case 'auth/account-exists-with-different-credential':
      return 'Bu email adresi başka bir giriş yöntemi ile kayıtlı';
    default:
      return 'Bir hata oluştu. Lütfen tekrar deneyin.';
  }
};

// Rastgele avatar URL'si oluştur
export const generateAvatarUrl = (seed: string) => {
  // Lorelei stili ile minimalistik hayvan avatarı oluştur
  return `https://api.dicebear.com/7.x/lorelei/png?seed=${seed}-${Date.now()}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&radius=50`;
};

// Profil fotoğrafını güncelle
export const updateUserAvatar = async (userId: string): Promise<string> => {
  try {
    // Kullanıcı dokümanını al
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('Kullanıcı bulunamadı');
    }

    const userData = userDoc.data();
    const lastAvatarUpdate = userData.lastAvatarUpdate?.toMillis() || 0;
    const now = Date.now();
    const timeDiff = (now - lastAvatarUpdate) / (1000 * 60); // dakika cinsinden

    // Son güncellemeden bu yana 15 dakika geçmediyse hata döndür
    if (timeDiff < 15) {
      const remainingTime = Math.ceil(15 - timeDiff);
      throw new Error(`Profil fotoğrafını ${remainingTime} dakika sonra tekrar değiştirebilirsiniz.`);
    }

    // Yeni avatar URL'si oluştur
    const newAvatarUrl = generateAvatarUrl(userId);

    // Firebase Auth profilini güncelle
    const user = auth.currentUser;
    if (user) {
      await updateProfile(user, {
        photoURL: newAvatarUrl
      });
    }

    // Firestore'da kullanıcı dokümanını güncelle
    await setDoc(doc(db, 'users', userId), {
      photoURL: newAvatarUrl,
      lastAvatarUpdate: new Date()
    }, { merge: true });

    return newAvatarUrl;
  } catch (error: any) {
    console.error('Avatar güncellenirken hata:', error);
    throw new Error(error.message || getAuthErrorMessage(error.code));
  }
}; 