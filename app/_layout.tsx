import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Provider } from 'react-redux';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { PortalProvider } from '@tamagui/portal';
import { TamaguiProvider } from 'tamagui';

import { getAuth } from '@/services/auth-storage';
import { AppStore } from '@/utils/store';
import { Inter_400Regular, Inter_900Black, useFonts } from '@expo-google-fonts/inter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { tamaguiConfig } from '../tamagui.config';

export const unstable_settings = {
  anchor: '(tabs)',
};

const queryClient = new QueryClient();

export default function RootLayout() {
  const { left, top, right } = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    "Inter": Inter_400Regular,
    "Inter-Black": Inter_900Black,
  });

  useEffect(() => {
    if (loaded) {
      // can hide splash screen here
    }
  }, [loaded, error])

  if (!loaded && error) {
    return null
  }

  useEffect(() => {
    const configureRevenueCat = async () => {
      Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

      const auth = await getAuth();
      const appUserID = auth?.user?.id;

      if (Platform.OS === 'ios') {
        // pass
      } else if (Platform.OS === 'android') {
        Purchases.configure({ 
          apiKey: process.env.EXPO_PUBLIC_REVENUECAT_KEY || '',
          appUserID,
        });
      }
    };

    configureRevenueCat();
  }, []);

  return (
    <Provider store={AppStore}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="blue">
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <QueryClientProvider client={queryClient}>
            <PortalProvider shouldAddRootHost>
              <Stack initialRouteName="index">
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="modals/map" options={{ presentation: 'modal', title: 'Map', headerShown: true }} />
                <Stack.Screen name="modals/datetime" options={{ presentation: 'modal', title: 'Datetime', headerShown: true }} />
              </Stack>
              <StatusBar style="auto" />
            </PortalProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </TamaguiProvider>

      <Toast topOffset={top + 6} />
    </Provider>
  );
}
