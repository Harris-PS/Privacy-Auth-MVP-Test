import { useState, useEffect, createContext, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ScannerScreen from './src/screens/ScannerScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import ConsentScreen from './src/screens/ConsentScreen';
import { api } from './src/services/api';
import { storage } from './src/services/storage';

const Stack = createNativeStackNavigator();
export const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await storage.getAccessToken();
      if (token) {
        api.setTokens(token, await storage.getRefreshToken());
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    })();
  }, []);

  const signIn = async (accessToken, refreshToken, userId) => {
    api.setTokens(accessToken, refreshToken);
    await storage.saveAuthTokens(accessToken, refreshToken);
    if (userId) await storage.saveUserId(userId);
    setIsAuthenticated(true);
  };

  const signOut = async () => {
    api.clearTokens();
    await storage.clearAuth();
    setIsAuthenticated(false);
  };

  if (isLoading) return null;

  return (
    <PaperProvider>
      <SafeAreaProvider>
        <AuthContext.Provider value={{ isAuthenticated, signIn, signOut }}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Scanner">
              <Stack.Screen
                name="Scanner"
                component={ScannerScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Onboarding"
                component={OnboardingScreen}
                options={{ title: 'Verify Device' }}
              />
              <Stack.Screen
                name="Consent"
                component={ConsentScreen}
                options={{ title: 'Privacy Consent' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </AuthContext.Provider>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
