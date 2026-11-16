// Fila Cont (P-195): meniul contului și ecranele în care intri (Intrare, Profil, Bibliotecă personală, Setări).
import { Stack } from 'expo-router';
import { useReducedMotion } from 'react-native-reanimated';

export default function AccountLayout() {
  const reduceMotion = useReducedMotion();
  return <Stack screenOptions={{ headerShown: false, animation: reduceMotion ? 'none' : 'slide_from_right' }} />;
}
