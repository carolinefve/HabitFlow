import { useState } from "react";
import DatePicker, { getFormatedDate } from "react-native-modern-datepicker";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";

import {
  DAY_LABELS,
  initialDeadlines,
  getDaysInMonth,
  monthName,
} from "../services/calendarService";

import styles from "../styles/calendarStyles";
import { Colours } from "../styles/globalStyles";

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

  const [deadlines, setDeadlines] = useState(initialDeadlines);

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
