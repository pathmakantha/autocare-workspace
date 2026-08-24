import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { firebaseAuth } from '@/config/firebase';

WebBrowser.maybeCompleteAuthSession();

// Create OAuth 2.0 client IDs in Google Cloud Console (or Firebase Console > Authentication
// > Sign-in method > Google) for each platform you support. Note: iOS/Android sign-in requires
// a custom dev client (expo-auth-session can't complete this flow inside Expo Go).
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

// Whether the current platform actually has a client ID configured for it.
// expo-auth-session throws synchronously if the platform-specific client ID is missing,
// so we must know this before calling the hook, not just check the returned `request`.
const isPlatformConfigured =
  Platform.OS === 'web' ? !!webClientId : Platform.OS === 'ios' ? !!iosClientId : !!androidClientId;

interface UseGoogleAuthOptions {
  onIdToken: (idToken: string) => void;
  onError: (message: string) => void;
}

export function useGoogleAuth({ onIdToken, onError }: UseGoogleAuthOptions) {
  // Fall back to webClientId so the hook never throws on a platform we haven't configured yet;
  // isPlatformConfigured gates whether we actually let the user trigger the (non-functional) flow.
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId,
    androidClientId,
    webClientId,
    clientId: webClientId,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token: idToken } = response.params;
      const credential = GoogleAuthProvider.credential(idToken);
      signInWithCredential(firebaseAuth, credential)
        .then((result) => result.user.getIdToken())
        .then(onIdToken)
        .catch(() => onError('Google sign-in failed. Please try again.'));
    } else if (response?.type === 'error') {
      onError('Google sign-in was cancelled or failed.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  return {
    isReady: !!request && isPlatformConfigured,
    isPlatformConfigured,
    promptGoogleSignIn: () => promptAsync(),
  };
}
