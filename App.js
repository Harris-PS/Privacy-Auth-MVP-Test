import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ScannerScreen from './src/screens/ScannerScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import ConsentScreen from './src/screens/ConsentScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <SafeAreaProvider>
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
      </SafeAreaProvider>
    </PaperProvider>
  );
}
