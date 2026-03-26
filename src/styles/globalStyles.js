export const Colours = {
  // Backgrounds
  bgPrimary: "#000000",
  bgSecondary: "#080808",
  bgCard: "#173454",
  bgCardDark: "#1d2025",
  bgInput: "#0D2137",

  // Borders
  borderSubtle: "#111111",
  borderMid: "#1E1E1E",

  // Text
  textPrimary: "#ffffff",
  textSecondary: "#cfcdcd",
  textMuted: "#acd0f6",
  textDisabled: "#5A7A9E",

  // Brand colour
  brandBlue: "#7EB8F7",
  brandBlueDim: "#3A5A7A",
  brandBlueDark: "#27517d",

  // More colours
  yellow: "#F9C784",
  orange: "#d78922",
  purple: "#A78BFA",
  blue: "#3A7BFF",
  brown: "#8D6E63",
  green: "#43A047",
  red: "#E53935",

  // Overlay
  backdropColor: "rgba(0,0,0,0.72)",
  backdropCard: "rgba(0,0,0,0.62)",
};

// Task color palette array
export const TaskColourPalette = [
  Colours.blue,
  Colours.brown,
  Colours.red,
  Colours.purple,
  Colours.green,
];

export const Radius = {
  sm: 9,
  md: 12,
  lg: 14,
  xl: 16,
  xxl: 24,
};

export const HeaderTitle = {
  title: { fontSize: 35, fontWeight: "800", color: "#ffffff" },
};

export const SubHeading = {
  heading: {
    fontSize: 14,
    fontWeight: "800",
    color: Colours.textPrimary,
    textTransform: "uppercase",
  },
};

export const Spacing = {
  screenPaddingTop: 20,
  screenPaddingHorizontal: 20,
};

export const FAB = {
  fab: {
    position: "absolute",
    right: 20,
    bottom: 95,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colours.brandBlue,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colours.bgPrimary,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  fabText: {
    color: Colours.bgPrimary,
    fontSize: 30,
    fontWeight: "500",
    lineHeight: 31,
  },
};
