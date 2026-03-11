import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from '@expo/vector-icons';

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Health & Fitness");
  const [categories, setCategories] = useState(["Health & Fitness", "Learning", "Productivity"]);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());

  const getFilteredAndSortedHabits = () => {
    let result = [...habits].filter(habit => {
      const matchesSearch = (habit.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (habit.category || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" ? true :
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

  const handleAddCustomCategory = () => {
    Alert.prompt("New Category", "Enter category name:", [
      { text: "Cancel", style: "cancel" },
      { text: "Add", onPress: (text) => { if (text && !categories.includes(text)) { setCategories([...categories, text]); setCategory(text); } } }
    ]);
  };

  const saveHabit = () => {
    // VALIDATION CHECK
    if (!description.trim()) {
      Alert.alert(
        "Missing Name",
        "Please enter a name for your habit before saving.",
        [{ text: "OK" }]
      );
      return;
    }

    const standardizedDate = new Date(date);
    standardizedDate.setHours(0, 0, 0, 0);

    if (editingId) {
      setHabits(prev => prev.map(habit =>
        habit.id === editingId
          ? { ...habit, description, category, rawDate: standardizedDate, rawTime: time, dateString: date.toLocaleDateString('en-GB'), timeString: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
          : habit
      ));
    } else {
      const newHabit = {
        id: Date.now().toString(),
        description,
        category,
        rawDate: standardizedDate,
        rawTime: time,
        dateString: date.toLocaleDateString('en-GB'),
        timeString: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        completed: false,
      };
      setHabits([newHabit, ...habits]);
    }
    setEditingId(null);
    setDescription("");
    setShowForm(false);
  };

  const renderHabit = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardCategory}>{item.category}</Text>
        <Text style={styles.cardDesc}>{item.description}</Text>
        <Text style={styles.cardMeta}>{item.dateString} • {item.timeString}</Text>
      </View>
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={item.completed ? styles.compBtn : styles.tbdBtn}
          onPress={() => setHabits(prev => prev.map(h => h.id === item.id ? { ...h, completed: !h.completed } : h))}
        >
          <Text style={styles.btnTextSmall}>{item.completed ? "Done" : "TBD"}</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity onPress={() => { setEditingId(item.id); setDescription(item.description); setCategory(item.category); setShowForm(true); }}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setHabits(prev => prev.filter(h => h.id !== item.id))}>
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>My Habits</Text>
        <TouchableOpacity style={styles.toggleFormButton} onPress={() => { setShowForm(!showForm); if (showForm) setEditingId(null); }}>
          <Text style={styles.toggleFormText}>{showForm ? "Close" : "Add"}</Text>
        </TouchableOpacity>
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
        <View style={styles.sortSection}>
          <Text style={styles.sortLabel}>Sort:</Text>
          <View style={styles.sortContainer}>
            {['Newest', 'Name', 'Date/Time'].map((label) => {
              const mode = label === 'Name' ? 'alphabetical' : label.toLowerCase();
              return (
                <TouchableOpacity key={mode} onPress={() => setSortMode(mode)} style={[styles.sortBtn, sortMode === mode && styles.sortBtnActive]}>
                  <Text style={[styles.sortBtnText, sortMode === mode && styles.sortBtnTextActive]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.statusSection}>
          <Text style={styles.sortLabel}>Status:</Text>
          <View style={styles.sortContainer}>
            {[
              { label: 'All', value: 'all' },
              { label: 'Done', value: 'completed' },
              { label: 'TBD', value: 'pending' }
            ].map((item) => (
              <TouchableOpacity key={item.value} onPress={() => setStatusFilter(item.value)} style={[styles.sortBtn, statusFilter === item.value && styles.sortBtnActive]}>
                <Text style={[styles.sortBtnText, statusFilter === item.value && styles.sortBtnTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <FlatList
        data={getFilteredAndSortedHabits()}
        renderItem={renderHabit}
        keyExtractor={item => item.id}
        ListEmptyComponent={() => {
          const isSearching = searchQuery.length > 0;
          const isFiltered = statusFilter !== 'all';
          const hasNoHabitsAtAll = habits.length === 0;

          return (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderEmoji}>
                {hasNoHabitsAtAll ? "🌱" : (isSearching || isFiltered ? "🔭" : "🌱")}
              </Text>
              <Text style={styles.placeholderTitle}>
                {hasNoHabitsAtAll ? "No habits yet" : "No habits found"}
              </Text>
              <Text style={styles.placeholderSubtitle}>
                {hasNoHabitsAtAll
                  ? "Press Add to get started"
                  : (isSearching || isFiltered ? "Try a different keyword or status" : "Press Add to get started")}
              </Text>
            </View>
          );
        }}
        contentContainerStyle={styles.listContent}
      />

      {showForm && (
        <>
          <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)' }]} onPress={() => { setShowForm(false); setEditingId(null); }} />
          <KeyboardAvoidingView behavior="padding" style={styles.formPosition}>
            <View style={styles.compactForm}>
              <Text style={styles.formTitle}>{editingId ? "Edit Habit" : "New Habit"}</Text>
              <TextInput placeholder="Habit Name" placeholderTextColor="#6b7280" style={styles.input} value={description} onChangeText={setDescription} autoFocus />
              <View style={styles.categoryRow}>
                {categories.map((cat) => (
                  <TouchableOpacity key={cat} style={category === cat ? styles.catBtnActive : styles.catBtn} onPress={() => setCategory(cat)}>
                    <Text style={styles.catText}>{cat}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.catBtnAdd} onPress={handleAddCustomCategory}>
                  <Text style={styles.catTextAdd}>New +</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.dateTimeRow}>
                <View style={styles.pickerField}><Text style={styles.fieldLabel}>Date:</Text><DateTimePicker value={date} mode="date" display="compact" themeVariant="dark" textColor="white" onChange={(e, d) => d && setDate(d)} /></View>
                <View style={styles.pickerField}><Text style={styles.fieldLabel}>Time:</Text><DateTimePicker value={time} mode="time" display="compact" themeVariant="dark" textColor="white" onChange={(e, t) => t && setTime(t)} /></View>
              </View>
              <TouchableOpacity style={styles.saveBtn} onPress={saveHabit}><Text style={styles.btnTextLarge}>{editingId ? "Update Habit" : "Save Habit"}</Text></TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </>
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
  searchContainer: { paddingHorizontal: 20, marginBottom: 15 },
  searchBarWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: "#1c1c1e", borderRadius: 12, borderWidth: 1, borderColor: '#2c2c2e', paddingHorizontal: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: "white", paddingVertical: 12, fontSize: 16 },
  filterWrapper: { paddingHorizontal: 20, marginBottom: 15, gap: 12 },
  sortSection: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusSection: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sortLabel: { color: '#8e8e93', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', width: 50 },
  sortContainer: { flexDirection: 'row', gap: 8 },
  sortBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, backgroundColor: '#1c1c1e' },
  sortBtnActive: { backgroundColor: '#0a84ff' },
  sortBtnText: { color: '#8e8e93', fontSize: 12, fontWeight: '600' },
  sortBtnTextActive: { color: 'white' },
  listContent: { paddingHorizontal: 20, paddingTop: 5, paddingBottom: 20 },
  placeholderContainer: { marginTop: 60, alignItems: 'center' },
  placeholderEmoji: { fontSize: 70, marginBottom: 20 },
  placeholderTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  placeholderSubtitle: { color: '#8e8e93', fontSize: 16, fontWeight: '400' },
  card: { backgroundColor: "#143296", borderRadius: 18, paddingVertical: 14, paddingHorizontal: 22, marginBottom: 12, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: '#091642' },
  cardCategory: { color: "#0a84ff", fontSize: 12, fontWeight: "800", textTransform: "uppercase", marginBottom: 2 },
  cardDesc: { color: "white", fontSize: 22, fontWeight: "700" },
  cardMeta: { color: "#8e8e93", fontSize: 14, marginTop: 2 },
  buttonGroup: { alignItems: 'center', justifyContent: 'center', gap: 8 },
  compBtn: { backgroundColor: "#34c759", paddingHorizontal: 12, height: 36, borderRadius: 18, justifyContent: "center" },
  tbdBtn: { backgroundColor: "#3a3a3c", paddingHorizontal: 12, height: 36, borderRadius: 18, justifyContent: "center" },
  btnTextSmall: { color: "white", fontSize: 15, fontWeight: "700" },
  editBtnText: { color: "#0a84ff", fontSize: 13, fontWeight: "600" },
  deleteBtnText: { color: "#ff453a", fontSize: 13, fontWeight: "600" },
  formPosition: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  compactForm: { backgroundColor: "#1c1c1e", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 15, paddingBottom: 40, borderTopWidth: 1, borderColor: "#2c2c2e" },
  formTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { backgroundColor: "#2c2c2e", color: "white", padding: 12, borderRadius: 10, fontSize: 16, marginBottom: 15 },
  categoryRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 15 },
  catBtn: { backgroundColor: "#2c2c2e", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  catBtnActive: { backgroundColor: "#0a84ff", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  catBtnAdd: { backgroundColor: "#3a3a3c", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, borderStyle: 'dashed', borderWidth: 1, borderColor: '#8e8e93' },
  catText: { color: "white", fontSize: 12 },
  catTextAdd: { color: "#8e8e93", fontSize: 12, fontWeight: 'bold' },
  dateTimeRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  pickerField: { flexDirection: "row", alignItems: "center", backgroundColor: "#2c2c2e", padding: 8, borderRadius: 10, width: "48%", justifyContent: 'space-between' },
  fieldLabel: { color: "#8e8e93", fontSize: 12, fontWeight: "600" },
  saveBtn: { backgroundColor: "#34c759", padding: 14, borderRadius: 12, alignItems: "center" },
  btnTextLarge: { color: "white", fontSize: 16, fontWeight: "700" },
});