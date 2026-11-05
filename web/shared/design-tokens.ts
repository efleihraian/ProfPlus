// Jetoanele de design ProfPlus: sursa unică pentru culorile, fontul și razele site-ului și ale aplicației mobile.
// Site-ul primește culorile ca variabile CSS --pp-* generate de `node scripts/generate-design-tokens.mjs` (din web/);
// aplicația mobilă le importă direct (mobile/src/constants/theme.ts). Fișierul nu importă nimic.

// Paleta 60-30-10 din docs/design/README.md: crem/alb ca fundal, verde ca structură, verde închis pentru acțiuni.
// Modul întunecat folosește verde închis, cu contrast AA (P-081).
export const colors = {
  light: {
    bg: "#FBF8F3",
    surface: "#FFFFFF",
    text: "#1F2A24",
    muted: "#55605A",
    subtle: "#6B746F",
    border: "#ECE6DC",
    borderStrong: "#DCD4C6",
    soft: "#E8F3EC",
    softBorder: "#BFDDCB",
    softText: "#24654A",
    accent: "#2F7D5B",
    accentText: "#2F7D5B",
    dark: "#1B4D36",
    hover: "#F5F0E8",
    rowMuted: "#FBF8F3",
    dangerSoft: "#FEF2F2",
    dangerBorder: "#FECACA",
    dangerText: "#B91C1C",
    okSoft: "#ECFDF5",
    okText: "#047857",
    track: "#E3E1DC",
    tag: "#ECE6DC",
    shadow: "rgba(31,42,36,.08)",
  },
  dark: {
    bg: "#0F1613",
    surface: "#17211C",
    text: "#E6EFE9",
    muted: "#B3C2B9",
    subtle: "#98A89F",
    border: "#2B3A33",
    borderStrong: "#3B4F45",
    soft: "#1C3328",
    softBorder: "#2F5B46",
    softText: "#9BDDB9",
    accent: "#2F7D5B",
    accentText: "#7FD3A6",
    dark: "#2F7D5B",
    hover: "#1F2C26",
    rowMuted: "#131C18",
    dangerSoft: "#3A1F25",
    dangerBorder: "#7F3542",
    dangerText: "#FCA5A5",
    okSoft: "#123A2C",
    okText: "#6EE7B7",
    track: "#2B3A33",
    tag: "#26352E",
    shadow: "rgba(0,0,0,.35)",
  },
} as const;

export type ColorScheme = keyof typeof colors;
export type ColorToken = keyof typeof colors.light;

// Culori identice în ambele teme: textul de pe butoanele verzi și „+”-ul mentă din logo.
export const brand = {
  onAccent: "#FFFFFF",
  logoPlus: "#86D9AE",
} as const;

// Roboto, ca pe site (web/public/fonts). Pe Android este fontul sistemului.
export const font = {
  family: "Roboto",
  weights: {regular: "400", medium: "500", semibold: "600", bold: "700"},
} as const;

// Razele de colț folosite cel mai des în CSS-ul site-ului, în px.
export const radius = {
  xs: 6,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  xxl: 18,
  pill: 999,
} as const;
