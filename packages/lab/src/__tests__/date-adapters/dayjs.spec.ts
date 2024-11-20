import { describe, it, expect } from "vitest";
import { AdapterDayjs, DateDetailErrorEnum } from "../../date-adapters";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";

// Extend dayjs with necessary plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

describe("GIVEN a AdapterDayjs", () => {
  const adapter = new AdapterDayjs({ locale: "en" });


  it('should create a Dayjs date in the system timezone', () => {
    const date = adapter.date('2023-11-01', 'system');
    expect(date.isValid()).toBe(true);
    expect(date.format('YYYY-MM-DD')).toBe('2023-11-01');
  });

  it('should create a Dayjs date in UTC', () => {
    const date = adapter.date('2023-11-01', 'UTC');
    expect(date.isValid()).toBe(true);
    expect(date.format('YYYY-MM-DD')).toBe('2023-11-01');
    expect(date.utcOffset()).toBe(0); // UTC offset should be 0
  });

  it('should create a Dayjs date in a specific timezone', () => {
    const timezone = 'America/New_York';
    const date = adapter.date('2023-11-01', timezone);
    expect(date.isValid()).toBe(true);
    expect(date.format('YYYY-MM-DD')).toBe('2023-11-01');
    expect(date.tz(timezone).format('Z')).toBe(date.format('Z')); // Check if the timezone is applied
  });

  it('should handle invalid date strings', () => {
    const date = adapter.date('invalid-date', 'system');
    expect(date.isValid()).toBe(false);
  });

  it('should handle empty date strings', () => {
    const date = adapter.date('', 'system');
    expect(date.isValid()).toBe(false);
  });

  it('should handle default timezone when no timezone is specified', () => {
    const date = adapter.date('2023-11-01');
    expect(date.isValid()).toBe(true);
    expect(date.format('YYYY-MM-DD')).toBe('2023-11-01');
  });

  it("SHOULD format a Dayjs date correctly", () => {
    const date = dayjs("2023-11-01");
    const formattedDate = adapter.format(date, "DD MMM YYYY");
    expect(formattedDate).toBe("01 Nov 2023");
  });

  it("SHOULD parse a date string correctly", () => {
    const result = adapter.parse("01 Nov 2023", "DD MMM YYYY");
    expect(adapter.isValid(result.date)).toBe(true);
    expect(result.date.year()).toBe(2023);
    expect(result.date.month()).toBe(10); // Months are 0-indexed
    expect(result.date.date()).toBe(1);
  });

  it("SHOULD return an error for invalid date parsing", () => {
    const result = adapter.parse("invalid date", "DD MMM YYYY");
    expect(adapter.isValid(result.date)).toBe(false);
    expect(result.errors).toEqual([
      {
        message: "not a valid date",
        type: DateDetailErrorEnum.INVALID_DATE,
      },
    ]);
  });

  it("SHOULD compare two Dayjs dates correctly", () => {
    const dateA = dayjs("2023-11-01");
    const dateB = dayjs("2023-11-02");
    expect(adapter.compare(dateA, dateB)).toBe(-1);
    expect(adapter.compare(dateB, dateA)).toBe(1);
    expect(adapter.compare(dateA, dateA)).toBe(0);
  });

  it("SHOULD add time to a Dayjs date correctly", () => {
    const date = dayjs("2023-11-01");
    const newDate = adapter.add(date, { days: 5, months: 1 });
    expect(newDate.date()).toBe(6);
    expect(newDate.month()).toBe(11); // December
  });

  it("SHOULD subtract time from a Dayjs date correctly", () => {
    const date = dayjs("2023-11-06");
    const newDate = adapter.subtract(date, { days: 5, months: 1 });
    expect(newDate.date()).toBe(1);
    expect(newDate.month()).toBe(9); // October
  });

  it("SHOULD set specific components of a Dayjs date", () => {
    const date = dayjs("2023-11-01");
    const newDate = adapter.set(date, { day: 15, month: 12, year: 2025 });
    expect(newDate.date()).toBe(15);
    expect(newDate.month()).toBe(11); // December
    expect(newDate.year()).toBe(2025);
  });

  it("SHOULD check if two Dayjs dates are the same day", () => {
    const dateA = dayjs("2023-11-01");
    const dateB = dayjs("2023-11-01T12:00:00"); // Same day, different time
    expect(adapter.isSame(dateA, dateB, "day")).toBe(true);
  });

  it("SHOULD get the start of a day", () => {
    const date = dayjs("2023-11-01T12:30:00");
    const startOfDay = adapter.startOf(date, "day");
    expect(startOfDay.hour()).toBe(0);
    expect(startOfDay.minute()).toBe(0);
  });

  it("SHOULD get the end of a day", () => {
    const date = dayjs("2023-11-01T12:30:00");
    const endOfDay = adapter.endOf(date, "day");
    expect(endOfDay.hour()).toBe(23);
    expect(endOfDay.minute()).toBe(59);
  });

  it("SHOULD return today's date at the start of the day", () => {
    const today = adapter.today();
    const now = dayjs();
    expect(today.year()).toBe(now.year());
    expect(today.month()).toBe(now.month());
    expect(today.date()).toBe(now.date());
    expect(today.hour()).toBe(0);
    expect(today.minute()).toBe(0);
  });

  it("SHOULD return the current date and time", () => {
    const now = adapter.now();
    const current = dayjs();
    expect(now.year()).toBe(current.year());
    expect(now.month()).toBe(current.month());
    expect(now.date()).toBe(current.date());
  });

  it("SHOULD get the day of the week", () => {
    const date = dayjs("2023-11-01"); // November 1, 2023 is a Wednesday
    expect(adapter.getDayOfWeek(date)).toBe(3); // 0 = Sunday, 3 = Wednesday
  });

  it("SHOULD get the name of the day of the week", () => {
    const dayName = adapter.getDayOfWeekName(3, "long", "en");
    expect(dayName).toBe("Wednesday");
  });

  it("SHOULD get the day of the month", () => {
    const date = dayjs("2023-11-15");
    expect(adapter.getDay(date)).toBe(15);
  });

  it("SHOULD get the month of the year", () => {
    const date = dayjs("2023-11-15");
    expect(adapter.getMonth(date)).toBe(11); // November
  });

  it("SHOULD get the year", () => {
    const date = dayjs("2023-11-15");
    expect(adapter.getYear(date)).toBe(2023);
  });

  it("SHOULD get the time components of a Dayjs date", () => {
    const date = dayjs("2023-11-15T14:30:45.123");
    const timeFields = adapter.getTime(date);
    expect(timeFields.hour).toBe(14);
    expect(timeFields.minute).toBe(30);
    expect(timeFields.second).toBe(45);
    expect(timeFields.millisecond).toBe(123);
  });

  it("SHOULD clone a Dayjs date", () => {
    const date = dayjs("2023-11-15");
    const clonedDate = adapter.clone(date);
    expect(clonedDate.isSame(date)).toBe(true);
    expect(clonedDate).not.toBe(date); // Ensure it's a different instance
  });
});
