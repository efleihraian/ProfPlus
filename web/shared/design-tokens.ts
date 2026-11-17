export const colors = {
  light: {
    bg: "#EFDFC6",
    surface: "#F9EEDD",
    text: "#2B261F",
    muted: "#5E5448",
    subtle: "#6B6155",
    border: "#E2CFB2",
    borderStrong: "#D2BC9A",
    soft: "#E5EBDA",
    softBorder: "#C4D3B4",
    softText: "#2F5E43",
    accent: "#2F7D5B",
    accentText: "#286B4E",
    dark: "#1B4D36",
    hover: "#E8D5B9",
    rowMuted: "#EFDFC6",
    dangerSoft: "#FBEDE6",
    dangerBorder: "#F2C6B8",
    dangerText: "#B91C1C",
    okSoft: "#E6EEDC",
    okText: "#2F6B3F",
    track: "#E2CFB2",
    tag: "#E8D7BD",
    shadow: "rgba(70,50,25,.10)",
    doodle: "#E6D4B7",
  },
  dark: {
    bg: "#121513",
    surface: "#1B1F1D",
    text: "#E6EFE9",
    muted: "#B3C2B9",
    subtle: "#98A89F",
    border: "#2F3633",
    borderStrong: "#404A45",
    soft: "#1C3328",
    softBorder: "#2F5B46",
    softText: "#9BDDB9",
    accent: "#2F7D5B",
    accentText: "#7FD3A6",
    dark: "#2F7D5B",
    hover: "#222926",
    rowMuted: "#151A18",
    dangerSoft: "#3A1F25",
    dangerBorder: "#7F3542",
    dangerText: "#FCA5A5",
    okSoft: "#123A2C",
    okText: "#6EE7B7",
    track: "#2F3633",
    tag: "#2A312E",
    shadow: "rgba(0,0,0,.35)",
    doodle: "#191D1B",
  },
} as const;

export type ColorScheme = keyof typeof colors;
export type ColorToken = keyof typeof colors.light;

export const brand = {
  onAccent: "#FFFFFF",
  logoPlus: "#86D9AE",
} as const;

export const font = {
  family: "Roboto",
  weights: {regular: "400", medium: "500", semibold: "600", bold: "700"},
} as const;

export const radius = {
  xs: 8,
  sm: 8,
  md: 8,
  lg: 8,
  xl: 8,
  xxl: 8,
  pill: 999,
} as const;
