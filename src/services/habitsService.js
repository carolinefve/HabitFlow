export const GENERAL_CATEGORY = "General";

export const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const WEEK_DAYS = [
  { short: "M", value: 1 },
  { short: "T", value: 2 },
  { short: "W", value: 3 },
  { short: "T", value: 4 },
  { short: "F", value: 5 },
  { short: "S", value: 6 },
  { short: "S", value: 0 },
];

export const INITIAL_CATEGORIES = [
  "General",
  "Health & Fitness",
  "Learning",
  "Productivity",
];

export const INITIAL_HABITS = [
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

// today scheduling
export const isScheduledToday = (habit) => {
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

// display helpers
export const getDurationDisplay = ({ hours = 0, minutes = 0 } = {}) => {
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  return parts.join(" ");
};

export const getFrequencyDisplay = (frequency) => {
  if (!frequency || frequency.type === "daily") return "Every day";
  if (frequency.type === "none") return "One Time";
  if (frequency.type === "interval")
    return frequency.days === 1 ? "Every day" : `Every ${frequency.days} days`;
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
