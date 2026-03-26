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
  autoBackup: true,
};
