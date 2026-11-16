// Pictograme Lucide (licență ISC), folosite și de grila web.
import type {ReactNode} from 'react';
import Svg, {Circle, Path, Rect} from 'react-native-svg';

const shapes = {
  test: (<>
    <Rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <Path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <Path d="m9 14 2 2 4-4" />
  </>),
  worksheet: (<>
    <Path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
    <Path d="M14 2v5a1 1 0 0 0 1 1h5" />
    <Path d="M10 9H8" />
    <Path d="M16 13H8" />
    <Path d="M16 17H8" />
  </>),
  theory: (<>
    <Path d="M12 5v16" />
    <Path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z" />
  </>),
  planning: (<>
    <Path d="M8 2v3" />
    <Path d="M16 2v3" />
    <Rect x="3" y="3" width="18" height="18" rx="2" />
    <Path d="M3 9h18" />
    <Path d="M8 13h.01" />
    <Path d="M12 13h.01" />
    <Path d="M16 13h.01" />
    <Path d="M8 17h.01" />
    <Path d="M12 17h.01" />
    <Path d="M16 17h.01" />
  </>),
  unit: (<>
    <Path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
    <Path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
    <Path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />
  </>),
  lesson: (<>
    <Path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
    <Path d="M22 10v6" />
    <Path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
  </>),
  rubric: (<>
    <Path d="M13 5h8" />
    <Path d="M13 12h8" />
    <Path d="M13 19h8" />
    <Path d="m3 17 2 2 4-4" />
    <Path d="m3 7 2 2 4-4" />
  </>),
  presentation: (<>
    <Path d="M2 3h20" />
    <Path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3" />
    <Path d="m7 21 5-5 5 5" />
  </>),
  fun: (<>
    <Path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
    <Path d="M20 2v4" />
    <Path d="M22 4h-4" />
    <Circle cx="4" cy="20" r="2" />
  </>),
  more: (<>
    <Circle cx="12" cy="12" r="1" />
    <Circle cx="19" cy="12" r="1" />
    <Circle cx="5" cy="12" r="1" />
  </>),
  camera: (<>
    <Path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z" />
    <Circle cx="12" cy="13" r="3" />
  </>),
  gallery: (<>
    <Path d="m22 11-1.296-1.296a2.4 2.4 0 0 0-3.408 0L11 16" />
    <Path d="M4 8a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2" />
    <Circle cx="13" cy="7" r="1" fill="currentColor" />
    <Rect x="8" y="2" width="14" height="14" rx="2" />
  </>),
  document: (<>
    <Path d="M11.35 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v5.35" />
    <Path d="M14 2v5a1 1 0 0 0 1 1h5" />
    <Path d="M14 19h6" />
    <Path d="M17 16v6" />
  </>),
  settings: (<>
    <Path d="M10 5H3" />
    <Path d="M12 19H3" />
    <Path d="M14 3v4" />
    <Path d="M16 17v4" />
    <Path d="M21 12h-9" />
    <Path d="M21 19h-5" />
    <Path d="M21 5h-7" />
    <Path d="M8 10v4" />
    <Path d="M8 12H3" />
  </>),
  trash: (<>
    <Path d="M10 11v6" />
    <Path d="M14 11v6" />
    <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <Path d="M3 6h18" />
    <Path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </>),
} satisfies Record<string, ReactNode>;

export function SiteIcon({name, color, size = 24}: {name: keyof typeof shapes; color: string; size?: number}) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" accessible={false}>{shapes[name]}</Svg>;
}
