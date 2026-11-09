import { DarkTheme, DefaultTheme, ThemeProvider, type ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/theme';
import { loadThemeChoice } from '@/lib/appearance';
import { AuthProvider, useAuth } from '@/lib/auth';
import { installGlobalErrorLogging, log } from '@/lib/log';

SplashScreen.preventAutoHideAsync();
installGlobalErrorLogging();

// Un ecran care se blochează la desenare nu închide aplicația: profesorul vede un mesaj și poate reîncerca, iar jurnalul păstrează cauza.
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const theme = Colors[useColorScheme() === 'dark' ? 'dark' : 'light'];
  useEffect(() => {
    log('error', 'screen_crash', undefined, error);
    SplashScreen.hideAsync();
  }, [error]);
  return (
    <View style={[styles.crash, { backgroundColor: theme.background }]}>
      <ThemedText type="subtitle" accessibilityRole="header">
        Ceva nu a mers bine
      </ThemedText>
      <ThemedText themeColor="muted">Ecranul nu a putut fi afișat. Încearcă din nou; dacă se repetă, spune-ne ce făceai.</ThemedText>
      <Button onPress={retry}>Încearcă din nou</Button>
    </View>
  );
}

// Ecranul de pornire rămâne până se citește sesiunea salvată, ca fila Cont să nu clipească între „conectat” și „neconectat”.
function HideSplashWhenReady() {
  const { session } = useAuth();
  useEffect(() => {
    if (session !== undefined) SplashScreen.hideAsync();
  }, [session]);
  return null;
}

export default function RootLayout() {
  // P-195: tema aleasă în Cont → Setări se aplică la pornire.
  useEffect(() => {
    void loadThemeChoice();
  }, []);
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const colors = Colors[scheme];
  return (
    <AuthProvider>
      <ThemeProvider
        value={{
          ...base,
          colors: { ...base.colors, background: colors.background, card: colors.surface, text: colors.text, border: colors.border, primary: colors.accent },
        }}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <HideSplashWhenReady />
        <AppTabs />
      </ThemeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  crash: { flex: 1, justifyContent: 'center', padding: 24, gap: 16 },
});
