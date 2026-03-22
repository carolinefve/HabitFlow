import React, { useState } from "react";
import {
  View, Text, StyleSheet, FlatList, ScrollView,
  TouchableOpacity, TextInput, Pressable, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from '@expo/vector-icons';

const GENERAL_CATEGORY = "General";
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEK_DAYS = [
  { short: 'M', value: 1 }, { short: 'T', value: 2 }, { short: 'W', value: 3 },
  { short: 'T', value: 4 }, { short: 'F', value: 5 }, { short: 'S', value: 6 }, { short: 'S', value: 0 },
];

export default function Habits() {
  // list state
  const [habits, setHabits] = useState([]);
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
  const [categories, setCategories] = useState([GENERAL_CATEGORY, "Health & Fitness", "Learning", "Productivity"]);
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
    completionLog.some(e => e.habitId === habitId && e.date === todayString());

  const toggleCompletion = (habitId) => {
    const today = todayString();
    setCompletionLog(prev =>
      prev.some(e => e.habitId === habitId && e.date === today)
        ? prev.filter(e => !(e.habitId === habitId && e.date === today))
        : [...prev, { habitId, date: today }]
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
    if (type === 'daily') return true;
    if (type === 'none') {
      const d = new Date(habit.rawDate);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    }
    if (type === 'weekly') return (days || []).includes(new Date().getDay());
    if (type === 'interval') {
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
    let result = habits.filter(h => {
      const matchesSearch = (h.description || "").toLowerCase().includes(q) ||
        (h.category || "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" ? true
        : statusFilter === "completed" ? isCompletedToday(h.id) : !isCompletedToday(h.id);
      return matchesSearch && matchesStatus && (!todayFilter || isScheduledToday(h));
    });

    if (sortMode === "alphabetical")
      result.sort((a, b) => (a.description || "").localeCompare(b.description || ""));
    else if (sortMode === "date/time")
      result.sort((a, b) => {
        const dateDiff = (a.rawDate?.getTime() || 0) - (b.rawDate?.getTime() || 0);
        if (dateDiff !== 0) return dateDiff;
        const hourDiff = (a.rawTime?.getHours() || 0) - (b.rawTime?.getHours() || 0);
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
      { text: "Add", onPress: (text) => {
        const trimmed = text?.trim();
        if (trimmed && !categories.includes(trimmed)) {
          setCategories([...categories, trimmed]);
          setCategory(trimmed);
        }
      }}
    ]);
  };

  const handleLongPressCategory = (cat) => {
    if (cat === GENERAL_CATEGORY) {
      Alert.alert("Protected Category", "The General category cannot be edited or deleted.");
      return;
    }
    Alert.alert(cat, "What would you like to do with this category?", [
      { text: "Cancel", style: "cancel" },
      { text: "Rename", onPress: () =>
        Alert.prompt("Rename Category", `Rename "${cat}" to:`, [
          { text: "Cancel", style: "cancel" },
          { text: "Save", onPress: (newName) => {
            const trimmed = newName?.trim();
            if (!trimmed) return;
            if (categories.includes(trimmed)) {
              Alert.alert("Already exists", "A category with that name already exists.");
              return;
            }
            setCategories(prev => prev.map(c => c === cat ? trimmed : c));
            setHabits(prev => prev.map(h => h.category === cat ? { ...h, category: trimmed } : h));
            if (category === cat) setCategory(trimmed);
          }}
        ], "plain-text", cat)
      },
      { text: "Delete", style: "destructive", onPress: () => {
        const count = habits.filter(h => h.category === cat).length;
        const msg = count > 0
          ? `Delete "${cat}"? The ${count} habit${count !== 1 ? 's' : ''} in this category will be moved to General.`
          : `Delete "${cat}"?`;
        Alert.alert("Delete Category", msg, [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: () => {
            setCategories(prev => prev.filter(c => c !== cat));
            setHabits(prev => prev.map(h => h.category === cat ? { ...h, category: GENERAL_CATEGORY } : h));
            if (category === cat) setCategory(GENERAL_CATEGORY);
          }}
        ]);
      }}
    ]);
  };

  // save / reset / delete

  const saveHabit = () => {
    if (!description.trim()) {
      Alert.alert("Missing Name", "Please enter a name for your habit before saving.", [{ text: "OK" }]);
      return;
    }
    if (frequencyType === 'weekly' && selectedDays.length === 0) {
      Alert.alert("Select Days", "Please select at least one day for your weekly habit.", [{ text: "OK" }]);
      return;
    }
    if (frequencyType === 'interval' && parseInt(intervalDays) < 1) {
      Alert.alert("Invalid Interval", "Please enter a valid number of days (1 or more).", [{ text: "OK" }]);
      return;
    }

    const standardizedDate = new Date(date);
    standardizedDate.setHours(0, 0, 0, 0);

    const habitData = {
      description,
      category,
      rawDate: standardizedDate,
      rawTime: time,
      dateString: date.toLocaleDateString('en-GB'),
      timeString: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      frequency: {
        type: frequencyType,
        days: frequencyType === 'weekly' ? selectedDays
          : frequencyType === 'interval' ? parseInt(intervalDays) : null,
      },
      duration: {
        hours: parseInt(durationHours) || 0,
        minutes: parseInt(durationMinutes) || 0,
      },
    };

    if (editingId) {
      Alert.alert("Save Changes?", "Do you want to save the changes to this habit?", [
        { text: "Cancel", style: "cancel" },
        { text: "Save", onPress: () => {
          setHabits(prev => prev.map(h => h.id === editingId ? { ...h, ...habitData } : h));
          resetForm();
        }}
      ]);
    } else {
      setHabits(prev => [{ id: Date.now().toString(), ...habitData }, ...prev]);
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
      if (item.frequency.type === 'weekly') setSelectedDays(item.frequency.days);
      if (item.frequency.type === 'interval') setIntervalDays(String(item.frequency.days));
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
      { text: "Delete", style: "destructive", onPress: () => setHabits(prev => prev.filter(h => h.id !== id)) }
    ]);
  };

  // manual reorder

  const moveHabit = (id, direction) => {
    setHabits(prev => {
      const i = prev.findIndex(h => h.id === id);
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
    return parts.join(' ');
  };

  const getFrequencyDisplay = (frequency) => {
    if (!frequency || frequency.type === 'daily') return "Every day";
    if (frequency.type === 'none') return "One Time";
    if (frequency.type === 'interval')
      return frequency.days === 1 ? "Every day" : `Every ${frequency.days} days`;

    const dayName = d => d === 0 ? 'Sun' : DAY_NAMES[d - 1];
    const sorted = [...frequency.days].sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b));
    if (sorted.length === 7) return "Every day";
    if (sorted.length === 5 && [1,2,3,4,5].every(d => sorted.includes(d))) return "Weekdays";
    if (sorted.length === 2 && [6,0].every(d => sorted.includes(d))) return "Weekends";
    const consecutive = sorted.every((d, i) => i === 0 || d === sorted[i-1] + 1);
    if (consecutive && sorted.length > 2) return `${dayName(sorted[0])}-${dayName(sorted[sorted.length-1])}`;
    return sorted.map(dayName).join(', ');
  };

  // sub-components

  const Stepper = ({ value, onDecrement, onIncrement }) => (
    <View style={styles.stepperContainer}>
      <TouchableOpacity style={styles.stepperButton} onPress={onDecrement}>
        <Ionicons name="remove" size={20} color="white" />
      </TouchableOpacity>
      <View style={styles.stepperValue}>
        <Text style={styles.stepperValueText}>{value}</Text>
      </View>
      <TouchableOpacity style={styles.stepperButton} onPress={onIncrement}>
        <Ionicons name="add" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );

  const DurationPicker = () => (
    <View style={styles.durationContainer}>
      <Text style={styles.sectionLabel}>Duration</Text>
      <View style={styles.durationRow}>
        {[
          { label: 'Hours', val: durationHours, set: setDurationHours, max: 23, step: 1 },
          { label: 'Minutes', val: durationMinutes, set: setDurationMinutes, max: 55, step: 5 },
        ].map(({ label, val, set, max, step }) => (
          <View key={label} style={styles.durationSection}>
            <Text style={styles.durationLabel}>{label}</Text>
            <Stepper
              value={val || "0"}
              onDecrement={() => { const v = parseInt(val) || 0; if (v >= step) set(String(v - step)); }}
              onIncrement={() => { const v = parseInt(val) || 0; if (v < max) set(String(v + step)); }}
            />
          </View>
        ))}
      </View>
    </View>
  );

  const FrequencyPicker = () => (
    <View style={styles.frequencyContainer}>
      <Text style={styles.sectionLabel}>Repeat</Text>
      <View style={styles.frequencyTypeRow}>
        {['none', 'daily', 'weekly', 'interval'].map(type => (
          <TouchableOpacity
            key={type}
            style={[styles.freqBtn, frequencyType === type && styles.freqBtnActive]}
            onPress={() => setFrequencyType(type)}
          >
            <Text style={[styles.freqBtnText, frequencyType === type && styles.freqBtnTextActive]}>
              {type === 'interval' ? 'Every N Days' : type === 'none' ? 'One-time' : type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {frequencyType === 'weekly' && (
        <View style={styles.daysRow}>
          {WEEK_DAYS.map(day => (
            <TouchableOpacity
              key={day.value}
              style={[styles.dayCircle, selectedDays.includes(day.value) && styles.dayCircleActive]}
              onPress={() => setSelectedDays(prev =>
                prev.includes(day.value)
                  ? prev.filter(d => d !== day.value)
                  : [...prev, day.value].sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b))
              )}
            >
              <Text style={[styles.dayText, selectedDays.includes(day.value) && styles.dayTextActive]}>{day.short}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {frequencyType === 'interval' && (
        <View style={styles.intervalRow}>
          <Text style={styles.intervalLabel}>Every</Text>
          <Stepper
            value={intervalDays || "1"}
            onDecrement={() => { const v = parseInt(intervalDays) || 1; if (v > 1) setIntervalDays(String(v - 1)); }}
            onIncrement={() => { const v = parseInt(intervalDays) || 1; if (v < 99) setIntervalDays(String(v + 1)); }}
          />
          <Text style={styles.intervalLabel}>days</Text>
        </View>
      )}
    </View>
  );

  // habit card

  const canReorder = sortMode === 'manual' && !searchQuery && statusFilter === 'all' && !todayFilter;

  const renderHabit = ({ item }) => {
    const done = isCompletedToday(item.id);
    const durationText = item.duration ? getDurationDisplay(item.duration) : '';
    return (
      <View style={styles.card}>
        {canReorder && (
          <View style={styles.moveButtons}>
            <TouchableOpacity onPress={() => moveHabit(item.id, -1)}>
              <Ionicons name="chevron-up" size={20} color="#8e8e93" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => moveHabit(item.id, 1)}>
              <Ionicons name="chevron-down" size={20} color="#8e8e93" />
            </TouchableOpacity>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.cardCategory}>{item.category}</Text>
          <Text style={styles.cardDesc}>{item.description}</Text>
          <Text style={styles.cardMeta}>
            {item.dateString} • {item.timeString}{durationText ? ` • ${durationText}` : ''}
          </Text>
          <Text style={styles.cardFrequency}>🔄 {getFrequencyDisplay(item.frequency)}</Text>
        </View>
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={done ? styles.compBtn : styles.tbdBtn} onPress={() => toggleCompletion(item.id)}>
            <Text style={styles.btnTextSmall}>{done ? "Done" : "TBD"}</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity onPress={() => openEditForm(item)}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id, item.description)}>
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // render

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>My Habits</Text>
      </View>

      {/* search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBarWrapper}>
          <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            placeholder="Search by name or category"
            placeholderTextColor="#6b7280"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* filters */}
      <View style={styles.filterWrapper}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Status:</Text>
          <View style={styles.filterContainer}>
            {[['All', 'all'], ['TBD', 'pending'], ['Done', 'completed']].map(([label, value]) => (
              <TouchableOpacity
                key={value}
                onPress={() => setStatusFilter(value)}
                style={[styles.filterBtn, statusFilter === value && styles.filterBtnActive]}
              >
                <Text style={[styles.filterBtnText, statusFilter === value && styles.filterBtnTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.divider} />
            <TouchableOpacity
              onPress={() => setTodayFilter(p => !p)}
              style={[styles.filterBtn, todayFilter && styles.filterBtnToday]}
            >
              <Text style={[styles.filterBtnText, todayFilter && styles.filterBtnTextActive]}>Today's Habits</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Sort:</Text>
          <View style={styles.filterContainer}>
            {[['Manual', 'manual'], ['Alphabetical', 'alphabetical'], ['Date/Time', 'date/time'], ['Newest', 'newest']].map(([label, mode]) => (
              <TouchableOpacity
                key={mode}
                onPress={() => setSortMode(mode)}
                style={[styles.filterBtn, sortMode === mode && styles.filterBtnActive]}
              >
                <Text style={[styles.filterBtnText, sortMode === mode && styles.filterBtnTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* habit list */}
      <FlatList
        data={getFilteredAndSortedHabits()}
        renderItem={renderHabit}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderEmoji}>{habits.length === 0 ? "🌱" : "🔭"}</Text>
            <Text style={styles.placeholderTitle}>{habits.length === 0 ? "No habits yet" : "No habits found"}</Text>
            <Text style={styles.placeholderSubtitle}>
              {habits.length === 0 ? "Press the plus button to get started" : "Try a different keyword or status"}
            </Text>
          </View>
        )}
      />

      {/* form overlay */}
      {showForm && (
        <>
          <Pressable
            style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
            onPress={() => { setShowForm(false); setEditingId(null); }}
          />
          <View style={styles.formPosition}>
            <View style={styles.compactForm}>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={styles.formTitle}>{editingId ? "Edit Habit" : "New Habit"}</Text>

                <TextInput
                  placeholder="Habit Name"
                  placeholderTextColor="#6b7280"
                  style={styles.input}
                  value={description}
                  onChangeText={setDescription}
                  autoFocus
                />

                {/* category */}
                <Text style={styles.sectionLabel}>Category<Text style={styles.sectionLabel}> - Long press to edit or delete</Text></Text>
                <View style={styles.categoryRow}>
                  {categories.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[category === cat ? styles.catBtnActive : styles.catBtn, cat === GENERAL_CATEGORY && styles.catBtnGeneral]}
                      onPress={() => setCategory(cat)}
                      onLongPress={() => handleLongPressCategory(cat)}
                      delayLongPress={400}
                    >
                      <Text style={[styles.catText, category === cat && styles.catTextActive]} numberOfLines={1}>
                        {cat === GENERAL_CATEGORY ? "General" : cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity style={styles.catBtnAdd} onPress={handleAddCustomCategory}>
                    <Text style={styles.catText}>New +</Text>
                  </TouchableOpacity>
                </View>

                {/* date and time */}
                <Text style={styles.sectionLabel}>Start Date &amp; Time</Text>
                <View style={styles.dateTimeRow}>
                  {[
                    { label: 'Date', mode: 'date', value: date, onChange: setDate },
                    { label: 'Time', mode: 'time', value: time, onChange: setTime },
                  ].map(({ label, mode, value, onChange }) => (
                    <View key={label} style={styles.pickerField}>
                      <Text style={styles.fieldLabel}>{label}</Text>
                      <DateTimePicker
                        value={value}
                        mode={mode}
                        display="compact"
                        themeVariant="dark"
                        textColor="white"
                        onChange={(e, v) => v && onChange(v)}
                      />
                    </View>
                  ))}
                </View>

                {/* duration */}
                <DurationPicker />

                {/* frequency */}
                <FrequencyPicker />

                <View style={styles.formButtonRow}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
                    <Text style={styles.btnTextLarge}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={saveHabit}>
                    <Text style={styles.btnTextLarge}>Save Habit</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </>
      )}

      {/* fab */}
      {!showForm && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => { setDate(new Date()); setTime(new Date()); setShowForm(true); }}
        >
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // layout
  container: { flex: 1, backgroundColor: "#000" },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 10 },
  headerText: { color: "white", fontSize: 28, fontWeight: "bold" },
  fab: { position: 'absolute', bottom: 30, right: 25, width: 56, height: 56, borderRadius: 28, backgroundColor: '#0a84ff', justifyContent: 'center', alignItems: 'center' },

  // search
  searchContainer: { paddingHorizontal: 20, marginBottom: 15 },
  searchBarWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: "#1c1c1e", borderRadius: 12, borderWidth: 1, borderColor: '#2c2c2e', paddingHorizontal: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: "white", paddingVertical: 12, fontSize: 16 },

  // filters
  filterWrapper: { paddingHorizontal: 20, marginBottom: 15, gap: 12 },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  filterLabel: { color: '#8e8e93', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', width: 50 },
  filterContainer: { flexDirection: 'row', gap: 5, flexWrap: 'wrap' },
  filterBtn: { paddingVertical: 6, paddingHorizontal: 8, borderRadius: 12, backgroundColor: '#1c1c1e' },
  filterBtnActive: { backgroundColor: '#0a84ff' },
  filterBtnToday: { backgroundColor: '#34c759' },
  filterBtnText: { color: '#8e8e93', fontSize: 11, fontWeight: '600' },
  filterBtnTextActive: { color: 'white' },
  divider: { width: 1, height: 20, backgroundColor: '#3a3a3c', alignSelf: 'center' },

  // list
  listContent: { paddingHorizontal: 20, paddingTop: 5, paddingBottom: 20 },
  placeholderContainer: { marginTop: 60, alignItems: 'center' },
  placeholderEmoji: { fontSize: 70, marginBottom: 20 },
  placeholderTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  placeholderSubtitle: { color: '#8e8e93', fontSize: 16 },

  // card
  card: { backgroundColor: "#143296", borderRadius: 18, paddingVertical: 11, paddingHorizontal: 22, marginBottom: 10, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: '#091642' },
  moveButtons: { flexDirection: 'column', justifyContent: 'center', gap: 4, paddingRight: 10 },
  cardCategory: { color: "#0a84ff", fontSize: 12, fontWeight: "800", textTransform: "uppercase", marginBottom: 2 },
  cardDesc: { color: "white", fontSize: 22, fontWeight: "700" },
  cardMeta: { color: "#8e8e93", fontSize: 14, marginTop: 2 },
  cardFrequency: { color: '#0a84ff', fontSize: 12, marginTop: 4, fontWeight: '500' },
  buttonGroup: { alignItems: 'center', justifyContent: 'center', gap: 8 },
  compBtn: { backgroundColor: "#34c759", paddingHorizontal: 12, height: 36, borderRadius: 18, justifyContent: "center" },
  tbdBtn: { backgroundColor: "#3a3a3c", paddingHorizontal: 12, height: 36, borderRadius: 18, justifyContent: "center" },
  btnTextSmall: { color: "white", fontSize: 15, fontWeight: "700" },
  editBtnText: { color: "#0a84ff", fontSize: 13, fontWeight: "600" },
  deleteBtnText: { color: "#ff453a", fontSize: 13, fontWeight: "600" },

  // form
  formPosition: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  compactForm: { backgroundColor: "#1c1c1e", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 15, paddingBottom: 40, borderTopWidth: 1, borderColor: "#2c2c2e" },
  formTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  input: { backgroundColor: "#2c2c2e", color: "white", padding: 12, borderRadius: 10, fontSize: 16, marginBottom: 15 },
  sectionLabel: { color: '#8e8e93', fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase' },
  formButtonRow: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, backgroundColor: "#3a3a3c", padding: 14, borderRadius: 12, alignItems: "center" },
  saveBtn: { flex: 1, backgroundColor: "#34c759", padding: 14, borderRadius: 12, alignItems: "center" },
  btnTextLarge: { color: "white", fontSize: 16, fontWeight: "700" },

  // category
  categoryRow: { flexDirection: "row", gap: 6, marginBottom: 15, flexWrap: 'wrap' },
  catBtn: { backgroundColor: "#2c2c2e", paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8 },
  catBtnActive: { backgroundColor: "#0a84ff", paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8 },
  catBtnGeneral: { borderWidth: 1, borderColor: '#3a3a3c' },
  catBtnAdd: { backgroundColor: "#3a3a3c", paddingVertical: 7, paddingHorizontal: 9, borderRadius: 8, borderStyle: 'dashed', borderWidth: 1, borderColor: '#8e8e93', flexShrink: 0 },
  catText: { color: '#8e8e93', fontSize: 12, fontWeight: '600' },
  catTextActive: { color: 'white', fontSize: 12, fontWeight: '600' },

  // date/time
  dateTimeRow: { flexDirection: "row", gap: 8, marginBottom: 15 },
  pickerField: { flex: 1, backgroundColor: "#2c2c2e", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fieldLabel: { color: "#8e8e93", fontSize: 11, fontWeight: "600" },

  // frequency
  frequencyContainer: { marginBottom: 15 },
  frequencyTypeRow: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap', justifyContent: 'center' },
  freqBtn: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#2c2c2e', alignItems: 'center' },
  freqBtnActive: { backgroundColor: '#0a84ff' },
  freqBtnText: { color: '#8e8e93', fontSize: 13, fontWeight: '600' },
  freqBtnTextActive: { color: 'white', fontSize: 13, fontWeight: '600' },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  dayCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2c2c2e', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#3a3a3c' },
  dayCircleActive: { backgroundColor: '#0a84ff', borderColor: '#0a84ff' },
  dayText: { color: '#8e8e93', fontSize: 14, fontWeight: '700' },
  dayTextActive: { color: 'white' },
  intervalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 5 },
  intervalLabel: { color: '#8e8e93', fontSize: 13, fontWeight: '600' },

  // duration
  durationContainer: { marginBottom: 15 },
  durationRow: { flexDirection: 'row', gap: 10 },
  durationSection: { flex: 1, alignItems: 'center' },
  durationLabel: { color: '#8e8e93', fontSize: 11, fontWeight: '600', marginBottom: 6, textAlign: 'center' },

  // stepper
  stepperContainer: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', backgroundColor: '#2c2c2e', borderRadius: 12, padding: 4 },
  stepperButton: { width: 36, height: 36, backgroundColor: '#3a3a3c', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  stepperValue: { width: 40, alignItems: 'center' },
  stepperValueText: { color: 'white', fontSize: 18, fontWeight: '700' },
});