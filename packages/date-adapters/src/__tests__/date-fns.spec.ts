import { isValid } from "date-fns";
import { enUS } from "date-fns/locale";
import { describe, expect, it } from "vitest";
import { AdapterDateFns } from "../date-fns-adapter";
import { DateDetailError } from "../index";

describe("GIVEN a AdapterDateFns", () => {
  const adapter = new AdapterDateFns({ locale: enUS });

  it("SHOULD create a valid date from a string", () => {
    const date = adapter.date("2023-11-01");
    expect(adapter.isValid(date)).toBe(true);
    expect(date.getFullYear()).toBe(2023);
    expect(date.getMonth()).toBe(10); // Months are 0-indexed
    expect(date.getDate()).toBe(1);
  });

  it("SHOULD format a date correctly", () => {
    const date = new Date(2023, 10, 1); // November 1, 2023
    const formattedDate = adapter.format(date, "DD MMM YYYY");
    expect(formattedDate).toBe("01 Nov 2023");
  });

  it("SHOULD parse a date string correctly", () => {
    const result = adapter.parse("01 Nov 2023", "DD MMM YYYY");
    expect(adapter.isValid(result.date)).toBe(true);
    expect(result.date.getFullYear()).toBe(2023);
    expect(result.date.getMonth()).toBe(10); // Months are 0-indexed
    expect(result.date.getDate()).toBe(1);
  });

  it("SHOULD return an error for invalid date parsing", () => {
    const result = adapter.parse("invalid date", "DD MMM YYYY");
    expect(adapter.isValid(result.date)).toBe(false);
    expect(result.errors).toEqual([
      {
        message: "not a valid date",
        type: DateDetailError.INVALID_DATE,
      },
    ]);
  });

  it("should handle empty date strings", () => {
    const date = adapter.date("");
    expect(isValid(date)).toBe(false);
  });

  it("SHOULD compare two dates correctly", () => {
    const dateA = new Date(2023, 10, 1);
    const dateB = new Date(2023, 10, 2);
    expect(adapter.compare(dateA, dateB)).toBe(-1);
    expect(adapter.compare(dateB, dateA)).toBe(1);
    expect(adapter.compare(dateA, dateA)).toBe(0);
  });

  it("SHOULD add time to a date correctly", () => {
    const date = new Date(2023, 10, 1);
    const newDate = adapter.add(date, { days: 5, months: 1 });
    expect(newDate.getDate()).toBe(6);
    expect(newDate.getMonth()).toBe(11); // December
  });

  it("SHOULD subtract time from a date correctly", () => {
    const date = new Date(2023, 10, 6);
    const newDate = adapter.subtract(date, { days: 5, months: 1 });
    expect(newDate.getDate()).toBe(1);
    expect(newDate.getMonth()).toBe(9); // October
  });

  it("SHOULD set specific components of a date", () => {
    const date = new Date(2023, 10, 1);
    const newDate = adapter.set(date, { day: 15, month: 12, year: 2025 });
    expect(newDate.getDate()).toBe(15);
    expect(newDate.getMonth()).toBe(11); // December
    expect(newDate.getFullYear()).toBe(2025);
  });

  it("SHOULD check if two dates are the same day", () => {
    const dateA = new Date(2023, 10, 1);
    const dateB = new Date(2023, 10, 1, 12); // Same day, different time
    expect(adapter.isSame(dateA, dateB, "day")).toBe(true);
  });

  it("SHOULD get the start of a day", () => {
    const date = new Date(2023, 10, 1, 12, 30);
    const startOfDay = adapter.startOf(date, "day");
    expect(startOfDay.getHours()).toBe(0);
    expect(startOfDay.getMinutes()).toBe(0);
    expect(startOfDay.getSeconds()).toBe(0);
    expect(startOfDay.getMilliseconds()).toBe(0);
  });

  it("SHOULD get the end of a day", () => {
    const date = new Date(2023, 10, 1, 12, 30);
    const endOfDay = adapter.endOf(date, "day");
    expect(endOfDay.getHours()).toBe(23);
    expect(endOfDay.getMinutes()).toBe(59);
  });

  it("SHOULD return today's date at the start of the day", () => {
    const today = adapter.today();
    const now = new Date();
    expect(today.getFullYear()).toBe(now.getFullYear());
    expect(today.getMonth()).toBe(now.getMonth());
    expect(today.getDate()).toBe(now.getDate());
    expect(today.getHours()).toBe(0);
    expect(today.getMinutes()).toBe(0);
    expect(today.getSeconds()).toBe(0);
    expect(today.getMilliseconds()).toBe(0);
  });

  it("SHOULD return the current date and time", () => {
    const now = adapter.now();
    const current = new Date();
    expect(now.getFullYear()).toBe(current.getFullYear());
    expect(now.getMonth()).toBe(current.getMonth());
    expect(now.getDate()).toBe(current.getDate());
  });

  it("SHOULD get the name of the day of the week", () => {
    const dayName = adapter.getDayOfWeekName(3, "long");
    expect(dayName).toBe("Wednesday");
  });

  it("SHOULD get the day of the month", () => {
    const date = new Date(2023, 10, 15);
    expect(adapter.getDay(date)).toBe(15);
  });

  it("SHOULD get the month of the year", () => {
    const date = new Date(2023, 10, 15);
    expect(adapter.getMonth(date)).toBe(11); // November
  });

  it("SHOULD get the year", () => {
    const date = new Date(2023, 10, 15);
    expect(adapter.getYear(date)).toBe(2023);
  });

  it("SHOULD get the time components of a date", () => {
    const date = new Date(2023, 10, 15, 14, 30, 45, 123);
    const timeFields = adapter.getTime(date);
    expect(timeFields.hour).toBe(14);
    expect(timeFields.minute).toBe(30);
    expect(timeFields.second).toBe(45);
    expect(timeFields.millisecond).toBe(123);
  });

  it("SHOULD clone a date", () => {
    const date = new Date(2023, 10, 15);
    const clonedDate = adapter.clone(date);
    expect(clonedDate).toEqual(date);
    expect(clonedDate).not.toBe(date); // Ensure it's a different instance
  });
});
