import { StyleSheet } from "react-native";
import {
  Colours,
  Radius,
  Spacing,
  HeaderTitle,
  SubHeading,
  FAB,
} from "../styles/globalStyles";

export default StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colours.bgPrimary,
    paddingTop: Spacing.screenPaddingTop,
    paddingHorizontal: Spacing.screenPaddingHorizontal,
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  headerTitle: {
    ...HeaderTitle.title,
    fontSize: 28,
  },
  navButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  navButtonText: {
    color: Colours.brandBlue,
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 34,
  },

  // ── Calendar grid ──
  dayLabelRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  dayLabel: {
    width: "14%",
    textAlign: "center",
    color: Colours.textMuted,
    fontSize: 18,
    fontWeight: "700",
    paddingBottom: 6,
  },
  calendarGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    borderRadius: Radius.lg,
    overflow: "hidden",
    borderColor: Colours.borderSubtle,
    marginBottom: 15,
  },
  calendarCell: {
    width: "14%",
    aspectRatio: 1,
    borderWidth: 0.5,
    borderColor: Colours.borderSubtle,
    backgroundColor: Colours.bgSecondary,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  calendarCellToday: {
    backgroundColor: Colours.brandBlueDark,
  },
  calendarCellSelected: {
    backgroundColor: Colours.green,
    borderColor: Colours.green,
  },
  calendarCellText: {
    color: Colours.textSecondary,
    fontSize: 18,
    fontWeight: "500",
  },
  calendarCellTextToday: {
    color: Colours.textPrimary,
    fontWeight: "800",
  },
  calendarCellTextSelected: {
    color: Colours.textPrimary,
    fontWeight: "700",
  },
  deadlineDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colours.red,
    position: "absolute",
    top: 6,
  },

  // ── Deadline list ──
  listScroll: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
    gap: 10,
  },
  listHeading: {
    ...SubHeading.heading,
    marginBottom: 4,
  },
  deadlineCard: {
    flexDirection: "row",
    borderRadius: Radius.lg,
    backgroundColor: Colours.bgCardDark,
    borderWidth: 1,
    borderColor: Colours.brandBlue,
    overflow: "hidden",
    minHeight: 62,
  },
  deadlineCardDone: {
    opacity: 0.4,
  },
  deadlineCardBody: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 4,
  },
  deadlineCardTitle: {
    color: Colours.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  deadlineCardDate: {
    color: Colours.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },

  emptyStateCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colours.borderMid,
    backgroundColor: Colours.bgCardDark,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  emptyStateTitle: {
    color: Colours.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  emptyStateSubtitle: {
    marginTop: 4,
    color: Colours.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },

  // ── FAB ──
  fab: {
    ...FAB.fab,
  },
  fabText: {
    ...FAB.fabText,
  },

  // ── Bottom-sheet modal ──
  modalBackdrop: {
    flex: 1,
    backgroundColor: Colours.backdropCard,
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "89%",
    backgroundColor: Colours.bgSecondary,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderColor: Colours.borderMid,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 46,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colours.brandBlueDim,
    marginBottom: 12,
  },
  sheetTitle: {
    color: Colours.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },

  // Detail modal content
  detailDate: {
    color: Colours.textMuted,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 10,
  },
  detailDescription: {
    color: Colours.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },

  // ── Form ──
  formScroll: {
    maxHeight: "75%",
  },
  formContent: {
    paddingBottom: 18,
    gap: 14,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    color: Colours.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  input: {
    borderRadius: Radius.md,
    backgroundColor: Colours.bgCardDark,
    borderWidth: 1,
    borderColor: Colours.borderMid,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: Colours.textPrimary,
    fontSize: 14,
  },
  notesInput: {
    minHeight: 92,
    textAlignVertical: "top",
  },
  timeTag: {
    borderRadius: Radius.sm,
    backgroundColor: Colours.bgCardDark,
    borderWidth: 1,
    borderColor: Colours.brandBlueDim,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignSelf: "flex-start",
  },
  timeTagText: {
    color: Colours.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },

  // ── Footer buttons ──
  footerButtons: {
    borderTopWidth: 1,
    borderTopColor: Colours.borderMid,
    marginTop: 6,
    paddingTop: 12,
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: Radius.md,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: Colours.bgCardDark,
  },
  saveButton: {
    backgroundColor: Colours.green,
    borderWidth: 1,
    borderColor: Colours.green,
  },
  cancelText: {
    color: Colours.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  saveText: {
    color: Colours.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
});
