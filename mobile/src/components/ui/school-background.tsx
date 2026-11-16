import { Image } from 'expo-image';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

const tile = require('../../../assets/doodles.svg');
const size = 490;

export function SchoolBackground() {
  const theme = useTheme();
  const {width, height} = useWindowDimensions();
  const columns = Math.ceil(width / size);
  const rows = Math.ceil(height / size);

  return (
    <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.layer}>
      {Array.from({length: columns * rows}, (_, index) => (
        <Image
          key={index}
          source={tile}
          tintColor={theme.doodle}
          contentFit="contain"
          style={[styles.tile, {left: index % columns * size, top: Math.floor(index / columns) * size}]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {...StyleSheet.absoluteFill, overflow: 'hidden'},
  tile: {position: 'absolute', width: size, height: size},
});
