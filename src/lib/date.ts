/** Yerel takvim günü — timezone paketi yok (Notion kuralı). */
export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** `YYYY-MM-DD` anahtarını gün kaydır (örn. -1 = dün). */
export function shiftDayKey(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return todayKey(date);
}
/** Ayın gün sayısı (1–12 arası month: JS gibi 0–11). */
export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * Ay ızgarası için hücreler.
 * Pazartesi = 0 … Pazar = 6.
 * Başka aydan gelen günler null (Notion: soluk / dokunulmaz — şimdilik boş hücre).
 */
export function monthGrid(
  year: number,
  monthIndex: number
): (number | null)[] {
  const first = new Date(year, monthIndex, 1);
  // JS: Pazar=0 … Cumartesi=6 → Pazartesi=0 yapmak için:
  const mondayOffset = (first.getDay() + 6) % 7;
  const total = daysInMonth(year, monthIndex);
  const cells: (number | null)[] = [];

  for (let i = 0; i < mondayOffset; i++) {
    cells.push(null);
  }
  for (let day = 1; day <= total; day++) {
    cells.push(day);
  }
  // Son satırı 7’ye tamamla (opsiyonel ama düzenli görünür)
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

export function monthLabel(year: number, monthIndex: number): string {
  const raw = new Date(year, monthIndex, 1).toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric",
  });
  return raw.charAt(0).toLocaleUpperCase("tr-TR") + raw.slice(1);
}

export function toDateKey(
  year: number,
  monthIndex: number,
  day: number
): string {
  const m = String(monthIndex + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}