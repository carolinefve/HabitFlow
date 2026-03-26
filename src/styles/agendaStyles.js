import { StyleSheet } from "react-native";
import {
  Colours,
  Radius,
  Spacing,
  HeaderTitle,
  SubHeading,
  FAB,
} from "../styles/globalStyles";

import { SLOT_HEIGHT, timelineHours } from "../services/agendaService";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colours.bgPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.screenPaddingTop,
    paddingHorizontal: Spacing.screenPaddingHorizontal,
    paddingBottom: 120,
  },

  screenHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  screenTitle: {
    ...HeaderTitle.title,
  },

  dateNavRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colours.bgCardDark,
    borderWidth: 1,
    borderColor: Colours.borderMid,
  },
  arrowText: {
    color: Colours.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  dateBadgePill: {
    flex: 1,
    minHeight: 36,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colours.brandBlueDim,
    backgroundColor: Colours.bgCard,
  },
  dateBadgePillText: {
    color: Colours.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  saveTemplateButton: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colours.brandBlue,
    backgroundColor: Colours.bgCard,
  },
  saveTemplateText: {
    color: Colours.brandBlue,
    fontSize: 12,
    fontWeight: "700",
  },

  sectionLabel: {
    ...SubHeading.heading,
    marginBottom: 10,
    marginTop: 4,
  },

  allDaySection: {
    marginBottom: 24,
    gap: 10,
  },
  allDayCard: {
    borderRadius: Radius.xl,
    paddingVertical: 14,
    paddingHorizontal: 14,
    shadowColor: Colours.bgPrimary,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  allDayTitle: {
    color: Colours.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  allDaySubtitle: {
    marginTop: 3,
    color: "rgba(255,255,255,0.92)",
    fontSize: 13,
    fontWeight: "500",
  },

  timelineSection: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  timeColumn: {
    width: 64,
    marginRight: 8,
  },
  timeRow: {
    height: SLOT_HEIGHT,
    justifyContent: "flex-start",
  },
  timeText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colours.brandBlue,
  },
  blocksColumn: {
    flex: 1,
    minHeight: SLOT_HEIGHT * timelineHours.length,
    borderLeftWidth: 1,
    borderLeftColor: Colours.borderMid,
    paddingLeft: 12,
    position: "relative",
  },
  hourLine: {
    height: SLOT_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: Colours.borderMid,
  },
  blocksLayer: {
    position: "absolute",
    top: 0,
    left: 12,
    right: 0,
    bottom: 0,
  },
  eventBlock: {
    position: "absolute",
    left: 0,
    right: 4,
    borderRadius: Radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "space-between",
    shadowColor: Colours.bgPrimary,
    shadowOpacity: 0.3,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  eventTitle: {
    color: Colours.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  eventTime: {
    marginTop: 6,
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    fontWeight: "500",
  },

  fab: {
    ...FAB.fab,
  },
  fabText: {
    ...FAB.fabText,
  },

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
  dialog: {
    marginHorizontal: 16,
    marginBottom: 32,
    borderRadius: Radius.xxl,
    backgroundColor: Colours.bgSecondary,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colours.borderMid,
  },
  templateDialog: {
    maxHeight: "72%",
    minHeight: 420,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  dialogTitle: {
    color: Colours.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  dialogHint: {
    marginTop: 6,
    marginBottom: 14,
    color: Colours.textSecondary,
    fontSize: 13,
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
  formScroll: {
    maxHeight: "78%",
  },
  formContent: {
    paddingBottom: 18,
    gap: 14,
  },

  fieldGroup: {
    gap: 10,
  },
  fieldLabel: {
    ...SubHeading.heading,
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
  },
  inlineTimeEditor: {
    marginTop: 10,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colours.borderMid,
    backgroundColor: Colours.bgCardDark,
    padding: 14,
  },
  timeInputField: {
    marginBottom: 8,
  },
  timeInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  timeSplitInput: {
    flex: 1,
    textAlign: "center",
  },
  timeColon: {
    color: Colours.textSecondary,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  periodRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  periodButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colours.borderMid,
    backgroundColor: Colours.bgCardDark,
    alignItems: "center",
    justifyContent: "center",
  },
  periodButtonActive: {
    borderColor: Colours.brandBlue,
    backgroundColor: Colours.brandBlueDark,
  },
  periodButtonText: {
    color: Colours.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  periodButtonTextActive: {
    color: Colours.textPrimary,
  },
  dateRow: {
    alignItems: "flex-start",
  },
  dateBadge: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.sm,
    backgroundColor: Colours.bgCard,
    borderWidth: 1,
    borderColor: Colours.brandBlueDim,
    minHeight: 36,
  },
  dateBadgeText: {
    color: Colours.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  templateButton: {
    minHeight: 40,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colours.brandBlue,
    backgroundColor: Colours.bgCard,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  templateButtonText: {
    color: Colours.brandBlue,
    fontSize: 13,
    fontWeight: "700",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  allDayHint: {
    color: Colours.textMuted,
    fontSize: 12,
  },
  timeFieldRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addTimeButton: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colours.brandBlue,
    backgroundColor: Colours.bgCard,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addTimeText: {
    color: Colours.brandBlue,
    fontSize: 13,
    fontWeight: "600",
  },
  timeTag: {
    borderRadius: Radius.sm,
    backgroundColor: Colours.bgCardDark,
    borderWidth: 1,
    borderColor: Colours.brandBlueDim,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  timeTagText: {
    color: Colours.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  colorRow: {
    flexDirection: "row",
    gap: 10,
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorSwatchActive: {
    borderColor: Colours.textPrimary,
  },

  footerButtons: {
    borderTopWidth: 1,
    borderTopColor: Colours.borderMid,
    marginTop: 6,
    paddingTop: 12,
    flexDirection: "row",
    gap: 8,
  },
  inlineActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: Radius.md,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  smallActionButton: {
    flex: 1,
    borderRadius: Radius.md,
    minHeight: 42,
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
  deleteButton: {
    backgroundColor: Colours.danger,
  },
  disabledButton: {
    opacity: 0.45,
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
  deleteText: {
    color: Colours.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  errorText: {
    color: Colours.dangerLight,
    fontSize: 12,
    fontWeight: "600",
  },

  templateList: {
    minHeight: 220,
    maxHeight: 360,
    marginBottom: 14,
  },
  templateListContent: {
    paddingBottom: 4,
    gap: 10,
  },
  templateListItem: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colours.brandBlueDim,
    backgroundColor: Colours.bgCardDark,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 64,
  },
  templateListTitle: {
    color: Colours.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  templateListMeta: {
    marginTop: 4,
    color: Colours.textMuted,
    fontSize: 12,
    fontWeight: "500",
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
  timelineEmptyState: {
    marginTop: 18,
    marginRight: 4,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colours.borderMid,
    backgroundColor: Colours.bgCardDark,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
});
