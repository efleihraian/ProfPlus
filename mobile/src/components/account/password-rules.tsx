import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { passwordRules } from '../../../../web/shared/password-rules';

export function PasswordRules({ value }: { value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.list} accessibilityLabel="Cerințe pentru parolă">
      {passwordRules(value).map((rule) => (
        <View key={rule.id} style={styles.row} accessible accessibilityLabel={`${rule.label}: ${rule.ok ? 'îndeplinită' : 'neîndeplinită'}`}>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={rule.ok ? theme.accentText : theme.subtle} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            {rule.ok ? <Path d="M20 6 9 17l-5-5" /> : <Circle cx={12} cy={12} r={9} />}
          </Svg>
          <ThemedText type="small" themeColor={rule.ok ? 'text' : 'muted'} style={styles.flex}>{rule.label}</ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.one },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  flex: { flex: 1 },
});
