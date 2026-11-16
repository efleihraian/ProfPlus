// Logo-ul ProfPlus ca pe site: pătrat verde cu „P” alb și „+” mentă, urmat de „Prof**Plus**”.
import { StyleSheet, Text, View } from 'react-native';

import { brand, radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Brand() {
  const theme = useTheme();
  return (
    <View style={styles.row} accessible accessibilityRole="header" accessibilityLabel="ProfPlus">
      <View style={[styles.mark, { backgroundColor: theme.accent }]}>
        <Text style={styles.p}>P</Text>
        <Text style={styles.plus}>+</Text>
      </View>
      <Text style={[styles.name, { color: theme.text }]}>
        Prof<Text style={styles.suffix}>Plus</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { width: 32, height: 34, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  p: { color: brand.onAccent, fontSize: 20, fontWeight: 700, lineHeight: 24 },
  plus: { position: 'absolute', right: 3, top: 1, color: brand.logoPlus, fontSize: 13, fontWeight: 700 },
  name: { fontSize: 21, fontWeight: 700, letterSpacing: -0.5 },
  suffix: { fontWeight: 400 },
});
