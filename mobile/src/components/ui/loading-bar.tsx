import { StyleSheet, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-theme';

const sweep = {
  animationName: { from: { left: '-40%' }, to: { left: '100%' } },
  animationDuration: '1100ms',
  animationIterationCount: 'infinite',
  animationTimingFunction: 'ease-in-out',
} as const;

export function LoadingBar({ label = 'Se încarcă' }: { label?: string }) {
  const theme = useTheme();
  const still = useReducedMotion();
  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityState={{ busy: true }} style={[styles.track, { backgroundColor: theme.soft }]}>
      {still ? <View style={[styles.full, { backgroundColor: theme.accent }]} /> : <Animated.View style={[styles.bar, { backgroundColor: theme.accent }, sweep]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 3, overflow: 'hidden', width: '100%' },
  bar: { position: 'absolute', top: 0, bottom: 0, width: '40%', borderRadius: 3 },
  full: { height: '100%', width: '100%', opacity: 0.6 },
});
