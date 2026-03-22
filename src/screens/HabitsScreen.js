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
import { Ionicons } from '@expo/vector-icons';

const GENERAL_CATEGORY = "General";

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState("manual");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(GENERAL_CATEGORY);
  const [categories, setCategories] = useState([GENERAL_CATEGORY, "Health & Fitness", "Learning", "Productivity"]);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());

  // frequency
  const [frequencyType, setFrequencyType] = useState("daily");
  const [selectedDays, setSelectedDays] = useState([1, 2, 3, 4, 5]);
  const [intervalDays, setIntervalDays] = useState("2");

  // duration
  const [durationHours, setDurationHours] = useState("0");
  const [durationMinutes, setDurationMinutes] = useState("30");

  // filtering and sorting

  const getFilteredAndSortedHabits = () => {
    let result = [...habits].filter(habit => {
      const matchesSearch =
        (habit.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (habit.category || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ? true :
          statusFilter === "completed" ? habit.completed : !habit.completed;
      return matchesSearch && matchesStatus;
    });

    if (sortMode === "alphabetical") {
      result.sort((a, b) => (a.description || "").localeCompare(b.description || ""));
    } else if (sortMode === "date/time") {
      result.sort((a, b) => {
        const timeA = a.rawDate ? a.rawDate.getTime() : 0;
        const timeB = b.rawDate ? b.rawDate.getTime() : 0;
        const dateDiff = timeA - timeB;
        if (dateDiff !== 0) return dateDiff;
        const hourA = a.rawTime ? a.rawTime.getHours() : 0;
        const hourB = b.rawTime ? b.rawTime.getHours() : 0;
        if (hourA !== hourB) return hourA - hourB;
        return (a.rawTime ? a.rawTime.getMinutes() : 0) - (b.rawTime ? b.rawTime.getMinutes() : 0);
      });
    } else if (sortMode === "newest") {
      result.sort((a, b) => (b.id || "").localeCompare(a.id || ""));
    }
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
        }
      }
    ]);
  };

  const handleLongPressCategory = (cat) => {
    // general is protected
    if (cat === GENERAL_CATEGORY) {
      Alert.alert("Protected Category", "The General category cannot be edited or deleted.");
      return;
    }

    Alert.alert(cat, "What would you like to do with this category?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Rename",
        onPress: () => {
          Alert.prompt("Rename Category", `Rename "${cat}" to:`, [
            { text: "Cancel", style: "cancel" },
            {
              text: "Save",
              onPress: (newName) => {
                const trimmed = newName?.trim();
                if (!trimmed) return;
                if (categories.includes(trimmed)) {
                  Alert.alert("Already exists", "A category with that name already exists.");
                  return;
                }
                setCategories(prev => prev.map(c => c === cat ? trimmed : c));
                setHabits(prev => prev.map(h => h.category === cat ? { ...h, category: trimmed } : h));
                if (category === cat) setCategory(trimmed);
              }
            }
          ], "plain-text", cat);
        }
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const habitCount = habits.filter(h => h.category === cat).length;
          const message = habitCount > 0
            ? `Delete "${cat}"? The ${habitCount} habit${habitCount !== 1 ? 's' : ''} in this category will be moved to General.`
            : `Delete "${cat}"?`;
          Alert.alert("Delete Category", message, [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => {
                setCategories(prev => prev.filter(c => c !== cat));
                setHabits(prev => prev.map(h => h.category === cat ? { ...h, category: GENERAL_CATEGORY } : h));
                if (category === cat) setCategory(GENERAL_CATEGORY);
              }
            }
          ]);
        }
      }
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
    if (frequencyType === 'interval' && (!intervalDays || parseInt(intervalDays) < 1)) {
      Alert.alert("Invalid Interval", "Please enter a valid number of days (1 or more).", [{ text: "OK" }]);
      return;
    }

    const standardizedDate = new Date(date);
    standardizedDate.setHours(0, 0, 0, 0);

    const frequency = {
      type: frequencyType,
      days: frequencyType === 'weekly' ? selectedDays :
        frequencyType === 'interval' ? parseInt(intervalDays) : null
    };

    const duration = {
      hours: parseInt(durationHours) || 0,
      minutes: parseInt(durationMinutes) || 0
    };

    const habitData = {
      description,
      category,
      rawDate: standardizedDate,
      rawTime: time,
      dateString: date.toLocaleDateString('en-GB'),
      timeString: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      frequency,
      duration,
    };

    if (editingId) {
      Alert.alert("Save Changes?", "Do you want to save the changes to this habit?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: () => {
            setHabits(prev => prev.map(h => h.id === editingId ? { ...h, ...habitData } : h));
            resetForm();
          }
        }
      ]);
    } else {
      setHabits([{ id: Date.now().toString(), completed: false, ...habitData }, ...habits]);
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

  const handleDelete = (habitId, habitName) => {
    Alert.alert("Delete Habit", `Are you sure you want to delete "${habitName}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => setHabits(prev => prev.filter(h => h.id !== habitId)) }
    ]);
  };

  // display helpers

  const getDurationDisplay = (duration) => {
    if (!duration) return "";
    const { hours, minutes } = duration;
    if (hours === 0 && minutes === 0) return "";
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    return parts.join(' ');
  };

  const getFrequencyDisplay = (frequency) => {
    if (!frequency || frequency.type === 'daily') return "Every day";
    if (frequency.type === 'interval') {
      return frequency.days === 1 ? "Every day" : `Every ${frequency.days} days`;
    }

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const sortedDays = [...frequency.days].sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b));
    const dayName = d => d === 0 ? 'Sun' : dayNames[d - 1];

    if (sortedDays.length === 7) return "Every day";
    if (sortedDays.length === 5 && [1, 2, 3, 4, 5].every(d => sortedDays.includes(d))) return "Weekdays";
    if (sortedDays.length === 2 && [6, 0].every(d => sortedDays.includes(d))) return "Weekends";

    const isConsecutive = sortedDays.every((day, i) =>
      i === 0 || day === sortedDays[i - 1] + 1 || (sortedDays[i - 1] === 0 && day === 1)
    );
    if (isConsecutive && sortedDays.length > 2) {
      return `${dayName(sortedDays[0])}-${dayName(sortedDays[sortedDays.length - 1])}`;
    }

    return sortedDays.map(dayName).join(', ');
  };

  // sub-components

  const Stepper = ({ value, onDecrement, onIncrement }) => (
    <View style={styles.stepperContainerCentered}>
      <TouchableOpacity style={styles.stepperButton} onPress={onDecrement}>
        <Ionicons name="remove" size={20} color="white" />
      </TouchableOpacity>
      <View style={styles.stepperValueContainer}>
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
        <View style={styles.durationSection}>
          <Text style={styles.durationLabel}>Hours</Text>
          <Stepper
            value={durationHours || "0"}
            onDecrement={() => { const v = parseInt(durationHours) || 0; if (v > 0) setDurationHours(String(v - 1)); }}
            onIncrement={() => { const v = parseInt(durationHours) || 0; if (v < 23) setDurationHours(String(v + 1)); }}
          />
        </View>
        <View style={styles.durationSection}>
          <Text style={styles.durationLabel}>Minutes</Text>
          <Stepper
            value={durationMinutes || "0"}
            onDecrement={() => { const v = parseInt(durationMinutes) || 0; if (v >= 5) setDurationMinutes(String(v - 5)); }}
            onIncrement={() => { const v = parseInt(durationMinutes) || 0; if (v < 55) setDurationMinutes(String(v + 5)); }}
          />
        </View>
      </View>
    </View>
  );

  const FrequencyPicker = () => {
    const weekDays = [
      { short: 'M', value: 1 }, { short: 'T', value: 2 }, { short: 'W', value: 3 },
      { short: 'T', value: 4 }, { short: 'F', value: 5 }, { short: 'S', value: 6 }, { short: 'S', value: 0 },
    ];

    const toggleDay = (dayValue) => {
      setSelectedDays(prev =>
        prev.includes(dayValue)
          ? prev.filter(d => d !== dayValue)
          : [...prev, dayValue].sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b))
      );
    };

    return (
      <View style={styles.frequencyContainer}>
        <Text style={styles.sectionLabel}>Repeat</Text>
        <View style={styles.frequencyTypeRow}>
          {['daily', 'weekly', 'interval'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.freqBtn, frequencyType === type && styles.freqBtnActive]}
              onPress={() => setFrequencyType(type)}
            >
              <Text style={[styles.freqBtnText, frequencyType === type && styles.freqBtnTextActive]}>
                {type === 'interval' ? 'Every N Days' : type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {frequencyType === 'weekly' && (
          <View style={styles.daysRow}>
            {weekDays.map(day => (
              <TouchableOpacity
                key={day.value}
                style={[styles.dayCircle, selectedDays.includes(day.value) && styles.dayCircleActive]}
                onPress={() => toggleDay(day.value)}
              >
                <Text style={[styles.dayText, selectedDays.includes(day.value) && styles.dayTextActive]}>{day.short}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {frequencyType === 'interval' && (
          <View style={styles.intervalRowCentered}>
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
  };

  // habit card

  // manual reorder

  const moveHabit = (id, direction) => {
    setHabits(prev => {
      const index = prev.findIndex(h => h.id === id);
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const result = [...prev];
      [result[index], result[newIndex]] = [result[newIndex], result[index]];
      return result;
    });
  };

  const renderHabit = ({ item, index }) => (
    <View style={styles.card}>
      {sortMode === 'manual' && !searchQuery && statusFilter === 'all' && (
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
          {item.dateString} • {item.timeString}
          {item.duration && getDurationDisplay(item.duration) && ` • ${getDurationDisplay(item.duration)}`}
        </Text>
        <Text style={styles.cardFrequency}>🔄 {getFrequencyDisplay(item.frequency)}</Text>
      </View>
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={item.completed ? styles.compBtn : styles.tbdBtn}
          onPress={() => setHabits(prev => prev.map(h => h.id === item.id ? { ...h, completed: !h.completed } : h))}
        >
          <Text style={styles.btnTextSmall}>{item.completed ? "Done" : "TBD"}</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity onPress={() => {
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
          }}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id, item.description)}>
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // render

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>My Habits</Text>
      </View>

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

      <View style={styles.filterWrapper}>
        <View style={styles.filterRow}>
          <Text style={styles.sortLabel}>Status:</Text>
          <View style={styles.sortContainer}>
            {[
              { label: 'All', value: 'all' },
              { label: 'Done', value: 'completed' },
              { label: 'TBD', value: 'pending' }
            ].map((item) => (
              <TouchableOpacity
                key={item.value}
                onPress={() => setStatusFilter(item.value)}
                style={[styles.sortBtn, statusFilter === item.value && styles.sortBtnActive]}
              >
                <Text style={[styles.sortBtnText, statusFilter === item.value && styles.sortBtnTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.sortLabel}>Sort:</Text>
          <View style={styles.sortContainer}>
            {['Manual', 'Newest', 'Alphabetical', 'Date/Time'].map((label) => {
              const mode = label === 'Alphabetical' ? 'alphabetical' : label.toLowerCase();
              return (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setSortMode(mode)}
                  style={[styles.sortBtn, sortMode === mode && styles.sortBtnActive]}
                >
                  <Text style={[styles.sortBtnText, sortMode === mode && styles.sortBtnTextActive]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      <FlatList
        data={getFilteredAndSortedHabits()}
        renderItem={renderHabit}
        keyExtractor={item => item.id}
        ListEmptyComponent={() => {
          const isEmpty = habits.length === 0;
          const isFiltered = searchQuery.length > 0 || statusFilter !== 'all';
          return (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderEmoji}>{isFiltered && !isEmpty ? "🔭" : "🌱"}</Text>
              <Text style={styles.placeholderTitle}>{isEmpty ? "No habits yet" : "No habits found"}</Text>
              <Text style={styles.placeholderSubtitle}>
                {isEmpty || !isFiltered ? "Press the plus icon to get started" : "Try a different keyword or status"}
              </Text>
            </View>
          );
        }}
        contentContainerStyle={styles.listContent}
      />

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
              <Text style={styles.sectionLabel}>
                Category
                <Text style={styles.sectionLabel}> - Long press to edit or delete</Text>
              </Text>
              <View style={styles.categoryRow}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      category === cat ? styles.catBtnActive : styles.catBtn,
                      cat === GENERAL_CATEGORY && styles.catBtnGeneral,
                    ]}
                    onPress={() => setCategory(cat)}
                    onLongPress={() => handleLongPressCategory(cat)}
                    delayLongPress={400}
                  >
                    <Text
                      style={[styles.catText, category === cat && styles.catTextActive]}
                      numberOfLines={1}
                    >
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
                <View style={styles.pickerField}>
                  <Text style={styles.fieldLabel}>Date</Text>
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="compact"
                    themeVariant="dark"
                    textColor="white"
                    onChange={(e, d) => d && setDate(d)}
                  />
                </View>
                <View style={styles.pickerField}>
                  <Text style={styles.fieldLabel}>Time</Text>
                  <DateTimePicker
                    value={time}
                    mode="time"
                    display="compact"
                    themeVariant="dark"
                    textColor="white"
                    onChange={(e, t) => t && setTime(t)}
                  />
                </View>
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
      {!showForm && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => { setShowForm(!showForm); if (showForm) setEditingId(null); }}
        >
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 10 },
  headerText: { color: "white", fontSize: 28, fontWeight: "bold" },
  toggleFormButton: { backgroundColor: "#1c1c1e", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 15 },
  toggleFormText: { color: "#0a84ff", fontWeight: "600" },
  fab: { position: 'absolute', bottom: 30, right: 25, width: 56, height: 56, borderRadius: 28, backgroundColor: '#0a84ff', justifyContent: 'center', alignItems: 'center' },
  searchContainer: { paddingHorizontal: 20, marginBottom: 15 },
  searchBarWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: "#1c1c1e", borderRadius: 12, borderWidth: 1, borderColor: '#2c2c2e', paddingHorizontal: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: "white", paddingVertical: 12, fontSize: 16 },
  filterWrapper: { paddingHorizontal: 20, marginBottom: 15, gap: 12 },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sortLabel: { color: '#8e8e93', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', width: 50 },
  sortContainer: { flexDirection: 'row', gap: 5, flexWrap: 'wrap' },
  sortBtn: { paddingVertical: 6, paddingHorizontal: 8, borderRadius: 12, backgroundColor: '#1c1c1e' },
  sortBtnActive: { backgroundColor: '#0a84ff' },
  sortBtnText: { color: '#8e8e93', fontSize: 11, fontWeight: '600' },
  sortBtnTextActive: { color: 'white' },
  listContent: { paddingHorizontal: 20, paddingTop: 5, paddingBottom: 20 },
  placeholderContainer: { marginTop: 60, alignItems: 'center' },
  placeholderEmoji: { fontSize: 70, marginBottom: 20 },
  placeholderTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  placeholderSubtitle: { color: '#8e8e93', fontSize: 16, fontWeight: '400' },
  card: { backgroundColor: "#143296", borderRadius: 18, paddingVertical: 11, paddingHorizontal: 22, marginBottom: 10, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: '#091642' },
  moveButtons: { flexDirection: 'column', justifyContent: 'center', gap: 4, paddingRight: 10 },
  dragHandle: { paddingRight: 10, justifyContent: 'center' },
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
  formPosition: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  compactForm: { backgroundColor: "#1c1c1e", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 15, paddingBottom: 40, borderTopWidth: 1, borderColor: "#2c2c2e" },
  formTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  input: { backgroundColor: "#2c2c2e", color: "white", padding: 12, borderRadius: 10, fontSize: 16, marginBottom: 15 },
  sectionLabel: { color: '#8e8e93', fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase' },

  // category
  categoryRow: { flexDirection: "row", gap: 6, marginBottom: 15, flexWrap: 'wrap' },
  catBtn: { backgroundColor: "#2c2c2e", paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8 },
  catBtnActive: { backgroundColor: "#0a84ff", paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8 },
  catBtnGeneral: { borderWidth: 1, borderColor: '#3a3a3c' },
  catBtnAdd: { backgroundColor: "#3a3a3c", paddingVertical: 7, paddingHorizontal: 9, borderRadius: 8, borderStyle: 'dashed', borderWidth: 1, borderColor: '#8e8e93', flexShrink: 0 },
  catText: { color: '#8e8e93', fontSize: 12, fontWeight: '600' },
  catTextActive: { color: 'white', fontSize: 12, fontWeight: '600' },

  // frequency
  frequencyContainer: { marginBottom: 15 },
  frequencyTypeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  freqBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: '#2c2c2e', alignItems: 'center' },
  freqBtnActive: { backgroundColor: '#0a84ff' },
  freqBtnText: { color: '#8e8e93', fontSize: 13, fontWeight: '600' },
  freqBtnTextActive: { color: 'white', fontSize: 13, fontWeight: '600' },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  dayCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2c2c2e', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#3a3a3c' },
  dayCircleActive: { backgroundColor: '#0a84ff', borderColor: '#0a84ff' },
  dayText: { color: '#8e8e93', fontSize: 14, fontWeight: '700' },
  dayTextActive: { color: 'white' },

  // interval
  intervalRowCentered: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 5 },
  intervalLabel: { color: '#8e8e93', fontSize: 13, fontWeight: '600' },

  // duration
  durationContainer: { marginBottom: 15 },
  durationRow: { flexDirection: 'row', gap: 10 },
  durationSection: { flex: 1, alignItems: 'center' },
  durationLabel: { color: '#8e8e93', fontSize: 11, fontWeight: '600', marginBottom: 6, textAlign: 'center' },

  // stepper
  stepperContainerCentered: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', backgroundColor: '#2c2c2e', borderRadius: 12, padding: 4 },
  stepperButton: { width: 36, height: 36, backgroundColor: '#3a3a3c', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  stepperValueContainer: { width: 40, alignItems: 'center' },
  stepperValueText: { color: 'white', fontSize: 18, fontWeight: '700' },

  // date/time row
  dateTimeRow: { flexDirection: "row", gap: 8, marginBottom: 15 },
  pickerField: { flex: 1, backgroundColor: "#2c2c2e", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fieldLabel: { color: "#8e8e93", fontSize: 11, fontWeight: "600" },

  formButtonRow: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, backgroundColor: "#3a3a3c", padding: 14, borderRadius: 12, alignItems: "center" },
  saveBtn: { flex: 1, backgroundColor: "#34c759", padding: 14, borderRadius: 12, alignItems: "center" },
  btnTextLarge: { color: "white", fontSize: 16, fontWeight: "700" },
});