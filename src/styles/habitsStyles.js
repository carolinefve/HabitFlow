import { StyleSheet } from "react-native";
import {
  Colours,
  Radius,
  HeaderTitle,
  Spacing,
  SubHeading,
} from "../styles/globalStyles";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colours.bgPrimary,
  },

  screenHeader: {
    paddingHorizontal: Spacing.screenPaddingHorizontal,
    paddingTop: Spacing.screenPaddingTop,
    paddingBottom: 20,
  },
  screenTitle: {
    ...HeaderTitle.title,
  },

  searchContainer: {
    paddingHorizontal: Spacing.screenPaddingHorizontal,
    marginBottom: 14,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colours.bgCardDark,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colours.borderMid,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    color: Colours.textPrimary,
    paddingVertical: 11,
    fontSize: 14,
  },

  filterWrapper: {
    paddingHorizontal: Spacing.screenPaddingHorizontal,
    marginBottom: 16,
    gap: 10,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  filterRowLabel: {
    ...SubHeading.heading,
    width: 57,
  },
  filterChips: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    alignItems: "center",
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Radius.md,
    backgroundColor: Colours.bgCardDark,
    borderWidth: 1,
    borderColor: Colours.borderMid,
  },
  chipActive: {
    backgroundColor: Colours.brandBlueDark,
    borderColor: Colours.brandBlue,
  },
  chipToday: {
    backgroundColor: Colours.green,
    borderColor: Colours.green,
  },
  chipText: {
    color: Colours.textDisabled,
    fontSize: 12,
    fontWeight: "700",
  },
  chipTextActive: {
    color: Colours.textPrimary,
  },
  chipDivider: {
    width: 1,
    height: 18,
    backgroundColor: Colours.borderMid,
    alignSelf: "center",
  },

  listContent: {
    paddingHorizontal: Spacing.screenPaddingHorizontal,
    paddingTop: 4,
    paddingBottom: 100,
  },
  emptyState: {
    marginTop: 60,
    alignItems: "center",
    gap: 8,
  },
  emptyEmoji: { fontSize: 60, marginBottom: 8 },
  emptyTitle: {
    color: Colours.textPrimary,
    fontSize: 20,
    fontWeight: "700",
  },
  emptySubtitle: {
    color: Colours.textDisabled,
    fontSize: 14,
  },

  card: {
    backgroundColor: Colours.bgCard,
    borderRadius: Radius.xl,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colours.borderSubtle,
  },
  moveButtons: {
    flexDirection: "column",
    justifyContent: "center",
    gap: 4,
    paddingRight: 10,
  },
  cardCategory: {
    color: Colours.brandBlue,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  cardDesc: {
    color: Colours.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  cardMeta: {
    color: Colours.textDisabled,
    fontSize: 13,
    marginBottom: 2,
  },
  cardFrequency: {
    color: Colours.textMuted,
    fontSize: 12,
    fontWeight: "500",
  },
  cardActions: {
    alignItems: "center",
    gap: 8,
    marginLeft: 10,
  },
  doneBtn: {
    backgroundColor: Colours.green,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: Radius.lg,
    justifyContent: "center",
    minWidth: 64,
    alignItems: "center",
  },
  tbdBtn: {
    backgroundColor: Colours.bgCardDark,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: Radius.lg,
    justifyContent: "center",
    minWidth: 64,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colours.borderMid,
  },
  cardBtnText: {
    color: Colours.textPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
  cardEditRow: {
    flexDirection: "row",
    gap: 10,
  },
  editBtnText: {
    color: Colours.brandBlue,
    fontSize: 13,
    fontWeight: "600",
  },
  deleteBtnText: {
    color: Colours.red,
    fontSize: 13,
    fontWeight: "600",
  },

  sheetPosition: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheet: {
    backgroundColor: Colours.bgSecondary,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingHorizontal: Spacing.screenPaddingHorizontal,
    paddingTop: 10,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderColor: Colours.borderMid,
    maxHeight: "100%",
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
    marginBottom: 16,
  },

  formFieldGroup: {
    marginBottom: 16,
    gap: 8,
  },
  formFieldLabel: {
    ...SubHeading.heading,
  },
  formFieldLabelHint: {
    color: Colours.textDisabled,
    fontSize: 11,
    fontWeight: "500",
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

  categoryRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  catChip: {
    backgroundColor: Colours.bgCardDark,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colours.borderMid,
  },
  catChipActive: {
    backgroundColor: Colours.brandBlueDark,
    borderColor: Colours.brandBlue,
  },
  catChipGeneral: {
    borderColor: Colours.borderMid,
  },
  catChipAdd: {
    backgroundColor: Colours.bgCardDark,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.sm,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: Colours.textDisabled,
  },
  catChipText: {
    color: Colours.textDisabled,
    fontSize: 12,
    fontWeight: "600",
  },
  catChipTextActive: {
    color: Colours.textPrimary,
  },

  dateTimeRow: {
    flexDirection: "row",
    gap: 8,
  },
  dateTimeField: {
    flex: 1,
    backgroundColor: Colours.bgCardDark,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colours.borderMid,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateTimeFieldLabel: {
    color: Colours.textDisabled,
    fontSize: 11,
    fontWeight: "600",
  },

  durationRow: {
    flexDirection: "row",
    gap: 10,
  },
  durationSection: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  durationLabel: {
    color: Colours.textDisabled,
    fontSize: 11,
    fontWeight: "600",
  },

  freqTypeRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  freqBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.sm,
    backgroundColor: Colours.bgCardDark,
    borderWidth: 1,
    borderColor: Colours.borderMid,
  },
  freqBtnActive: {
    backgroundColor: Colours.brandBlueDark,
    borderColor: Colours.brandBlue,
  },
  freqBtnText: {
    color: Colours.textDisabled,
    fontSize: 13,
    fontWeight: "600",
  },
  freqBtnTextActive: {
    color: Colours.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colours.bgCardDark,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colours.borderMid,
  },
  dayCircleActive: {
    backgroundColor: Colours.brandBlueDark,
    borderColor: Colours.brandBlue,
  },
  dayText: {
    color: Colours.textDisabled,
    fontSize: 13,
    fontWeight: "700",
  },
  dayTextActive: {
    color: Colours.textPrimary,
  },
  intervalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 10,
  },
  intervalLabel: {
    color: Colours.textDisabled,
    fontSize: 13,
    fontWeight: "600",
  },

  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: Colours.bgCardDark,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colours.borderMid,
    padding: 3,
  },
  stepperButton: {
    width: 34,
    height: 34,
    backgroundColor: Colours.bgCard,
    borderRadius: Radius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  stepperValue: {
    width: 38,
    alignItems: "center",
  },
  stepperValueText: {
    color: Colours.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },

  sheetFooter: {
    flexDirection: "row",
    gap: 8,
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colours.borderMid,
  },
  sheetBtn: {
    flex: 1,
    borderRadius: Radius.md,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetBtnCancel: {
    backgroundColor: Colours.bgCardDark,
  },
  sheetBtnSave: {
    backgroundColor: Colours.green,
    borderWidth: 1,
    borderColor: Colours.green,
  },
  sheetBtnCancelText: {
    color: Colours.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  sheetBtnSaveText: {
    color: Colours.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },

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
});
