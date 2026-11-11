// Pictograme mici, desenate cu react-native-svg (deja în aplicație), ca butoanele să ocupe puțin loc.
// Contururile urmează pictogramele Lucide (licență ISC), aceleași ca pe site.
import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';

type Props = { size?: number; color: string };
const base = (size: number) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const });

export function CameraIcon({ size = 20, color }: Props) {
  return (
    <Svg {...base(size)} stroke={color}>
      <Path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <Circle cx="12" cy="13" r="3" />
    </Svg>
  );
}
export function SlidersIcon({ size = 18, color }: Props) {
  return (
    <Svg {...base(size)} stroke={color}>
      <Line x1="21" x2="14" y1="4" y2="4" />
      <Line x1="10" x2="3" y1="4" y2="4" />
      <Line x1="21" x2="12" y1="12" y2="12" />
      <Line x1="8" x2="3" y1="12" y2="12" />
      <Line x1="21" x2="16" y1="20" y2="20" />
      <Line x1="12" x2="3" y1="20" y2="20" />
      <Line x1="14" x2="14" y1="2" y2="6" />
      <Line x1="8" x2="8" y1="10" y2="14" />
      <Line x1="16" x2="16" y1="18" y2="22" />
    </Svg>
  );
}
export function ArrowUpIcon({ size = 20, color }: Props) {
  return (
    <Svg {...base(size)} stroke={color}>
      <Path d="m5 12 7-7 7 7" />
      <Path d="M12 19V5" />
    </Svg>
  );
}
export function StopIcon({ size = 16, color }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 6h12v12H6z" fill={color} />
    </Svg>
  );
}
export function HistoryIcon({ size = 20, color }: Props) {
  return (
    <Svg {...base(size)} stroke={color}>
      <Path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <Polyline points="3 3 3 8 8 8" />
      <Polyline points="12 7 12 12 15 15" />
    </Svg>
  );
}
export function NewChatIcon({ size = 20, color }: Props) {
  return (
    <Svg {...base(size)} stroke={color}>
      <Path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <Path d="M18.4 2.6a2.1 2.1 0 1 1 3 3L12 15l-4 1 1-4Z" />
    </Svg>
  );
}
export function CloseIcon({ size = 14, color }: Props) {
  return (
    <Svg {...base(size)} stroke={color}>
      <Path d="M18 6 6 18" />
      <Path d="m6 6 12 12" />
    </Svg>
  );
}
// P-195: meniul din fila Cont.
export function UserIcon({ size = 20, color }: Props) {
  return (
    <Svg {...base(size)} stroke={color}>
      <Circle cx="12" cy="8" r="5" />
      <Path d="M20 21a8 8 0 0 0-16 0" />
    </Svg>
  );
}
export function LibraryIcon({ size = 20, color }: Props) {
  return (
    <Svg {...base(size)} stroke={color}>
      <Path d="m16 6 4 14" />
      <Path d="M12 6v14" />
      <Path d="M8 8v12" />
      <Path d="M4 4v16" />
    </Svg>
  );
}
export function SettingsIcon({ size = 20, color }: Props) {
  return (
    <Svg {...base(size)} stroke={color}>
      <Path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <Circle cx="12" cy="12" r="3" />
    </Svg>
  );
}
export function LogOutIcon({ size = 20, color }: Props) {
  return (
    <Svg {...base(size)} stroke={color}>
      <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <Polyline points="16 17 21 12 16 7" />
      <Line x1="21" x2="9" y1="12" y2="12" />
    </Svg>
  );
}
export function ChevronRightIcon({ size = 20, color }: Props) {
  return (
    <Svg {...base(size)} stroke={color}>
      <Path d="m9 18 6-6-6-6" />
    </Svg>
  );
}
export function ChevronLeftIcon({ size = 22, color }: Props) {
  return (
    <Svg {...base(size)} stroke={color}>
      <Path d="m15 18-6-6 6-6" />
    </Svg>
  );
}
export function PencilIcon({ size = 18, color }: Props) {
  return (
    <Svg {...base(size)} stroke={color}>
      <Path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
      <Path d="m15 5 4 4" />
    </Svg>
  );
}
export function TrashIcon({ size = 18, color }: Props) {
  return (
    <Svg {...base(size)} stroke={color}>
      <Path d="M3 6h18" />
      <Path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <Path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </Svg>
  );
}
export function FileTextIcon({ size = 20, color }: Props) {
  return (
    <Svg {...base(size)} stroke={color}>
      <Path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <Path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <Path d="M16 13H8" />
      <Path d="M16 17H8" />
    </Svg>
  );
}
// P-199: atașarea în chat (fotografii sau documente), ca butonul „+” de pe site.
export function PlusIcon({ size = 20, color }: Props) {
  return (
    <Svg {...base(size)} stroke={color}>
      <Path d="M5 12h14" />
      <Path d="M12 5v14" />
    </Svg>
  );
}
