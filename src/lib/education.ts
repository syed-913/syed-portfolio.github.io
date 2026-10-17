type EducationDates = { startDate?: string; endDate?: string; endDatePrecision?: "estimated" | "exact"; educationStatus?: string; entryType?: string };
const DAY = 86_400_000;
const KARACHI_OFFSET = 5 * 60 * 60 * 1000;
const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const monthNames = /^(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)$/i;

/** Calendar dates use Karachi time, consistently in the browser and Worker. */
export function parseEducationDate(value = "", end = false): number | null {
  const text = value.trim();
  let year: number, month: number, day: number;
  let match = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(text);
  if (match) {
    year = Number(match[1]); month = match[2] ? Number(match[2]) - 1 : end ? 11 : 0;
    day = match[3] ? Number(match[3]) : end ? new Date(Date.UTC(year, month + 1, 0)).getUTCDate() : 1;
  } else {
    match = /^([a-z]+)[\s/,-]+(\d{4})$/i.exec(text);
    if (!match || !monthNames.test(match[1])) return null;
    month = months.indexOf(match[1].slice(0, 3).toLowerCase()); year = Number(match[2]);
    day = end ? new Date(Date.UTC(year, month + 1, 0)).getUTCDate() : 1;
  }
  if (year < 1900 || year > 2200 || month < 0 || month > 11 || day < 1) return null;
  const stamp = Date.UTC(year, month, day);
  const date = new Date(stamp);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month || date.getUTCDate() !== day) return null;
  return stamp - KARACHI_OFFSET;
}

export const isExactEducationDate = (value = "") => /^\d{4}-\d{2}-\d{2}$/.test(value) && parseEducationDate(value) !== null;

export function educationTimeline(entry: EducationDates, now = Date.now()) {
  if (entry.educationStatus !== "in_progress") return null;
  const start = parseEducationDate(entry.startDate);
  const end = entry.endDatePrecision === "exact" && !isExactEducationDate(entry.endDate) ? null : parseEducationDate(entry.endDate, true);
  if (start === null || end === null || end <= start) return null;
  const percent = Math.max(0, Math.min(100, Math.floor((now - start) / (end - start) * 100)));
  return { percent, start, end, reached: now >= end, started: now >= start, daysRemaining: Math.max(0, Math.ceil((end - now) / DAY)), estimated: entry.endDatePrecision !== "exact" };
}

export const readableEducationDate = (value = "") => {
  const stamp = parseEducationDate(value);
  if (stamp === null) return value.replace("/", " ");
  const exact = isExactEducationDate(value);
  if (/^\d{4}$/.test(value.trim())) return value.trim();
  return new Intl.DateTimeFormat("en-GB", { ...(exact ? { day: "numeric" as const } : {}), month: "short", year: "numeric", timeZone: "Asia/Karachi" }).format(stamp);
};
