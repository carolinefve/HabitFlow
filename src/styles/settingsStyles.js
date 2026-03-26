import { StyleSheet } from "react-native";
import {
  Colours,
  Radius,
  HeaderTitle,
  SubHeading,
} from "../styles/globalStyles";

export default StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colours.bgPrimary },
  container: { flex: 1, backgroundColor: Colours.bgPrimary },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    ...HeaderTitle.title,
  },

  profileCard: {
    backgroundColor: Colours.bgCard,
    borderRadius: Radius.xl,
    padding: 16,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colours.borderSubtle,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colours.textPrimary,
    marginBottom: 3,
  },
  profileSince: {
    fontSize: 14,
    color: Colours.textSecondary,
    fontWeight: "600",
  },

  sectionLabel: {
    ...SubHeading.heading,
    marginBottom: 8,
    marginTop: 10,
  },
  settingsGroup: {
    backgroundColor: Colours.bgCardDark,
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colours.textPrimary,
    marginBottom: 3,
  },
  settingSub: { fontSize: 14, color: Colours.brandBlue, fontWeight: "600" },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colours.borderMid,
  },
  actionIcon: { color: Colours.brandBlue, fontSize: 18 },

  freqOption: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 12,
  },
  freqRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colours.brandBlueDim,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
  },
  freqRadioActive: { borderColor: Colours.brandBlue },
  freqRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colours.brandBlue,
  },
  freqLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colours.textMuted,
    marginBottom: 2,
  },
  freqDesc: {
    fontSize: 12,
    color: Colours.textDisabled,
    lineHeight: 17,
    fontWeight: "700",
  },
});
