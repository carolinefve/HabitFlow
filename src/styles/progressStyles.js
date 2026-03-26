import { StyleSheet } from "react-native";
import { Colours, Radius, HeaderTitle, SubHeading } from "../styles/global";

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

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 8,
  },
  statPill: {
    flex: 1,
    borderRadius: Radius.lg,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 2,
    color: Colours.bgPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: Colours.bgPrimary,
    textAlign: "center",
    fontWeight: "600",
  },

  motivationCard: {
    borderRadius: Radius.xl,
    padding: 18,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colours.brandBlue,
  },
  motivationQuote: {
    fontSize: 17,
    fontWeight: "800",
    color: Colours.textPrimary,
    marginBottom: 5,
  },
  motivationSub: { fontSize: 16, color: Colours.textMuted, fontWeight: "500" },

  sectionHeader: {
    ...SubHeading.heading,
    marginBottom: 10,
    marginTop: 4,
  },

  toggle: {
    flexDirection: "row",
    backgroundColor: Colours.brandBlue,
    borderRadius: Radius.sm,
    padding: 3,
    marginBottom: 12,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    alignItems: "center",
  },
  toggleBtnActive: { backgroundColor: Colours.bgCard },
  toggleText: { fontSize: 14, fontWeight: "600", color: Colours.bgPrimary },
  toggleTextActive: { color: Colours.textPrimary },

  chartCard: {
    backgroundColor: Colours.bgCard,
    borderRadius: Radius.xl,
    padding: 14,
    marginBottom: 24,
    overflow: "hidden",
  },
  chartTitle: {
    fontSize: 14,
    color: Colours.textPrimary,
    fontWeight: "600",
    marginBottom: 8,
  },
  chart: { marginLeft: -25 },

  gridWeekLabel: {
    fontSize: 14,
    color: Colours.textPrimary,
    fontWeight: "700",
  },
  gridDayLabel: {
    fontSize: 14,
    color: Colours.textPrimary,
    fontWeight: "600",
    textAlign: "right",
  },
  streakCell: { borderRadius: 3 },
  legendRow: { flexDirection: "row", gap: 16, marginTop: 10 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 12, height: 12, borderRadius: 3 },
  legendLabel: { fontSize: 14, color: Colours.textPrimary, fontWeight: "500" },
});
