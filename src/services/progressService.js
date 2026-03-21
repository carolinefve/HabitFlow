export const MotivationalQuotes = [
  {
    quote: "You never miss a Monday 💪",
    sub: "Morning habits are your strongest.",
  },
  {
    quote: "3 weeks of consistency 🌿",
    sub: "Take it easy this weekend you've earned it!",
  },
];

export const WeeklyData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [{ data: [4, 6, 5, 7, 3, 6, 5] }],
};

export const MonthlyData = {
  labels: ["W1", "W2", "W3", "W4"],
  datasets: [{ data: [60, 70, 80, 90], color: () => "#7eb8f7" }],
};

export const ChartConfiguration = {
  backgroundGradientFrom: "#173454",
  backgroundGradientTo: "#173454",
  color: () => "#7eb8f7",
  labelColor: () => "#ffffff",
  strokeWidth: 2,
  barPercentage: 0.6,
  decimalPlaces: 0,
  propsForDots: { r: "5", strokeWidth: "2", stroke: "#7EB8F7" },
  propsForLabels: {
    fontSize: 14,
    fontWeight: "bold",
  },
};

// Streak Grid  8 weeks × 7 days
// Values: 0 = none, 1 = partial, 2 = done
export const EightWeeks = [
  2, 2, 2, 2, 0, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 0, 2, 1, 2, 2, 2,
  0, 2, 2, 2, 1, 2, 0, 2, 2, 2, 0, 2, 2, 2, 2, 1, 1, 2, 2, 2, 0, 2, 2, 2, 2, 2,
  1, 2, 2, 2,
];

export const DayLabels = ["M", "T", "W", "T", "F", "S", "S"];

// Generates month labels for the 8 columns, showing only when month changes
export function generateWeekLabels() {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const today = new Date();
  let lastMonth = -1;
  return Array.from({ length: 8 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (7 - i) * 7);
    const month = d.getMonth();
    if (month !== lastMonth) {
      lastMonth = month;
      return months[month];
    }
    return "";
  });
}

export const FrequencyOptions = [
  {
    key: "normal",
    label: "Normal",
    desc: "Remind me every time a habit is due",
  },
  {
    key: "gentle",
    label: "Gentle",
    desc: "Only remind me if I haven't completed it by midday",
  },
  {
    key: "minimal",
    label: "Minimal",
    desc: "One reminder per day, no matter how many habits are due",
  },
];

export const DefaultSettings = {
  notifications: true,
  dailyReminder: false,
  weeklyReport: true,
  darkMode: true,
  frequency: "normal",
};
