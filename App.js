import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import ConsentScreen from './src/screens/ConsentScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PaperProvider theme={MD3LightTheme}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: 'Privacy Auth' }}
            />
            <Stack.Screen
              name="Scanner"
              component={ScannerScreen}
              options={{ headerShown: false, presentation: 'modal' }} 
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
      </SafeAreaProvider>
    </PaperProvider>
  );
}