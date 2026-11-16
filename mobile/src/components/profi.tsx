// Profi, foca ProfPlus: același desen ca pe site (web/features/profi/profi.tsx), cu mișcarea calmă de acolo.
// E decorativ: cititoarele de ecran îl sar, iar animația se oprește dacă telefonul cere mișcare redusă.
import { View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

import { radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const calm = {
  animationName: { from: { transform: [{ translateY: 0 }, { rotateZ: '0deg' }] }, to: { transform: [{ translateY: -4 }, { rotateZ: '-3deg' }] } },
  animationDuration: '1300ms',
  animationIterationCount: 'infinite',
  animationDirection: 'alternate',
  animationTimingFunction: 'ease-in-out',
} as const;

const swim = {
  ...calm,
  animationName: { from: { transform: [{ translateY: 1 }, { rotateZ: '5deg' }] }, to: { transform: [{ translateY: -3 }, { rotateZ: '-5deg' }] } },
  animationDuration: '550ms',
} as const;

function Drawing() {
  return (
    <G>
      <G><Path d="M54 110 Q42 122 30 119 Q40 110 50 103 Z" fill="#5B7FB0"/><Path d="M86 110 Q98 122 110 119 Q100 110 90 103 Z" fill="#5B7FB0"/></G>
      <Ellipse cx="70" cy="92" rx="34" ry="27" fill="#7A9CC6"/>
      <G><Path d="M38 86 Q24 90 18 101 Q30 103 42 96 Z" fill="#5B7FB0"/></G>
      <G><Path d="M102 86 Q116 90 122 101 Q110 103 98 96 Z" fill="#5B7FB0"/></G>
      <Ellipse cx="70" cy="97" rx="22" ry="18" fill="#DCE7F5"/>
      <Circle cx="70" cy="54" r="30" fill="#7A9CC6"/>
      <Ellipse cx="70" cy="66" rx="12" ry="8.5" fill="#DCE7F5"/>
      <G><Path d="M59 64 Q51 61 43 61.5 M59 67.5 Q51 67.5 42 69 M60 70.5 Q53 72.5 46 76 M81 64 Q89 61 97 61.5 M81 67.5 Q89 67.5 98 69 M80 70.5 Q87 72.5 94 76" stroke="#3A4640" strokeWidth="1.6" fill="none" strokeLinecap="round"/></G>
      <Ellipse cx="70" cy="62.5" rx="4.2" ry="3" fill="#1F2A24"/>
      <Path d="M65.5 68 Q70 72.5 74.5 68" stroke="#1F2A24" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <G><Circle cx="58" cy="49.5" r="7.8" fill="#1F2A24"/><Circle cx="82" cy="49.5" r="7.8" fill="#1F2A24"/><Circle cx="60.6" cy="46.4" r="2.9" fill="#FFFFFF"/><Circle cx="84.6" cy="46.4" r="2.9" fill="#FFFFFF"/><Circle cx="55.6" cy="52.6" r="1.3" fill="#FFFFFF"/><Circle cx="79.6" cy="52.6" r="1.3" fill="#FFFFFF"/></G>
      <Path d="M54 27 v7 c0 5 32 5 32 0 v-7 l-16 7 z" fill="#1F2A24"/>
      <Path d="M42 22 L70 10 L98 22 L70 34 Z" fill="#1F2A24"/>
      <Circle cx="70" cy="22" r="2" fill="#1B4D36"/>
      <G><Path d="M70 22 Q86 24 94 28 L94 40" stroke="#1B4D36" strokeWidth="2.2" fill="none" strokeLinecap="round"/><Circle cx="94" cy="42" r="3.2" fill="#1B4D36"/></G>
    </G>
  );
}

export function Profi({ width = 140 }: { width?: number }) {
  const still = useReducedMotion();
  return (
    <Animated.View style={still ? undefined : calm} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={width} height={(width * 130) / 140} viewBox="0 0 140 130">
        <Drawing />
      </Svg>
    </Animated.View>
  );
}

// Avatarul din conversație: capul lui Profi într-un cerc; înoată cât timp pregătește răspunsul.
export function ProfiAvatar({ size = 32, swimming = false }: { size?: number; swimming?: boolean }) {
  const theme = useTheme();
  const still = useReducedMotion();
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size, borderRadius: radius.pill, overflow: 'hidden', backgroundColor: theme.soft }}>
      <Animated.View style={swimming && !still ? swim : undefined}>
        <Svg width={size} height={size} viewBox="24 2 92 92">
          <Drawing />
        </Svg>
      </Animated.View>
    </View>
  );
}
