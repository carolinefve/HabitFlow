import { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import DatePicker, { getFormatedDate } from "react-native-modern-datepicker";
import { Colours, Radius, Spacing, HeaderTitle } from "../styles/global";

export default function Calendar() {
  const now = new Date();
  const [currentDate, setCurrentDate] = useState(now);
  const today = now.getDate();
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const systemMonth = now.getMonth();

  const defaultDate = getFormatedDate(now, "YYYY/MM/DD");

  var numDaysInMonth = getDaysInMonth(month, year);
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7;

  const calendarCells = [];
  for (var i = 0; i < startOffset; i++) calendarCells.push(null);
  for (var i = 1; i <= numDaysInMonth; i++) calendarCells.push(i);
  while (calendarCells.length < 42) calendarCells.push(null);

  const [deadlines, setDeadlines] = useState([
    {
      id: 0,
      title: "Test 1",
      description: "This is some sample text",
      date: new Date(2026, 2, 20, 23, 59),
      condition: false,
    },
    {
      id: 1,
      title: "Test 2",
      description: "This is some sample text",
      date: new Date(2026, 2, 23, 23, 59),
      condition: false,
    },
    {
      id: 2,
      title: "Test 3",
      description: "This is some sample text",
      date: new Date(2026, 2, 19, 23, 59),
      condition: false,
    },
  ]);

  function hasDeadline(day) {
    return deadlines.some((deadline) => {
      const deadlineDate = new Date(deadline.date);
      return (
        !deadline.condition &&
        deadlineDate.getDate() === day &&
        deadlineDate.getMonth() === month &&
        deadlineDate.getFullYear() === year
      );
    });
  }

  const filteredDeadlines = selectedDay
    ? deadlines.filter((item) => {
        const d = new Date(item.date);
        return (
          d.getDate() === Number(selectedDay) &&
          d.getMonth() === month &&
          d.getFullYear() === year
        );
      })
    : deadlines;

  const sortedDeadlines = [...filteredDeadlines].sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });

  const [selectedDay, setSelectedDay] = useState();
  const [selectedDeadline, setSelectedDeadline] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("12:00");
  const [modalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const DAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => {
            setCurrentDate(new Date(year, month - 1, 1));
            setSelectedDay();
          }}
        >
          <Text style={styles.navButtonText}>Prev</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{monthName(month)}</Text>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => {
            setCurrentDate(new Date(year, month + 1, 1));
            setSelectedDay();
          }}
        >
          <Text style={styles.navButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

      {/* Day-of-week labels */}
      <View style={styles.dayLabelRow}>
        {DAY_LABELS.map((label) => (
          <Text
            key={label}
            style={styles.dayLabel}
          >
            {label}
          </Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {calendarCells.map((day, index) => {
          const isToday = day === today && systemMonth === month;
          const isSelected = day === selectedDay;
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.calendarCell,
                isToday && styles.calendarCellToday,
                isSelected && styles.calendarCellSelected,
              ]}
              onPress={() =>
                day === selectedDay
                  ? setSelectedDay()
                  : day && setSelectedDay(day)
              }
            >
              {day && (
                <>
                  {hasDeadline(day) && <View style={styles.deadlineDot} />}
                  <Text
                    style={[
                      styles.calendarCellText,
                      isToday && styles.calendarCellTextToday,
                      isSelected && styles.calendarCellTextSelected,
                    ]}
                  >
                    {day}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Deadline list */}
      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.listHeading}>
          {selectedDay
            ? `Deadlines for ${selectedDay} ${monthName(month)}`
            : "All deadlines"}
        </Text>

        {sortedDeadlines.length === 0 && (
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyStateTitle}>No deadlines</Text>
            <Text style={styles.emptyStateSubtitle}>
              Tap + to add a new deadline.
            </Text>
          </View>
        )}

        {sortedDeadlines.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.deadlineCard,
              item.condition && styles.deadlineCardDone,
            ]}
            onPress={() => setSelectedDeadline(item)}
          >
            <View style={styles.deadlineCardAccent} />
            <View style={styles.deadlineCardBody}>
              <Text
                style={styles.deadlineCardTitle}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text
                style={styles.deadlineCardDate}
                numberOfLines={1}
              >
                Due:{" "}
                {item?.date?.toLocaleString([], {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* ── Detail modal ── */}
      <Modal
        visible={selectedDeadline !== null}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{selectedDeadline?.title}</Text>

            <Text style={styles.detailDate}>
              Due:{" "}
              {selectedDeadline?.date?.toLocaleString([], {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </Text>

            {selectedDeadline?.description ? (
              <Text style={styles.detailDescription}>
                {selectedDeadline.description}
              </Text>
            ) : null}

            <View style={styles.footerButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => {
                  setSelectedDeadline(null);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.cancelText}>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={() => {
                  setDeadlines((prev) =>
                    prev.map((item) =>
                      item.id === selectedDeadline.id
                        ? { ...item, condition: true }
                        : item,
                    ),
                  );
                  setSelectedDeadline(null);
                }}
              >
                <Text style={styles.saveText}>Complete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Create modal ── */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Create a New Event</Text>

            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={styles.formContent}
            >
              {/* Title */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Title"
                  placeholderTextColor={Colours.textDisabled}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              {/* Description */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.notesInput]}
                  placeholder="Description"
                  placeholderTextColor={Colours.textDisabled}
                  value={description}
                  onChangeText={setDescription}
                  multiline={true}
                />
              </View>

              {/* Date */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Date</Text>
                <TouchableOpacity
                  style={styles.timeTag}
                  onPress={() => setShowDatePicker(!showDatePicker)}
                >
                  <Text style={styles.timeTagText}>{date}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DatePicker
                    style={{ height: "0%" }}
                    mode="calendar"
                    isGregorian={true}
                    selected={defaultDate}
                    minimumDate={defaultDate}
                    onDateChange={setDate}
                    onSelectedChange={(selectedDate) => setDate(selectedDate)}
                    options={{
                      backgroundColor: Colours.bgCardDark,
                      textHeaderColor: Colours.textPrimary,
                      textDefaultColor: Colours.textPrimary,
                      selectedTextColor: Colours.textPrimary,
                      mainColor: Colours.brandBlue,
                      textSecondaryColor: Colours.textSecondary,
                      borderColor: Colours.borderMid,
                    }}
                  />
                )}
              </View>

              {/* Time */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Time</Text>
                <TouchableOpacity
                  style={styles.timeTag}
                  onPress={() => setShowTimePicker(!showTimePicker)}
                >
                  <Text style={styles.timeTagText}>{time}</Text>
                </TouchableOpacity>
                {showTimePicker && (
                  <DatePicker
                    style={{ height: "0%" }}
                    mode="time"
                    isGregorian={true}
                    onTimeChange={setTime}
                    onSelectedChange={(selectedTime) => setTime(selectedTime)}
                    options={{
                      backgroundColor: Colours.bgCardDark,
                      textHeaderColor: Colours.textPrimary,
                      textDefaultColor: Colours.textPrimary,
                      selectedTextColor: Colours.textPrimary,
                      mainColor: Colours.brandBlue,
                      textSecondaryColor: Colours.textSecondary,
                      borderColor: Colours.borderMid,
                    }}
                  />
                )}
              </View>
            </ScrollView>

            <View style={styles.footerButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => {
                  setTitle("");
                  setDescription("");
                  setDate(defaultDate);
                  setModalVisible(false);
                  setShowDatePicker(false);
                  setShowTimePicker(false);
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={() => {
                  const [y, m, d] = date.split("/").map(Number);
                  const [hour, minute] = time.split(":").map(Number);
                  const combinedDate = new Date(y, m - 1, d, hour, minute);
                  const newDeadLine = {
                    id: Date.now(),
                    title,
                    description,
                    date: combinedDate,
                  };
                  setDeadlines([...deadlines, newDeadLine]);
                  setTitle("");
                  setDescription("");
                  setDate(defaultDate);
                  setTime("12:00");
                  setModalVisible(false);
                  setShowDatePicker(false);
                  setShowTimePicker(false);
                }}
              >
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
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
    color: Colours.textPrimary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
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
    position: "absolute",
    right: Spacing.screenPaddingHorizontal,
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

// ===== Helper Functions =====
function getDaysInMonth(month, year) {
  switch (month) {
    case 0:
    case 2:
    case 4:
    case 6:
    case 7:
    case 9:
    case 11:
      return 31;
    case 3:
    case 5:
    case 8:
    case 10:
      return 30;
    case 1:
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28;
    default:
      return "Invalid Month";
  }
}

function monthName(index) {
  return (
    [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ][index] ?? "Invalid Month Index"
  );
}
