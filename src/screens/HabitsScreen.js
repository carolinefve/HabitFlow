import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import {
  Colours,
  Radius,
  HeaderTitle,
  Spacing,
  SubHeading,
} from "../styles/global";

const GENERAL_CATEGORY = "General";
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEK_DAYS = [
  { short: "M", value: 1 },
  { short: "T", value: 2 },
  { short: "W", value: 3 },
  { short: "T", value: 4 },
  { short: "F", value: 5 },
  { short: "S", value: 6 },
  { short: "S", value: 0 },
];

const INITIAL_HABITS = [
  {
    id: "h-1",
    description: "Wake up at 7am",
    category: "Productivity",
    rawDate: new Date(2026, 1, 25),
    rawTime: new Date(2026, 1, 25, 7, 0),
    dateString: "25/02/2026",
    timeString: "07:00 AM",
    frequency: { type: "daily", days: null },
    duration: { hours: 0, minutes: 0 },
  },
  {
    id: "h-2",
    description: "Read for 20 minutes",
    category: "Learning",
    rawDate: new Date(2026, 1, 25),
    rawTime: new Date(2026, 1, 25, 21, 0),
    dateString: "25/02/2026",
    timeString: "",
    frequency: { type: "weekly", days: [1, 2, 3, 4, 5] },
    duration: { hours: 0, minutes: 20 },
  },
  {
    id: "h-3",
    description: "Gym",
    category: "Health & Fitness",
    rawDate: new Date(2026, 1, 25),
    rawTime: new Date(2026, 1, 25, 21, 0),
    dateString: "25/02/2026",
    timeString: "1:00 PM",
    frequency: { type: "weekly", days: [1, 2, 3, 4, 5] },
    duration: { hours: 1, minutes: 0 },
  },
];

export default function Habits() {
  // list state
  const [habits, setHabits] = useState(INITIAL_HABITS);
  const [completionLog, setCompletionLog] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState("manual");
  const [statusFilter, setStatusFilter] = useState("all");
  const [todayFilter, setTodayFilter] = useState(false);

  // form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(GENERAL_CATEGORY);
  const [categories, setCategories] = useState([
    GENERAL_CATEGORY,
    "Health & Fitness",
    "Learning",
    "Productivity",
  ]);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [frequencyType, setFrequencyType] = useState("daily");
  const [selectedDays, setSelectedDays] = useState([1, 2, 3, 4, 5]);
  const [intervalDays, setIntervalDays] = useState("2");
  const [durationHours, setDurationHours] = useState("0");
  const [durationMinutes, setDurationMinutes] = useState("30");

  // completion logging

  const todayString = () => new Date().toDateString();

  const isCompletedToday = (habitId) =>
    completionLog.some(
      (e) => e.habitId === habitId && e.date === todayString(),
    );

  const toggleCompletion = (habitId) => {
    const today = todayString();
    setCompletionLog((prev) =>
      prev.some((e) => e.habitId === habitId && e.date === today)
        ? prev.filter((e) => !(e.habitId === habitId && e.date === today))
        : [...prev, { habitId, date: today }],
    );
  };

  // today scheduling

  const isScheduledToday = (habit) => {
    if (!habit.frequency) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (habit.rawDate) {
      const start = new Date(habit.rawDate);
      start.setHours(0, 0, 0, 0);
      if (today < start) return false;
    }
    const { type, days } = habit.frequency;
    if (type === "daily") return true;
    if (type === "none") {
      const d = new Date(habit.rawDate);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    }
    if (type === "weekly") return (days || []).includes(new Date().getDay());
    if (type === "interval") {
      const start = new Date(habit.rawDate);
      start.setHours(0, 0, 0, 0);
      const diff = Math.round((today - start) / 86400000);
      return diff >= 0 && diff % days === 0;
    }
    return true;
  };

  // filtering and sorting

  const getFilteredAndSortedHabits = () => {
    const q = searchQuery.toLowerCase();
    let result = habits.filter((h) => {
      const matchesSearch =
        (h.description || "").toLowerCase().includes(q) ||
        (h.category || "").toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "completed"
            ? isCompletedToday(h.id)
            : !isCompletedToday(h.id);
      return (
        matchesSearch && matchesStatus && (!todayFilter || isScheduledToday(h))
      );
    });
    if (sortMode === "alphabetical")
      result.sort((a, b) =>
        (a.description || "").localeCompare(b.description || ""),
      );
    else if (sortMode === "date/time")
      result.sort((a, b) => {
        const dateDiff =
          (a.rawDate?.getTime() || 0) - (b.rawDate?.getTime() || 0);
        if (dateDiff !== 0) return dateDiff;
        const hourDiff =
          (a.rawTime?.getHours() || 0) - (b.rawTime?.getHours() || 0);
        if (hourDiff !== 0) return hourDiff;
        return (a.rawTime?.getMinutes() || 0) - (b.rawTime?.getMinutes() || 0);
      });
    else if (sortMode === "newest")
      result.sort((a, b) => (b.id || "").localeCompare(a.id || ""));
    return result;
  };

  // category management

  const handleAddCustomCategory = () => {
    Alert.prompt("New Category", "Enter category name:", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Add",
        onPress: (text) => {
          const trimmed = text?.trim();
          if (trimmed && !categories.includes(trimmed)) {
            setCategories([...categories, trimmed]);
            setCategory(trimmed);
          }
        },
      },
    ]);
  };

  const handleLongPressCategory = (cat) => {
    if (cat === GENERAL_CATEGORY) {
      Alert.alert(
        "Protected Category",
        "The General category cannot be edited or deleted.",
      );
      return;
    }
    Alert.alert(cat, "What would you like to do with this category?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Rename",
        onPress: () =>
          Alert.prompt(
            "Rename Category",
            `Rename "${cat}" to:`,
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Save",
                onPress: (newName) => {
                  const trimmed = newName?.trim();
                  if (!trimmed) return;
                  if (categories.includes(trimmed)) {
                    Alert.alert(
                      "Already exists",
                      "A category with that name already exists.",
                    );
                    return;
                  }
                  setCategories((prev) =>
                    prev.map((c) => (c === cat ? trimmed : c)),
                  );
                  setHabits((prev) =>
                    prev.map((h) =>
                      h.category === cat ? { ...h, category: trimmed } : h,
                    ),
                  );
                  if (category === cat) setCategory(trimmed);
                },
              },
            ],
            "plain-text",
            cat,
          ),
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const count = habits.filter((h) => h.category === cat).length;
          const msg =
            count > 0
              ? `Delete "${cat}"? The ${count} habit${count !== 1 ? "s" : ""} in this category will be moved to General.`
              : `Delete "${cat}"?`;
          Alert.alert("Delete Category", msg, [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => {
                setCategories((prev) => prev.filter((c) => c !== cat));
                setHabits((prev) =>
                  prev.map((h) =>
                    h.category === cat
                      ? { ...h, category: GENERAL_CATEGORY }
                      : h,
                  ),
                );
                if (category === cat) setCategory(GENERAL_CATEGORY);
              },
            },
          ]);
        },
      },
    ]);
  };

  // save / reset / delete

  const saveHabit = () => {
    if (!description.trim()) {
      Alert.alert(
        "Missing Name",
        "Please enter a name for your habit before saving.",
        [{ text: "OK" }],
      );
      return;
    }
    if (frequencyType === "weekly" && selectedDays.length === 0) {
      Alert.alert(
        "Select Days",
        "Please select at least one day for your weekly habit.",
        [{ text: "OK" }],
      );
      return;
    }
    if (frequencyType === "interval" && parseInt(intervalDays) < 1) {
      Alert.alert(
        "Invalid Interval",
        "Please enter a valid number of days (1 or more).",
        [{ text: "OK" }],
      );
      return;
    }
    const standardizedDate = new Date(date);
    standardizedDate.setHours(0, 0, 0, 0);
    const habitData = {
      description,
      category,
      rawDate: standardizedDate,
      rawTime: time,
      dateString: date.toLocaleDateString("en-GB"),
      timeString: time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      frequency: {
        type: frequencyType,
        days:
          frequencyType === "weekly"
            ? selectedDays
            : frequencyType === "interval"
              ? parseInt(intervalDays)
              : null,
      },
      duration: {
        hours: parseInt(durationHours) || 0,
        minutes: parseInt(durationMinutes) || 0,
      },
    };
    if (editingId) {
      Alert.alert(
        "Save Changes?",
        "Do you want to save the changes to this habit?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Save",
            onPress: () => {
              setHabits((prev) =>
                prev.map((h) =>
                  h.id === editingId ? { ...h, ...habitData } : h,
                ),
              );
              resetForm();
            },
          },
        ],
      );
    } else {
      setHabits((prev) => [
        { id: Date.now().toString(), ...habitData },
        ...prev,
      ]);
      resetForm();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setDescription("");
    setCategory(GENERAL_CATEGORY);
    setFrequencyType("daily");
    setSelectedDays([1, 2, 3, 4, 5]);
    setIntervalDays("2");
    setDurationHours("0");
    setDurationMinutes("30");
    setShowForm(false);
  };

  const openEditForm = (item) => {
    setEditingId(item.id);
    setDescription(item.description);
    setCategory(item.category);
    if (item.rawDate) setDate(new Date(item.rawDate));
    if (item.rawTime) setTime(new Date(item.rawTime));
    if (item.frequency) {
      setFrequencyType(item.frequency.type);
      if (item.frequency.type === "weekly")
        setSelectedDays(item.frequency.days);
      if (item.frequency.type === "interval")
        setIntervalDays(String(item.frequency.days));
    }
    if (item.duration) {
      setDurationHours(String(item.duration.hours || 0));
      setDurationMinutes(String(item.duration.minutes || 0));
    }
    setShowForm(true);
  };

  const handleDelete = (id, name) => {
    Alert.alert("Delete Habit", `Are you sure you want to delete "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => setHabits((prev) => prev.filter((h) => h.id !== id)),
      },
    ]);
  };

  // manual reorder

  const moveHabit = (id, direction) => {
    setHabits((prev) => {
      const i = prev.findIndex((h) => h.id === id);
      const j = i + direction;
      if (j < 0 || j >= prev.length) return prev;
      const result = [...prev];
      [result[i], result[j]] = [result[j], result[i]];
      return result;
    });
  };

  // display helpers

  const getDurationDisplay = ({ hours = 0, minutes = 0 } = {}) => {
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    return parts.join(" ");
  };

  const getFrequencyDisplay = (frequency) => {
    if (!frequency || frequency.type === "daily") return "Every day";
    if (frequency.type === "none") return "One Time";
    if (frequency.type === "interval")
      return frequency.days === 1
        ? "Every day"
        : `Every ${frequency.days} days`;
    const dayName = (d) => (d === 0 ? "Sun" : DAY_NAMES[d - 1]);
    const sorted = [...frequency.days].sort(
      (a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b),
    );
    if (sorted.length === 7) return "Every day";
    if (sorted.length === 5 && [1, 2, 3, 4, 5].every((d) => sorted.includes(d)))
      return "Weekdays";
    if (sorted.length === 2 && [6, 0].every((d) => sorted.includes(d)))
      return "Weekends";
    const consecutive = sorted.every(
      (d, i) => i === 0 || d === sorted[i - 1] + 1,
    );
    if (consecutive && sorted.length > 2)
      return `${dayName(sorted[0])}-${dayName(sorted[sorted.length - 1])}`;
    return sorted.map(dayName).join(", ");
  };

  // sub-components

  const Stepper = ({ value, onDecrement, onIncrement }) => (
    <View style={styles.stepperContainer}>
      <TouchableOpacity
        style={styles.stepperButton}
        onPress={onDecrement}
      >
        <Ionicons
          name="remove"
          size={18}
          color={Colours.textPrimary}
        />
      </TouchableOpacity>
      <View style={styles.stepperValue}>
        <Text style={styles.stepperValueText}>{value}</Text>
      </View>
      <TouchableOpacity
        style={styles.stepperButton}
        onPress={onIncrement}
      >
        <Ionicons
          name="add"
          size={18}
          color={Colours.textPrimary}
        />
      </TouchableOpacity>
    </View>
  );

  const DurationPicker = () => (
    <View style={styles.formFieldGroup}>
      <Text style={styles.formFieldLabel}>Duration</Text>
      <View style={styles.durationRow}>
        {[
          {
            label: "Hours",
            val: durationHours,
            set: setDurationHours,
            max: 23,
            step: 1,
          },
          {
            label: "Minutes",
            val: durationMinutes,
            set: setDurationMinutes,
            max: 55,
            step: 5,
          },
        ].map(({ label, val, set, max, step }) => (
          <View
            key={label}
            style={styles.durationSection}
          >
            <Text style={styles.durationLabel}>{label}</Text>
            <Stepper
              value={val || "0"}
              onDecrement={() => {
                const v = parseInt(val) || 0;
                if (v >= step) set(String(v - step));
              }}
              onIncrement={() => {
                const v = parseInt(val) || 0;
                if (v < max) set(String(v + step));
              }}
            />
          </View>
        ))}
      </View>
    </View>
  );

  const FrequencyPicker = () => (
    <View style={styles.formFieldGroup}>
      <Text style={styles.formFieldLabel}>Repeat</Text>
      <View style={styles.freqTypeRow}>
        {["none", "daily", "weekly", "interval"].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.freqBtn,
              frequencyType === type && styles.freqBtnActive,
            ]}
            onPress={() => setFrequencyType(type)}
          >
            <Text
              style={[
                styles.freqBtnText,
                frequencyType === type && styles.freqBtnTextActive,
              ]}
            >
              {type === "interval"
                ? "Every N"
                : type === "none"
                  ? "One-time"
                  : type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {frequencyType === "weekly" && (
        <View style={styles.daysRow}>
          {WEEK_DAYS.map((day) => (
            <TouchableOpacity
              key={day.value}
              style={[
                styles.dayCircle,
                selectedDays.includes(day.value) && styles.dayCircleActive,
              ]}
              onPress={() =>
                setSelectedDays((prev) =>
                  prev.includes(day.value)
                    ? prev.filter((d) => d !== day.value)
                    : [...prev, day.value].sort(
                        (a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b),
                      ),
                )
              }
            >
              <Text
                style={[
                  styles.dayText,
                  selectedDays.includes(day.value) && styles.dayTextActive,
                ]}
              >
                {day.short}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {frequencyType === "interval" && (
        <View style={styles.intervalRow}>
          <Text style={styles.intervalLabel}>Every</Text>
          <Stepper
            value={intervalDays || "1"}
            onDecrement={() => {
              const v = parseInt(intervalDays) || 1;
              if (v > 1) setIntervalDays(String(v - 1));
            }}
            onIncrement={() => {
              const v = parseInt(intervalDays) || 1;
              if (v < 99) setIntervalDays(String(v + 1));
            }}
          />
          <Text style={styles.intervalLabel}>days</Text>
        </View>
      )}
    </View>
  );

  // habit card

  const canReorder =
    sortMode === "manual" &&
    !searchQuery &&
    statusFilter === "all" &&
    !todayFilter;

  const renderHabit = ({ item }) => {
    const done = isCompletedToday(item.id);
    const durationText = item.duration ? getDurationDisplay(item.duration) : "";
    return (
      <View style={styles.card}>
        {canReorder && (
          <View style={styles.moveButtons}>
            <TouchableOpacity onPress={() => moveHabit(item.id, -1)}>
              <Ionicons
                name="chevron-up"
                size={20}
                color={Colours.textDisabled}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => moveHabit(item.id, 1)}>
              <Ionicons
                name="chevron-down"
                size={20}
                color={Colours.textDisabled}
              />
            </TouchableOpacity>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.cardCategory}>{item.category}</Text>
          <Text style={styles.cardDesc}>{item.description}</Text>
          <Text style={styles.cardMeta}>
            {item.dateString} • {item.timeString}
            {durationText ? ` • ${durationText}` : ""}
          </Text>
          <Text style={styles.cardFrequency}>
            {getFrequencyDisplay(item.frequency)}
          </Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={done ? styles.doneBtn : styles.tbdBtn}
            onPress={() => toggleCompletion(item.id)}
          >
            <Text style={styles.cardBtnText}>{done ? "Done" : "TBD"}</Text>
          </TouchableOpacity>
          <View style={styles.cardEditRow}>
            <TouchableOpacity onPress={() => openEditForm(item)}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(item.id, item.description)}
            >
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={["bottom", "left", "right"]}
    >
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Habits</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={18}
            color={Colours.textDisabled}
            style={{ marginRight: 8 }}
          />
          <TextInput
            placeholder="Search by name or category"
            placeholderTextColor={Colours.textDisabled}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      <View style={styles.filterWrapper}>
        <View style={styles.filterRow}>
          <Text style={styles.filterRowLabel}>Status</Text>
          <View style={styles.filterChips}>
            {[
              ["All", "all"],
              ["TBD", "pending"],
              ["Done", "completed"],
            ].map(([label, value]) => (
              <TouchableOpacity
                key={value}
                onPress={() => setStatusFilter(value)}
                style={[
                  styles.chip,
                  statusFilter === value && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    statusFilter === value && styles.chipTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={styles.chipDivider} />
            <TouchableOpacity
              onPress={() => setTodayFilter((p) => !p)}
              style={[styles.chip, todayFilter && styles.chipToday]}
            >
              <Text
                style={[styles.chipText, todayFilter && styles.chipTextActive]}
              >
                Today
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterRowLabel}>Sort</Text>
          <View style={styles.filterChips}>
            {[
              ["Manual", "manual"],
              ["A–Z", "alphabetical"],
              ["Date", "date/time"],
              ["Newest", "newest"],
            ].map(([label, mode]) => (
              <TouchableOpacity
                key={mode}
                onPress={() => setSortMode(mode)}
                style={[styles.chip, sortMode === mode && styles.chipActive]}
              >
                <Text
                  style={[
                    styles.chipText,
                    sortMode === mode && styles.chipTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <FlatList
        data={getFilteredAndSortedHabits()}
        renderItem={renderHabit}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>
              {habits.length === 0 ? "🌱" : "🔭"}
            </Text>
            <Text style={styles.emptyTitle}>
              {habits.length === 0 ? "No habits yet" : "No habits found"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {habits.length === 0
                ? "Tap + to get started"
                : "Try a different search or filter"}
            </Text>
          </View>
        )}
      />

      {showForm && (
        <>
          <Pressable
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: Colours.backdropColor },
            ]}
            onPress={() => {
              setShowForm(false);
              setEditingId(null);
            }}
          />
          <View style={styles.sheetPosition}>
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>
                {editingId ? "Edit Habit" : "New Habit"}
              </Text>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Name */}
                <View style={styles.formFieldGroup}>
                  <Text style={styles.formFieldLabel}>Name</Text>
                  <TextInput
                    placeholder="Habit name"
                    placeholderTextColor={Colours.textDisabled}
                    style={styles.input}
                    value={description}
                    onChangeText={setDescription}
                    autoFocus
                  />
                </View>

                {/* Category */}
                <View style={styles.formFieldGroup}>
                  <Text style={styles.formFieldLabel}>
                    Category{" "}
                    <Text style={styles.formFieldLabelHint}>
                      Long press to edit or delete
                    </Text>
                  </Text>
                  <View style={styles.categoryRow}>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.catChip,
                          category === cat && styles.catChipActive,
                          cat === GENERAL_CATEGORY && styles.catChipGeneral,
                        ]}
                        onPress={() => setCategory(cat)}
                        onLongPress={() => handleLongPressCategory(cat)}
                        delayLongPress={400}
                      >
                        <Text
                          style={[
                            styles.catChipText,
                            category === cat && styles.catChipTextActive,
                          ]}
                          numberOfLines={1}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      style={styles.catChipAdd}
                      onPress={handleAddCustomCategory}
                    >
                      <Text style={styles.catChipText}>New +</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Date & Time */}
                <View style={styles.formFieldGroup}>
                  <Text style={styles.formFieldLabel}>
                    Start Date &amp; Time
                  </Text>
                  <View style={styles.dateTimeRow}>
                    {[
                      {
                        label: "Date",
                        mode: "date",
                        value: date,
                        onChange: setDate,
                      },
                      {
                        label: "Time",
                        mode: "time",
                        value: time,
                        onChange: setTime,
                      },
                    ].map(({ label, mode, value, onChange }) => (
                      <View
                        key={label}
                        style={styles.dateTimeField}
                      >
                        <Text style={styles.dateTimeFieldLabel}>{label}</Text>
                        <DateTimePicker
                          value={value}
                          mode={mode}
                          display="compact"
                          themeVariant="dark"
                          textColor={Colours.textPrimary}
                          onChange={(e, v) => v && onChange(v)}
                        />
                      </View>
                    ))}
                  </View>
                </View>

                {/* Duration */}
                <DurationPicker />

                {/* Frequency */}
                <FrequencyPicker />

                {/* Footer buttons */}
                <View style={styles.sheetFooter}>
                  <TouchableOpacity
                    style={[styles.sheetBtn, styles.sheetBtnCancel]}
                    onPress={resetForm}
                  >
                    <Text style={styles.sheetBtnCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.sheetBtn, styles.sheetBtnSave]}
                    onPress={saveHabit}
                  >
                    <Text style={styles.sheetBtnSaveText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </>
      )}

      {!showForm && (
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.fab}
          onPress={() => {
            setDate(new Date());
            setTime(new Date());
            setShowForm(true);
          }}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
