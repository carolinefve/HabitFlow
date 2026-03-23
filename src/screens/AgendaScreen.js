import React, { useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  addDays,
  applyTemplateToDate,
  buildTaskPayload,
  computeBlockHeight,
  computeBlockTop,
  createEmptyForm,
  createTemplateFromTasks,
  filterTasksByDate,
  formatDateLabel,
  normalizeTimeInput,
  normalizeNumericTimeInput,
  parseTimeInputParts,
  parseTaskDate,
  sortTimelineTasks,
  upsertTask,
  validateTaskForm,
  deleteTaskById,
} from "../services/agendaService";

const SLOT_HEIGHT = 88;
const PIXELS_PER_MINUTE = SLOT_HEIGHT / 60;
const BASE_DAY_DATE = new Date(2026, 2, 19);

const colorPalette = ["#3A7BFF", "#8D6E63", "#E53935", "#8E24AA", "#43A047"];

const timelineHours = [
  "12 AM",
  "1 AM",
  "2 AM",
  "3 AM",
  "4 AM",
  "5 AM",
  "6 AM",
  "7 AM",
  "8 AM",
  "9 AM",
  "10 AM",
  "11 AM",
  "12 PM",
  "1 PM",
  "2 PM",
  "3 PM",
  "4 PM",
  "5 PM",
  "6 PM",
  "7 PM",
  "8 PM",
  "9 PM",
  "10 PM",
  "11 PM",
];

const initialTasks = [
  {
    id: "deadline-1",
    title: "Test 1",
    dateLabel: "2026-03-19",
    allDay: false,
    notes: "Due: March 19, 2026 at 2:00 AM",
    color: "#E53935",
    startTime: "1:00 AM",
    endTime: "2:00 AM",
  },
  {
    id: "deadline-2",
    title: "Test 2",
    dateLabel: "2026-03-20",
    allDay: false,
    notes: "Due: March 20, 2026 at 2:00 AM",
    color: "#8E24AA",
    startTime: "1:00 AM",
    endTime: "2:00 AM",
  },
  {
    id: "deadline-3",
    title: "Test 3",
    dateLabel: "2026-03-23",
    allDay: false,
    startTime: "1:00 AM",
    endTime: "2:00 AM",
    notes: "Due: March 23, 2026 at 2:00 AM",
    color: "#43A047",
  },
];

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}


function TimeInputModal({ visible, fieldLabel, value, onClose, onSave }) {
  const [hourValue, setHourValue] = useState("");
  const [minuteValue, setMinuteValue] = useState("");
  const [periodValue, setPeriodValue] = useState("AM");

  React.useEffect(() => {
    if (visible) {
      const nextParts = parseTimeInputParts(value);
      setHourValue(nextParts.hour);
      setMinuteValue(nextParts.minute);
      setPeriodValue(nextParts.period);
    }
  }, [value, visible]);

  const normalized = normalizeNumericTimeInput(hourValue, minuteValue, periodValue);
  const hasValue = hourValue.trim().length > 0 || minuteValue.trim().length > 0;
  const error = hasValue && !normalized ? "Enter hour 1-12 and minute 00-59." : "";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.dialog, styles.templateDialog]}>
          <Text style={styles.dialogTitle}>{fieldLabel}</Text>
          <Text style={styles.dialogHint}>Enter hour and minute, then choose AM or PM.</Text>

          <View style={styles.timeInputRow}>
            <TextInput
              value={hourValue}
              onChangeText={(text) => setHourValue(text.replace(/\D/g, "").slice(0, 2))}
              placeholder="2"
              placeholderTextColor="#7E7E88"
              keyboardType="number-pad"
              style={[styles.input, styles.timeSplitInput, styles.timeInputField]}
            />
            <Text style={styles.timeColon}>:</Text>
            <TextInput
              value={minuteValue}
              onChangeText={(text) => setMinuteValue(text.replace(/\D/g, "").slice(0, 2))}
              placeholder="30"
              placeholderTextColor="#7E7E88"
              keyboardType="number-pad"
              style={[styles.input, styles.timeSplitInput, styles.timeInputField]}
            />
          </View>

          <View style={styles.periodRow}>
            {["AM", "PM"].map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  periodValue === period ? styles.periodButtonActive : null,
                ]}
                activeOpacity={0.82}
                onPress={() => setPeriodValue(period)}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    periodValue === period ? styles.periodButtonTextActive : null,
                  ]}
                >
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inlineActions}>
            <TouchableOpacity
              style={[styles.smallActionButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.smallActionButton,
                styles.saveButton,
                hasValue && !normalized ? styles.disabledButton : null,
              ]}
              onPress={() => onSave(normalized)}
              disabled={hasValue && !normalized}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function TemplatePickerModal({ visible, templates, onClose, onSelect }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.dialog, styles.templateDialog]}>
          <Text style={styles.dialogTitle}>Use Template</Text>
          <Text style={styles.dialogHint}>Import all tasks into the selected day.</Text>

          <ScrollView
            style={styles.templateList}
            contentContainerStyle={styles.templateListContent}
            showsVerticalScrollIndicator={false}
          >
            {templates.length ? (
              templates.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={styles.templateListItem}
                  activeOpacity={0.82}
                  onPress={() => onSelect(template)}
                >
                  <Text style={styles.templateListTitle}>{template.name}</Text>
                  <Text style={styles.templateListMeta}>
                    {template.tasks.length} task{template.tasks.length === 1 ? "" : "s"}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyStateCard}>
                <Text style={styles.emptyStateTitle}>No templates saved</Text>
                <Text style={styles.emptyStateSubtitle}>Save a day first, then reuse it here.</Text>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function AgendaTaskModal({
  visible,
  mode,
  form,
  setForm,
  onClose,
  onSave,
  onDelete,
  onUseTemplate,
}) {
  const [timeField, setTimeField] = useState("");
  const modalTitle = mode === "edit" ? "Edit Task" : "Create Task";
  const validation = validateTaskForm(form);

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{modalTitle}</Text>

            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={styles.formContent}
              showsVerticalScrollIndicator={false}
            >
              {mode === "create" ? (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Template</Text>
                  <TouchableOpacity
                    style={styles.templateButton}
                    activeOpacity={0.8}
                    onPress={onUseTemplate}
                  >
                    <Text style={styles.templateButtonText}>Use Template</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Title</Text>
                <TextInput
                  value={form.title}
                  onChangeText={(text) => setForm((prev) => ({ ...prev, title: text }))}
                  placeholder="Task title"
                  placeholderTextColor="#7E7E88"
                  style={styles.input}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Date</Text>
                <View style={styles.dateRow}>
                  <View style={styles.dateBadge}>
                    <Text style={styles.dateBadgeText}>{formatDate(form.date)}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <View style={styles.switchRow}>
                  <Text style={styles.fieldLabel}>All Day</Text>
                  <Switch
                    value={form.allDay}
                    onValueChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        allDay: value,
                        startTime: value ? "" : prev.startTime,
                        endTime: value ? "" : prev.endTime,
                      }))
                    }
                    trackColor={{ false: "#2C2C34", true: "#3A7BFF" }}
                    thumbColor="#FFFFFF"
                  />
                </View>
                {form.allDay ? <Text style={styles.allDayHint}>All Day</Text> : null}
              </View>

              {!form.allDay ? (
                <>
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Start Time</Text>
                    <View style={styles.timeFieldRow}>
                      <TouchableOpacity
                        style={form.startTime ? styles.timeTag : styles.addTimeButton}
                        onPress={() => setTimeField("startTime")}
                        activeOpacity={0.8}
                      >
                        <Text style={form.startTime ? styles.timeTagText : styles.addTimeText}>
                          {form.startTime || "Add time"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>End Time</Text>
                    <View style={styles.timeFieldRow}>
                      <TouchableOpacity
                        style={form.endTime ? styles.timeTag : styles.addTimeButton}
                        onPress={() => setTimeField("endTime")}
                        activeOpacity={0.8}
                      >
                        <Text style={form.endTime ? styles.timeTagText : styles.addTimeText}>
                          {form.endTime || "Add time"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              ) : null}

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Notes</Text>
                <TextInput
                  value={form.notes}
                  onChangeText={(text) => setForm((prev) => ({ ...prev, notes: text }))}
                  placeholder="Optional notes"
                  placeholderTextColor="#7E7E88"
                  style={[styles.input, styles.notesInput]}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Color</Text>
                <View style={styles.colorRow}>
                  {colorPalette.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: color },
                        form.color === color ? styles.colorSwatchActive : null,
                      ]}
                      onPress={() => setForm((prev) => ({ ...prev, color }))}
                    />
                  ))}
                </View>
              </View>

              {validation.error ? <Text style={styles.errorText}>{validation.error}</Text> : null}
            </ScrollView>

            <View style={styles.footerButtons}>
              <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.saveButton,
                  !validation.isValid ? styles.disabledButton : null,
                ]}
                onPress={onSave}
                disabled={!validation.isValid}
              >
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>

              {mode === "edit" ? (
                <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={onDelete}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>
      </Modal>

      <TimeInputModal
        visible={Boolean(timeField)}
        fieldLabel={timeField === "endTime" ? "End Time" : "Start Time"}
        value={timeField ? form[timeField] : ""}
        onClose={() => setTimeField("")}
        onSave={(value) => {
          if (!timeField) return;
          setForm((prev) => ({ ...prev, [timeField]: value }));
          setTimeField("");
        }}
      />
    </>
  );
}

export default function AgendaScreen() {
  const [tasks, setTasks] = useState(initialTasks);
  const [templates, setTemplates] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [templatePickerVisible, setTemplatePickerVisible] = useState(false);
  const [mode, setMode] = useState("create");
  const [form, setForm] = useState(createEmptyForm(formatDateLabel(BASE_DAY_DATE)));
  const [selectedDate, setSelectedDate] = useState(BASE_DAY_DATE);

  const selectedDateLabel = formatDateLabel(selectedDate);
  const tasksForSelectedDate = useMemo(
    () => filterTasksByDate(tasks, selectedDateLabel),
    [selectedDateLabel, tasks]
  );
  const allDayTasks = useMemo(
    () => tasksForSelectedDate.filter((task) => task.allDay),
    [tasksForSelectedDate]
  );
  const timelineTasks = useMemo(
    () => sortTimelineTasks(tasksForSelectedDate),
    [tasksForSelectedDate]
  );

  const openCreateModal = () => {
    setMode("create");
    setForm((prev) => ({
      ...createEmptyForm(selectedDateLabel),
      color: prev.color || colorPalette[0],
    }));
    setModalVisible(true);
  };

  const openEditModal = (task) => {
    setMode("edit");
    setForm({
      id: task.id,
      title: task.title,
      date: parseTaskDate(task.dateLabel),
      startTime: task.startTime || "",
      endTime: task.endTime || "",
      notes: task.notes || "",
      color: task.color,
      allDay: task.allDay,
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setTemplatePickerVisible(false);
  };

  const handleSaveTask = () => {
    const validation = validateTaskForm(form);
    if (!validation.isValid) return;

    const taskPayload = buildTaskPayload(form);
    setTasks((prev) => upsertTask(prev, taskPayload, mode));

    closeModal();
  };

  const handleDeleteTask = () => {
    if (!form.id) return;
    setTasks((prev) => deleteTaskById(prev, form.id));
    closeModal();
  };

  const handleSaveTemplate = () => {
    if (!tasksForSelectedDate.length) return;
    setTemplates((prev) => [...prev, createTemplateFromTasks(tasksForSelectedDate, selectedDateLabel, prev.length)]);
  };

  const handleUseTemplate = (template) => {
    setTasks((prev) => [...prev, ...applyTemplateToDate(template, selectedDateLabel)]);
    setTemplatePickerVisible(false);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <Text style={styles.headerLabel}>All Day</Text>
            <View style={styles.headerActions}>
              <View style={styles.headerDateRow}>
                <TouchableOpacity
                  onPress={() => setSelectedDate((prev) => addDays(prev, -1))}
                  style={styles.headerArrowButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.headerArrowText}>{"<"}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.headerDateTapZone} activeOpacity={0.7} onPress={() => {}}>
                  <Text style={styles.headerDate}>{formatDate(selectedDate)}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedDate((prev) => addDays(prev, 1))}
                  style={styles.headerArrowButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.headerArrowText}>{">"}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.saveTemplateButton,
                  !tasksForSelectedDate.length ? styles.disabledButton : null,
                ]}
                activeOpacity={0.82}
                onPress={handleSaveTemplate}
                disabled={!tasksForSelectedDate.length}
              >
                <Text style={styles.saveTemplateText}>Save Template</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.allDaySection}>
          {allDayTasks.length ? (
            allDayTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                activeOpacity={0.9}
                onPress={() => openEditModal(task)}
                style={[styles.allDayCard, { backgroundColor: task.color }]}
              >
                <Text style={styles.allDayTitle}>{task.title}</Text>
                <Text style={styles.allDaySubtitle}>{task.notes || task.dateLabel}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyStateCard}>
              <Text style={styles.emptyStateTitle}>No all day tasks</Text>
              <Text style={styles.emptyStateSubtitle}>{selectedDateLabel}</Text>
            </View>
          )}
        </View>

        <View style={styles.timelineSection}>
          <View style={styles.timeColumn}>
            {timelineHours.map((hour) => (
              <View key={hour} style={styles.timeRow}>
                <Text style={styles.timeText}>{hour}</Text>
              </View>
            ))}
          </View>

          <View style={styles.blocksColumn}>
            {timelineHours.map((hour) => (
              <View key={`line-${hour}`} style={styles.hourLine} />
            ))}

            <View style={styles.blocksLayer}>
              {timelineTasks.length ? (
                timelineTasks.map((task, index) => (
                  <TouchableOpacity
                    key={task.id}
                    activeOpacity={0.92}
                    onPress={() => openEditModal(task)}
                    style={[
                      styles.eventBlock,
                      {
                        backgroundColor: task.color,
                        top: computeBlockTop(task, index),
                        height: computeBlockHeight(task),
                      },
                    ]}
                  >
                    <Text style={styles.eventTitle}>{task.title}</Text>
                    <Text style={styles.eventTime}>
                      {task.startTime ? task.startTime : "All Day"}
                      {task.endTime ? ` - ${task.endTime}` : ""}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.timelineEmptyState}>
                  <Text style={styles.emptyStateTitle}>No scheduled tasks</Text>
                  <Text style={styles.emptyStateSubtitle}>Tap + to add one</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity activeOpacity={0.85} style={styles.fab} onPress={openCreateModal}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <AgendaTaskModal
        visible={modalVisible}
        mode={mode}
        form={form}
        setForm={setForm}
        onClose={closeModal}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        onUseTemplate={() => setTemplatePickerVisible(true)}
      />

      <TemplatePickerModal
        visible={templatePickerVisible}
        templates={templates}
        onClose={() => setTemplatePickerVisible(false)}
        onSelect={handleUseTemplate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E0E10",
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 62,
    paddingHorizontal: 16,
    paddingBottom: 120,
  },

  header: {
    marginBottom: 14,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  headerLabel: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  headerDate: {
    marginTop: 4,
    color: "#A8A8B3",
    fontSize: 14,
    fontWeight: "500",
  },
  headerDateTapZone: {
    minHeight: 34,
    minWidth: 132,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#30303A",
    backgroundColor: "#1E1E25",
  },
  headerDateRow: {
    width: 208,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  headerActions: {
    alignItems: "center",
    gap: 8,
  },
  headerArrowButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#30303A",
    backgroundColor: "#1A1A21",
  },
  headerArrowText: {
    color: "#D3D3DB",
    fontSize: 13,
    fontWeight: "700",
  },
  saveTemplateButton: {
    width: 208,
    minHeight: 31,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#3A7BFF",
    backgroundColor: "rgba(58,123,255,0.14)",
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  saveTemplateText: {
    color: "#9BC0FF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  allDaySection: {
    marginBottom: 20,
    gap: 10,
  },
  allDayCard: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  allDayTitle: {
    color: "#FFFFFF",
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
    color: "#8E8E99",
    fontSize: 12,
    fontWeight: "600",
  },

  blocksColumn: {
    flex: 1,
    minHeight: SLOT_HEIGHT * timelineHours.length,
    borderLeftWidth: 1,
    borderLeftColor: "#2A2A2E",
    paddingLeft: 12,
    position: "relative",
  },
  hourLine: {
    height: SLOT_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: "#222228",
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
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "space-between",
    shadowColor: "#000000",
    shadowOpacity: 0.24,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  eventTitle: {
    color: "#FFFFFF",
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
    position: "absolute",
    right: 20,
    bottom: 95,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  fabText: {
    color: "#111114",
    fontSize: 30,
    fontWeight: "500",
    lineHeight: 31,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.62)",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "89%",
    backgroundColor: "#141418",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderColor: "#2A2A33",
  },
  dialog: {
    marginHorizontal: 16,
    marginBottom: 32,
    borderRadius: 24,
    backgroundColor: "#141418",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#2A2A33",
  },
  templateDialog: {
    maxHeight: "72%",
    minHeight: 420,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  dialogTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  dialogHint: {
    marginTop: 6,
    marginBottom: 14,
    color: "#9CA0AD",
    fontSize: 13,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 46,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#494952",
    marginBottom: 12,
  },
  sheetTitle: {
    color: "#FFFFFF",
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
    color: "#D8D8E0",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  input: {
    borderRadius: 12,
    backgroundColor: "#1D1D24",
    borderWidth: 1,
    borderColor: "#2D2D36",
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: "#FFFFFF",
    fontSize: 14,
  },
  notesInput: {
    minHeight: 92,
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
    color: "#D8D8E0",
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2D2D36",
    backgroundColor: "#1D1D24",
    alignItems: "center",
    justifyContent: "center",
  },
  periodButtonActive: {
    borderColor: "#3A7BFF",
    backgroundColor: "rgba(58,123,255,0.16)",
  },
  periodButtonText: {
    color: "#A8A8B3",
    fontSize: 13,
    fontWeight: "700",
  },
  periodButtonTextActive: {
    color: "#DCE8FF",
  },
  dateRow: {
    alignItems: "flex-start",
  },
  dateBadge: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#1E1E25",
    borderWidth: 1,
    borderColor: "#30303A",
    minHeight: 36,
  },
  dateBadgeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  templateButton: {
    minHeight: 40,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#3A7BFF",
    backgroundColor: "rgba(58,123,255,0.14)",
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  templateButtonText: {
    color: "#9BC0FF",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  allDayHint: {
    color: "#9CA0AD",
    fontSize: 12,
  },

  timeFieldRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addTimeButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3A7BFF",
    backgroundColor: "rgba(58,123,255,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addTimeText: {
    color: "#90B2FF",
    fontSize: 13,
    fontWeight: "600",
  },
  timeTag: {
    borderRadius: 10,
    backgroundColor: "#22222B",
    borderWidth: 1,
    borderColor: "#383845",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  timeTagText: {
    color: "#FFFFFF",
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
    borderColor: "#FFFFFF",
  },

  footerButtons: {
    borderTopWidth: 1,
    borderTopColor: "#2A2A33",
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
    borderRadius: 12,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  smallActionButton: {
    flex: 1,
    borderRadius: 12,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#24242D",
  },
  saveButton: {
    backgroundColor: "#3A7BFF",
  },
  deleteButton: {
    backgroundColor: "#C62828",
  },
  disabledButton: {
    opacity: 0.45,
  },
  cancelText: {
    color: "#D3D3DD",
    fontSize: 14,
    fontWeight: "700",
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  deleteText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  errorText: {
    color: "#FF8A80",
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2D2D36",
    backgroundColor: "#1D1D24",
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 64,
  },
  templateListTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  templateListMeta: {
    marginTop: 4,
    color: "#A8A8B3",
    fontSize: 12,
    fontWeight: "500",
  },
  emptyStateCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2D2D36",
    backgroundColor: "#17171D",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  emptyStateTitle: {
    color: "#F1F1F4",
    fontSize: 14,
    fontWeight: "700",
  },
  emptyStateSubtitle: {
    marginTop: 4,
    color: "#9696A2",
    fontSize: 12,
    fontWeight: "500",
  },
  timelineEmptyState: {
    marginTop: 18,
    marginRight: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2D2D36",
    backgroundColor: "#17171D",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
});
