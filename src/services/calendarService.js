export const DAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export const initialDeadlines = [
  {
    id: 0,
    title: "Coursework Haskell",
    description: "",
    date: new Date(2026, 2, 25, 16, 0),
    condition: false,
  },
  {
    id: 1,
    title: "Coursework Maths",
    description: "",
    date: new Date(2026, 2, 26, 11, 0),
    condition: false,
  },
];

// ===== Helper Functions =====
export function getDaysInMonth(month, year) {
  switch (month) {
    case 0:
    case 2:
    case 4:
    case 6:
    case 7:
    case 9:
    case 11:
      return 31;
    case 3:
    case 5:
    case 8:
    case 10:
      return 30;
    case 1:
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28;
    default:
      return "Invalid Month";
  }
}

export function monthName(index) {
  return (
    [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ][index] ?? "Invalid Month Index"
  );
}
