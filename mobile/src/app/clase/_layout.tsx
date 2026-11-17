import { Stack } from 'expo-router';
import { useReducedMotion } from 'react-native-reanimated';

export default function ClassesLayout() {
  const reduceMotion = useReducedMotion();
  return <Stack screenOptions={{ headerShown: false, animation: reduceMotion ? 'none' : 'slide_from_right' }} />;
}
