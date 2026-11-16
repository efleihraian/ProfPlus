// Fila Clase are două niveluri: lista claselor și pagina unei clase; antetul îl desenează fiecare ecran.
import { Stack } from 'expo-router';
import { useReducedMotion } from 'react-native-reanimated';

export default function ClassesLayout() {
  const reduceMotion = useReducedMotion();
  return <Stack screenOptions={{ headerShown: false, animation: reduceMotion ? 'none' : 'slide_from_right' }} />;
}
