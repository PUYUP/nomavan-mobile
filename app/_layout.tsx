import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Provider } from 'react-redux';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { PortalProvider } from '@tamagui/portal';
import { TamaguiProvider } from 'tamagui';

import { store } from '@/utils/store';
import { Inter_400Regular, Inter_900Black, useFonts } from '@expo-google-fonts/inter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { tamaguiConfig } from '../tamagui.config';

export const unstable_settings = {
  anchor: '(tabs)',
};

const queryClient = new QueryClient();

export default function RootLayout() {
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

  return (
    <Provider store={store}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="blue">
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <QueryClientProvider client={queryClient}>
            <PortalProvider shouldAddRootHost>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              </Stack>
              <StatusBar style="auto" />
            </PortalProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </TamaguiProvider>
      </Provider>
  );
}
