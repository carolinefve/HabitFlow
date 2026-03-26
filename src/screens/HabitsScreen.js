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
  GENERAL_CATEGORY,
  DAY_NAMES,
  WEEK_DAYS,
  INITIAL_CATEGORIES,
  INITIAL_HABITS,
  isScheduledToday,
  getDurationDisplay,
  getFrequencyDisplay,
} from "../services/habitsService";

import styles from "../styles/habitsStyles";
import { Colours } from "../styles/global";

export default function Habits() {
  // lis../services/habitsService
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
  const [categories, setCategories] = useState([INITIAL_CATEGORIES]);
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
            🔄 {getFrequencyDisplay(item.frequency)}
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
