import React, { useMemo, useState } from "react";
import {
  Alert,
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
  normalizeNumericTimeInput,
  parseTimeInputParts,
  parseTaskDate,
  sortTimelineTasks,
  upsertTask,
  validateTaskForm,
  deleteTaskById,
} from "../services/agendaService";

import {
  Colours,
  Radius,
  Spacing,
  TaskColourPalette,
  HeaderTitle,
} from "../styles/global";

const SLOT_HEIGHT = 88;
const BASE_DAY_DATE = new Date(2026, 1, 23);

const colorPalette = TaskColourPalette;

const timelineHours = [
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
    id: "ad-1",
    title: "Reading",
    dateLabel: "2026-02-23",
    allDay: true,
    notes: "",
    color: "#E53935",
    startTime: "",
    endTime: "",
  },
  {
    id: "ad-2",
    title: "Reading",
    dateLabel: "2026-02-24",
    allDay: true,
    notes: "",
    color: "#8E24AA",
    startTime: "",
    endTime: "",
  },
  {
    id: "ad-3",
    title: "Reading",
    dateLabel: "2026-02-25",
    allDay: true,
    notes: "",
    color: "#3A7BFF",
    startTime: "",
    endTime: "",
  },
  {
    id: "ad-4",
    title: "Reading",
    dateLabel: "2026-02-26",
    allDay: true,
    notes: "",
    color: "#43A047",
    startTime: "",
    endTime: "",
  },
  {
    id: "ad-5",
    title: "Reading",
    dateLabel: "2026-02-27",
    allDay: true,
    notes: "",
    color: "#E53935",
    startTime: "",
    endTime: "",
  },
  {
    id: "t-1",
    title: "Morning Exercise",
    dateLabel: "2026-02-23",
    allDay: false,
    startTime: "6:00 AM",
    endTime: "7:00 AM",
    notes: "Morning workout",
    color: "#43A047",
  },
  {
    id: "t-2",
    title: "Lecture 1",
    dateLabel: "2026-02-23",
    allDay: false,
    startTime: "8:00 AM",
    endTime: "10:00 AM",
    notes: "Lecture Hall A",
    color: "#3A7BFF",
  },
  {
    id: "t-3",
    title: "Morning Exercise",
    dateLabel: "2026-02-24",
    allDay: false,
    startTime: "6:00 AM",
    endTime: "7:00 AM",
    notes: "Morning workout",
    color: "#43A047",
  },
  {
    id: "t-4",
    title: "Lecture 2",
    dateLabel: "2026-02-24",
    allDay: false,
    startTime: "8:00 AM",
    endTime: "10:00 AM",
    notes: "Lecture Hall A",
    color: "#3A7BFF",
  },
  {
    id: "t-5",
    title: "Morning Exercise",
    dateLabel: "2026-02-25",
    allDay: false,
    startTime: "6:00 AM",
    endTime: "7:00 AM",
    notes: "Morning workout",
    color: "#43A047",
  },
  {
    id: "t-6",
    title: "Lecture 3",
    dateLabel: "2026-02-25",
    allDay: false,
    startTime: "8:00 AM",
    endTime: "10:00 AM",
    notes: "Lecture Hall A",
    color: "#3A7BFF",
  },
  {
    id: "t-7",
    title: "Morning Exercise",
    dateLabel: "2026-02-26",
    allDay: false,
    startTime: "6:00 AM",
    endTime: "7:00 AM",
    notes: "Morning workout",
    color: "#43A047",
  },
  {
    id: "t-8",
    title: "Lecture 4",
    dateLabel: "2026-02-26",
    allDay: false,
    startTime: "8:00 AM",
    endTime: "10:00 AM",
    notes: "Lecture Hall A",
    color: "#3A7BFF",
  },
  {
    id: "t-9",
    title: "Morning Exercise",
    dateLabel: "2026-02-27",
    allDay: false,
    startTime: "6:00 AM",
    endTime: "7:00 AM",
    notes: "Morning workout",
    color: "#43A047",
  },
  {
    id: "t-10",
    title: "Lecture 5",
    dateLabel: "2026-02-27",
    allDay: false,
    startTime: "8:00 AM",
    endTime: "10:00 AM",
    notes: "Lecture Hall A",
    color: "#3A7BFF",
  },
];

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function InlineTimeEditor({ visible, fieldLabel, value, onClose, onSave }) {
  const [hourValue, setHourValue] = useState("");
  const [minuteValue, setMinuteValue] = useState("");
  const [periodValue, setPeriodValue] = useState("AM");

  React.useEffect(() => {
    if (!visible) return;
    const nextParts = parseTimeInputParts(value);
    setHourValue(nextParts.hour);
    setMinuteValue(nextParts.minute);
    setPeriodValue(nextParts.period);
  }, [value, visible]);

  if (!visible) return null;

  const normalized = normalizeNumericTimeInput(
    hourValue,
    minuteValue,
    periodValue,
  );
  const hasValue = hourValue.trim().length > 0 || minuteValue.trim().length > 0;
  const toMinutes = (timeValue) => {
    if (!timeValue) return null;
    const [clock, period] = timeValue.split(" ");
    if (!clock || !period) return null;
    const [rawHour, rawMinute] = clock.split(":").map(Number);
    if (!Number.isFinite(rawHour) || !Number.isFinite(rawMinute)) return null;
    let hour = rawHour;
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    return hour * 60 + rawMinute;
  };
  const beforeVisibleRange =
    normalized && toMinutes(normalized) !== null && toMinutes(normalized) < 300;
  const error =
    hasValue && !normalized
      ? "Enter hour 1-12 and minute 00-59."
      : beforeVisibleRange
        ? `${fieldLabel} must be 5:00 AM or later.`
        : "";

  return (
    <View style={styles.inlineTimeEditor}>
      <Text style={styles.dialogTitle}>{fieldLabel}</Text>
      <Text style={styles.dialogHint}>
        Enter hour and minute, then choose AM or PM.
      </Text>

      <View style={styles.timeInputRow}>
        <TextInput
          value={hourValue}
          onChangeText={(text) =>
            setHourValue(text.replace(/\D/g, "").slice(0, 2))
          }
          placeholder=""
          placeholderTextColor={Colours.textDisabled}
          keyboardType="number-pad"
          style={[styles.input, styles.timeSplitInput, styles.timeInputField]}
        />
        <Text style={styles.timeColon}>:</Text>
        <TextInput
          value={minuteValue}
          onChangeText={(text) =>
            setMinuteValue(text.replace(/\D/g, "").slice(0, 2))
          }
          placeholder=""
          placeholderTextColor={Colours.textDisabled}
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
            hasValue && (!normalized || beforeVisibleRange)
              ? styles.disabledButton
              : null,
          ]}
          onPress={() => onSave(normalized)}
          disabled={hasValue && (!normalized || beforeVisibleRange)}
        >
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  templates,
  templatePickerVisible,
  onOpenTemplatePicker,
  onCloseTemplatePicker,
  onSelectTemplate,
}) {
  const [timeField, setTimeField] = useState("");
  const modalTitle = templatePickerVisible
    ? "Use Template"
    : mode === "edit"
      ? "Edit Task"
      : "Create Task";
  const validation = validateTaskForm(form);

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{modalTitle}</Text>

            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={styles.formContent}
              showsVerticalScrollIndicator={false}
            >
              {templatePickerVisible ? (
                <>
                  <Text style={styles.dialogHint}>
                    Import all tasks into the selected day.
                  </Text>
                  {templates.length ? (
                    templates.map((template) => (
                      <TouchableOpacity
                        key={template.id}
                        style={styles.templateListItem}
                        activeOpacity={0.82}
                        onPress={() => onSelectTemplate(template)}
                      >
                        <Text style={styles.templateListTitle}>
                          {template.name}
                        </Text>
                        <Text style={styles.templateListMeta}>
                          {template.tasks.length} task
                          {template.tasks.length === 1 ? "" : "s"}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.emptyStateCard}>
                      <Text style={styles.emptyStateTitle}>
                        No templates saved
                      </Text>
                      <Text style={styles.emptyStateSubtitle}>
                        Save a day first, then reuse it here.
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                <>
                  {mode === "create" ? (
                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>Template</Text>
                      <TouchableOpacity
                        style={styles.templateButton}
                        activeOpacity={0.8}
                        onPress={onOpenTemplatePicker}
                      >
                        <Text style={styles.templateButtonText}>
                          Use Template
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Title</Text>
                    <TextInput
                      value={form.title}
                      onChangeText={(text) =>
                        setForm((prev) => ({ ...prev, title: text }))
                      }
                      placeholder="Task title"
                      placeholderTextColor={Colours.textDisabled}
                      style={styles.input}
                    />
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Date</Text>
                    <View style={styles.dateRow}>
                      <View style={styles.dateBadge}>
                        <Text style={styles.dateBadgeText}>
                          {formatDate(form.date)}
                        </Text>
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
                        trackColor={{
                          false: Colours.bgCardDark,
                          true: Colours.brandBlueDark,
                        }}
                        thumbColor={
                          form.allDay ? Colours.brandBlue : Colours.brandBlueDim
                        }
                      />
                    </View>
                    {form.allDay ? (
                      <Text style={styles.allDayHint}>All Day</Text>
                    ) : null}
                  </View>

                  {!form.allDay ? (
                    <>
                      <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Start Time</Text>
                        <View style={styles.timeFieldRow}>
                          <TouchableOpacity
                            style={
                              form.startTime
                                ? styles.timeTag
                                : styles.addTimeButton
                            }
                            onPress={() => setTimeField("startTime")}
                            activeOpacity={0.8}
                          >
                            <Text
                              style={
                                form.startTime
                                  ? styles.timeTagText
                                  : styles.addTimeText
                              }
                            >
                              {form.startTime || "Add time"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <InlineTimeEditor
                          visible={timeField === "startTime"}
                          fieldLabel="Start Time"
                          value={form.startTime}
                          onClose={() => setTimeField("")}
                          onSave={(value) => {
                            setForm((prev) => ({ ...prev, startTime: value }));
                            setTimeField("");
                          }}
                        />
                      </View>

                      <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>End Time</Text>
                        <View style={styles.timeFieldRow}>
                          <TouchableOpacity
                            style={
                              form.endTime
                                ? styles.timeTag
                                : styles.addTimeButton
                            }
                            onPress={() => setTimeField("endTime")}
                            activeOpacity={0.8}
                          >
                            <Text
                              style={
                                form.endTime
                                  ? styles.timeTagText
                                  : styles.addTimeText
                              }
                            >
                              {form.endTime || "Add time"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <InlineTimeEditor
                          visible={timeField === "endTime"}
                          fieldLabel="End Time"
                          value={form.endTime}
                          onClose={() => setTimeField("")}
                          onSave={(value) => {
                            setForm((prev) => ({ ...prev, endTime: value }));
                            setTimeField("");
                          }}
                        />
                      </View>
                    </>
                  ) : null}

                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Notes</Text>
                    <TextInput
                      value={form.notes}
                      onChangeText={(text) =>
                        setForm((prev) => ({ ...prev, notes: text }))
                      }
                      placeholder="Optional notes"
                      placeholderTextColor={Colours.textDisabled}
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
                            form.color === color
                              ? styles.colorSwatchActive
                              : null,
                          ]}
                          onPress={() =>
                            setForm((prev) => ({ ...prev, color }))
                          }
                        />
                      ))}
                    </View>
                  </View>

                  {validation.error ? (
                    <Text style={styles.errorText}>{validation.error}</Text>
                  ) : null}
                </>
              )}
            </ScrollView>

            <View style={styles.footerButtons}>
              {templatePickerVisible ? (
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={onCloseTemplatePicker}
                >
                  <Text style={styles.cancelText}>Back</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={onClose}
                  >
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
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={onDelete}
                    >
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  ) : null}
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

export default function AgendaScreen() {
  const [tasks, setTasks] = useState(initialTasks);
  const [templates, setTemplates] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [templatePickerVisible, setTemplatePickerVisible] = useState(false);
  const [mode, setMode] = useState("create");
  const [form, setForm] = useState(
    createEmptyForm(formatDateLabel(BASE_DAY_DATE)),
  );
  const [selectedDate, setSelectedDate] = useState(BASE_DAY_DATE);

  const selectedDateLabel = formatDateLabel(selectedDate);
  const tasksForSelectedDate = useMemo(
    () => filterTasksByDate(tasks, selectedDateLabel),
    [selectedDateLabel, tasks],
  );
  const allDayTasks = useMemo(
    () => tasksForSelectedDate.filter((task) => task.allDay),
    [tasksForSelectedDate],
  );
  const timelineTasks = useMemo(
    () => sortTimelineTasks(tasksForSelectedDate),
    [tasksForSelectedDate],
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
    if (!tasksForSelectedDate.length) {
      Alert.alert(
        "No Tasks To Save",
        "Add at least one task on this day before saving a template.",
      );
      return;
    }
    let nextTemplateName = "";
    setTemplates((prev) => {
      const nextTemplate = createTemplateFromTasks(
        tasksForSelectedDate,
        selectedDateLabel,
        prev.length,
      );
      nextTemplateName = nextTemplate.name;
      return [...prev, nextTemplate];
    });
    Alert.alert("Template Saved", nextTemplateName);
  };

  const handleUseTemplate = (template) => {
    setTasks((prev) => [
      ...prev,
      ...applyTemplateToDate(template, selectedDateLabel),
    ]);
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
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Agenda</Text>
        </View>

        <View style={styles.dateNavRow}>
          <TouchableOpacity
            onPress={() => setSelectedDate((prev) => addDays(prev, -1))}
            style={styles.arrowButton}
            activeOpacity={0.7}
          >
            <Text style={styles.arrowText}>{"<"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateBadgePill}
            activeOpacity={0.7}
            onPress={() => {}}
          >
            <Text style={styles.dateBadgePillText}>
              {formatDate(selectedDate)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedDate((prev) => addDays(prev, 1))}
            style={styles.arrowButton}
            activeOpacity={0.7}
          >
            <Text style={styles.arrowText}>{">"}</Text>
          </TouchableOpacity>

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

        <Text style={styles.sectionLabel}>All Day</Text>
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
                <Text style={styles.allDaySubtitle}>
                  {task.notes || task.dateLabel}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyStateCard}>
              <Text style={styles.emptyStateTitle}>No all day tasks</Text>
              <Text style={styles.emptyStateSubtitle}>{selectedDateLabel}</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionLabel}>Schedule</Text>
        <View style={styles.timelineSection}>
          <View style={styles.timeColumn}>
            {timelineHours.map((hour) => (
              <View
                key={hour}
                style={styles.timeRow}
              >
                <Text style={styles.timeText}>{hour}</Text>
              </View>
            ))}
          </View>

          <View style={styles.blocksColumn}>
            {timelineHours.map((hour) => (
              <View
                key={`line-${hour}`}
                style={styles.hourLine}
              />
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
                  <Text style={styles.emptyStateSubtitle}>
                    Tap + to add one
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.fab}
        onPress={openCreateModal}
      >
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
        templates={templates}
        templatePickerVisible={templatePickerVisible}
        onOpenTemplatePicker={() => setTemplatePickerVisible(true)}
        onCloseTemplatePicker={() => setTemplatePickerVisible(false)}
        onSelectTemplate={handleUseTemplate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 12,
    fontWeight: "800",
    color: Colours.textPrimary,
    textTransform: "uppercase",
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
