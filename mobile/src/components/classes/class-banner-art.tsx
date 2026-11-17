import { StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { CLASS_BANNER_ART_VIEWBOX, classBannerArt } from '../../../../web/shared/class-banner-art';
import type { ClassBannerColor } from '../../../../web/shared/class-catalog';

export function ClassBannerArt({ color, opacity = 0.3 }: { color: ClassBannerColor; opacity?: number }) {
  return (
    <Svg viewBox={CLASS_BANNER_ART_VIEWBOX} preserveAspectRatio="xMaxYMax meet" style={styles.art} pointerEvents="none"
      accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {classBannerArt(color).map((shape, index) =>
        'd' in shape ? (
          <Path key={index} d={shape.d} fill="none" stroke="#FFFFFF" strokeOpacity={opacity} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <Circle key={index} cx={shape.c[0]} cy={shape.c[1]} r={shape.c[2]} fill="none" stroke="#FFFFFF" strokeOpacity={opacity} strokeWidth={2.4} />
        ),
      )}
    </Svg>
  );
}

const styles = StyleSheet.create({
  art: { position: 'absolute', right: 0, bottom: 0, top: 0, width: '100%' },
});
