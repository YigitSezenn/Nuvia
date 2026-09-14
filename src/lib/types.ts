export type Habit = {
  id: string;
  name: string;
  color: string;
  reminderHour: number | null;
  createdAt: string;
};

export type CheckIn = {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD, cihazın yerel günü
};
