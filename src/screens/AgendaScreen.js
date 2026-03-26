import React, { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
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
  timelineHours,
  initialTasks,
  formatDate,
  BASE_DAY_DATE,
} from "../services/agendaService";

import styles from "../styles/agendaStyles";
import { Colours, TaskColourPalette } from "../styles/globalStyles";

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
    normalized && toMinutes(normalized) !== null && toMinutes(normalized) < 420;
  const error =
    hasValue && !normalized
      ? "Enter hour 1-12 and minute 00-59."
      : beforeVisibleRange
        ? `${fieldLabel} must be 7:00 AM or later.`
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
                      {TaskColourPalette.map((color) => (
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
      color: prev.color || TaskColourPalette[0],
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
