const SLOT_HEIGHT = 88;
const PIXELS_PER_MINUTE = SLOT_HEIGHT / 60;
const BASE_DAY_DATE = new Date(2026, 1, 23);
const FIRST_VISIBLE_MINUTE = 5 * 60;

export function formatDateLabel(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseTaskDate(value) {
  if (!value) return new Date(BASE_DAY_DATE);

  const [year, month, day] = value.split("-").map(Number);
  if ([year, month, day].every((part) => Number.isInteger(part))) {
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  return new Date(BASE_DAY_DATE);
}

export function createEmptyForm(dateLabel, defaultColor) {
  return {
    id: "",
    title: "",
    date: parseTaskDate(dateLabel),
    startTime: "",
    endTime: "",
    notes: "",
    color: defaultColor,
    allDay: false,
  };
}

export function addDays(date, amount) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

export function normalizeTimeInput(value) {
  const trimmed = value.trim().toUpperCase().replace(/\s+/g, " ");
  const matched = trimmed.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/);
  if (!matched) return "";

  const hour = Number(matched[1]);
  const minute = Number(matched[2]);
  const period = matched[3];
  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return "";

  return `${hour}:${String(minute).padStart(2, "0")} ${period}`;
}

export function parseTimeInputParts(value) {
  const normalized = normalizeTimeInput(value || "");
  if (!normalized) {
    return { hour: "", minute: "", period: "AM" };
  }

  const [clock, period] = normalized.split(" ");
  const [hour, minute] = clock.split(":");
  return { hour: `${Number(hour)}`, minute, period };
}

export function normalizeNumericTimeInput(hourValue, minuteValue, periodValue) {
  const hourDigits = (hourValue || "").replace(/\D/g, "").slice(0, 2);
  const minuteDigits = (minuteValue || "").replace(/\D/g, "").slice(0, 2);
  const period = periodValue === "PM" ? "PM" : "AM";
  if (!hourDigits && !minuteDigits) return "";

  const hour = Number(hourDigits);
  const minute = Number(minuteDigits);

  if (!hourDigits || !minuteDigits) {
    return "";
  }

  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
    return "";
  }

  return `${hour}:${String(minute).padStart(2, "0")} ${period}`;
}

export function timeToMinutes(value) {
  const normalized = normalizeTimeInput(value || "");
  if (!normalized) return null;

  const [clock, period] = normalized.split(" ");
  const [rawHour, rawMinute] = clock.split(":").map(Number);
  let hour = rawHour;
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return hour * 60 + rawMinute;
}

export function validateTaskForm(form) {
  if (!form.title.trim()) {
    return { isValid: false, error: "Title is required." };
  }

  if (form.allDay) {
    return { isValid: true, error: "" };
  }

  const hasStart = Boolean(form.startTime.trim());
  const hasEnd = Boolean(form.endTime.trim());
  const normalizedStart = hasStart ? normalizeTimeInput(form.startTime) : "";
  const normalizedEnd = hasEnd ? normalizeTimeInput(form.endTime) : "";

  if (hasStart && !normalizedStart) {
    return { isValid: false, error: "Start Time must use h:mm AM/PM." };
  }
  if (hasEnd && !normalizedEnd) {
    return { isValid: false, error: "End Time must use h:mm AM/PM." };
  }
  if ((hasStart && !hasEnd) || (!hasStart && hasEnd)) {
    return {
      isValid: false,
      error: "Start Time and End Time must both be set.",
    };
  }
  if (
    normalizedStart &&
    timeToMinutes(normalizedStart) < FIRST_VISIBLE_MINUTE
  ) {
    return {
      isValid: false,
      error: "Start Time must be 7:00 AM or later.",
    };
  }
  if (normalizedEnd && timeToMinutes(normalizedEnd) < FIRST_VISIBLE_MINUTE) {
    return {
      isValid: false,
      error: "End Time must be 7:00 AM or later.",
    };
  }
  if (
    normalizedStart &&
    normalizedEnd &&
    timeToMinutes(normalizedEnd) <= timeToMinutes(normalizedStart)
  ) {
    return { isValid: false, error: "End Time must be after Start Time." };
  }

  return { isValid: true, error: "" };
}

function createId(prefix = "task") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function buildTaskPayload(form) {
  return {
    id: form.id || createId("task"),
    title: form.title.trim(),
    dateLabel: formatDateLabel(form.date),
    allDay: form.allDay,
    startTime: form.allDay ? "" : normalizeTimeInput(form.startTime),
    endTime: form.allDay ? "" : normalizeTimeInput(form.endTime),
    notes: form.notes.trim(),
    color: form.color,
  };
}

export function upsertTask(tasks, taskPayload, mode) {
  if (mode === "edit") {
    return tasks.map((task) =>
      task.id === taskPayload.id ? taskPayload : task,
    );
  }
  return [...tasks, taskPayload];
}

export function deleteTaskById(tasks, taskId) {
  return tasks.filter((task) => task.id !== taskId);
}

export function filterTasksByDate(tasks, dateLabel) {
  return tasks.filter((task) => task.dateLabel === dateLabel);
}

export function sortTimelineTasks(tasks) {
  return tasks
    .filter((task) => !task.allDay)
    .sort((left, right) => {
      const leftMinutes = timeToMinutes(left.startTime);
      const rightMinutes = timeToMinutes(right.startTime);

      if (leftMinutes === null && rightMinutes === null) return 0;
      if (leftMinutes === null) return 1;
      if (rightMinutes === null) return -1;
      return leftMinutes - rightMinutes;
    });
}

export function computeBlockHeight(task) {
  const start = timeToMinutes(task.startTime);
  const end = timeToMinutes(task.endTime);
  if (start === null) return 52;

  const duration = end !== null && end > start ? end - start : 60;
  return Math.max(26, Math.round(duration * PIXELS_PER_MINUTE));
}

export function computeBlockTop(task, fallbackIndex) {
  const baseline = timeToMinutes("7:00 AM");
  const start = timeToMinutes(task.startTime);
  if (start === null) return 14 + fallbackIndex * 92;

  const minuteOffset = Math.max(0, start - baseline);
  return Math.round(minuteOffset * PIXELS_PER_MINUTE);
}

function buildTemplateName(dateLabel, count, existingCount) {
  return `Template ${existingCount + 1} - ${dateLabel} - ${count} task${count === 1 ? "" : "s"}`;
}

export function createTemplateFromTasks(
  tasks,
  selectedDateLabel,
  existingCount,
) {
  const templateTasks = tasks.map((task) => ({
    ...task,
    id: createId("template-task"),
  }));

  return {
    id: createId("template"),
    name: buildTemplateName(
      selectedDateLabel,
      templateTasks.length,
      existingCount,
    ),
    tasks: templateTasks,
  };
}

export function applyTemplateToDate(template, dateLabel) {
  return template.tasks.map((task) => ({
    ...task,
    id: createId("task"),
    dateLabel,
  }));
}
