import type {
  DateFrameworkType,
  SaltDateAdapter,
  Timezone,
} from "@salt-ds/date-adapters";

export const COLUMNS = 3;
export const MONTHS_PER_YEAR = 12;
export const ROWS = MONTHS_PER_YEAR / COLUMNS;

/**
 * Build the twelve start-of-month DateFrameworkType values for the given
 * calendar year, honouring the caller-supplied timezone.
 */
export function buildMonthsForYear(
  dateAdapter: SaltDateAdapter,
  year: number,
  timezone?: Timezone,
): DateFrameworkType[] {
  const startOfYear = dateAdapter.startOf(dateAdapter.today(timezone), "year");
  // Move to Jan 1st of the target year without dragging any wall-clock time.
  const target = dateAdapter.set(startOfYear, { year, month: 1, day: 1 });
  return Array.from({ length: MONTHS_PER_YEAR }, (_, index) =>
    dateAdapter.add(target, { months: index }),
  );
}

/** Read the calendar year off the adapter without string round-tripping. */
export function yearOf(
  dateAdapter: SaltDateAdapter,
  date: DateFrameworkType | null | undefined,
  fallback: () => number,
): number {
  if (date && dateAdapter.isValid(date)) {
    return dateAdapter.getYear(date);
  }
  return fallback();
}

/** Read the calendar month (0-based index) off the adapter. */
export function monthIndexOf(
  dateAdapter: SaltDateAdapter,
  date: DateFrameworkType | null | undefined,
  fallback: number,
): number {
  if (date && dateAdapter.isValid(date)) {
    // SaltDateAdapter.getMonth returns 1-12; we grid on 0-11.
    return dateAdapter.getMonth(date) - 1;
  }
  return fallback;
}

/**
 * True when a candidate month falls outside the min/max window at month
 * granularity (not just year). Both boundaries are treated as inclusive on
 * their containing month, matching the semantics of the day grid.
 */
export function isMonthOutOfRange(
  dateAdapter: SaltDateAdapter,
  candidate: DateFrameworkType,
  minDate?: DateFrameworkType,
  maxDate?: DateFrameworkType,
): boolean {
  const candidateStart = dateAdapter.startOf(candidate, "month");
  if (minDate && dateAdapter.isValid(minDate)) {
    const minStart = dateAdapter.startOf(minDate, "month");
    if (dateAdapter.compare(candidateStart, minStart) < 0) {
      return true;
    }
  }
  if (maxDate && dateAdapter.isValid(maxDate)) {
    const maxStart = dateAdapter.startOf(maxDate, "month");
    if (dateAdapter.compare(candidateStart, maxStart) > 0) {
      return true;
    }
  }
  return false;
}
