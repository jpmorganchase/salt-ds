import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";
import { DateDetailError } from "../index";
import { AdapterLuxon } from "../luxon-adapter";

describe("GIVEN a AdapterLuxon", () => {
  const adapter = new AdapterLuxon({ locale: "en-US" });

  it("should create a Luxon DateTime in the system timezone", () => {
    const date = adapter.date("2023-11-01", "system");
    expect(date.isValid).toBe(true);
    expect(date.toISODate()).toBe("2023-11-01");
  });

  it("should create a Luxon DateTime in UTC", () => {
    const date = adapter.date("2023-11-01", "UTC");
    expect(date.isValid).toBe(true);
    expect(date.toISODate()).toBe("2023-11-01");
    expect(date.zoneName).toBe("UTC"); // Check if the timezone is UTC
  });

  it("should create a Luxon DateTime in a specific timezone", () => {
    const timezone = "America/New_York";
    const date = adapter.date("2023-11-01", timezone);
    expect(date.isValid).toBe(true);
    expect(date.toISODate()).toBe("2023-11-01");
    expect(date.zoneName).toBe(timezone); // Check if the timezone is applied
  });

  it("SHOULD preserve the instant for ISO strings with explicit UTC offset", () => {
    const value = "2025-01-05T00:00:00.000Z";
    const date = adapter.date(value, "America/New_York");

    expect(date.toUTC().toISO()).toBe("2025-01-05T00:00:00.000Z");
    expect(date.toFormat("yyyy-MM-dd'T'HH:mm:ssZZ")).toBe(
      "2025-01-04T19:00:00-05:00",
    );
  });

  it("SHOULD preserve the instant for ISO strings with explicit numeric offsets", () => {
    const value = "2025-01-05T00:00:00.000+02:00";
    const date = adapter.date(value, "Europe/London");

    expect(date.toUTC().toISO()).toBe("2025-01-04T22:00:00.000Z");
    expect(date.toFormat("yyyy-MM-dd'T'HH:mm:ssZZ")).toBe(
      "2025-01-04T22:00:00+00:00",
    );
  });

  it("should handle invalid date strings", () => {
    const date = adapter.date("invalid-date", "system");
    expect(date.isValid).toBe(false);
  });

  it("should handle empty date strings", () => {
    const date = adapter.date("", "system");
    expect(date.isValid).toBe(false);
  });

  it("should handle default timezone when no timezone is specified", () => {
    const date = adapter.date("2023-11-01");
    expect(date.isValid).toBe(true);
    expect(date.toISODate()).toBe("2023-11-01");
  });

  it("SHOULD format a Luxon DateTime correctly", () => {
    const date = DateTime.fromISO("2023-11-01");
    const formattedDate = adapter.format(date, "DD MMM yyyy");
    expect(formattedDate).toBe("01 Nov 2023");
  });

  it("SHOULD parse a date string correctly", () => {
    const result = adapter.parse("01 Nov 2023", "DD MMM yyyy");
    expect(adapter.isValid(result.date)).toBe(true);
    expect(result.date.year).toBe(2023);
    expect(result.date.month).toBe(11); // Months are 1-indexed in Luxon
    expect(result.date.day).toBe(1);
  });

  it("SHOULD return an error for invalid date parsing", () => {
    const result = adapter.parse("invalid date", "DD MMM yyyy");
    expect(adapter.isValid(result.date)).toBe(false);
    expect(result.errors).toEqual([
      {
        message: "not a valid date",
        type: DateDetailError.INVALID_DATE,
      },
    ]);
  });

  it("SHOULD compare two Luxon DateTimes correctly", () => {
    const dateA = DateTime.fromISO("2023-11-01");
    const dateB = DateTime.fromISO("2023-11-02");
    expect(adapter.compare(dateA, dateB)).toBe(-1);
    expect(adapter.compare(dateB, dateA)).toBe(1);
    expect(adapter.compare(dateA, dateA)).toBe(0);
  });

  it("SHOULD add time to a Luxon DateTime correctly", () => {
    const date = DateTime.fromISO("2023-11-01");
    const newDate = adapter.add(date, { days: 5, months: 1 });
    expect(newDate.day).toBe(6);
    expect(newDate.month).toBe(12); // December
  });

  it("SHOULD subtract time from a Luxon DateTime correctly", () => {
    const date = DateTime.fromISO("2023-11-06");
    const newDate = adapter.subtract(date, { days: 5, months: 1 });
    expect(newDate.day).toBe(1);
    expect(newDate.month).toBe(10); // October
  });

  it("SHOULD set specific components of a Luxon DateTime", () => {
    const date = DateTime.fromISO("2023-11-01");
    const newDate = adapter.set(date, { day: 15, month: 12, year: 2025 });
    expect(newDate.day).toBe(15);
    expect(newDate.month).toBe(12); // December
    expect(newDate.year).toBe(2025);
  });

  it("SHOULD check if two Luxon DateTimes are the same day", () => {
    const dateA = DateTime.fromISO("2023-11-01");
    const dateB = DateTime.fromISO("2023-11-01T12:00:00"); // Same day, different time
    expect(adapter.isSame(dateA, dateB, "day")).toBe(true);
  });

  it("SHOULD get the start of a day", () => {
    const date = DateTime.fromISO("2023-11-01T12:30:00");
    const startOfDay = adapter.startOf(date, "day");
    expect(startOfDay.hour).toBe(0);
    expect(startOfDay.minute).toBe(0);
  });

  it("SHOULD get the end of a day", () => {
    const date = DateTime.fromISO("2023-11-01T12:30:00");
    const endOfDay = adapter.endOf(date, "day");
    expect(endOfDay.hour).toBe(23);
    expect(endOfDay.minute).toBe(59);
  });

  it("SHOULD return today's date at the start of the day", () => {
    const today = adapter.today();
    const now = DateTime.local();
    expect(today.year).toBe(now.year);
    expect(today.month).toBe(now.month);
    expect(today.day).toBe(now.day);
    expect(today.hour).toBe(0);
    expect(today.minute).toBe(0);
  });

  it("SHOULD return the current date and time", () => {
    const now = adapter.now();
    const current = DateTime.local();
    expect(now.year).toBe(current.year);
    expect(now.month).toBe(current.month);
    expect(now.day).toBe(current.day);
  });

  it("SHOULD get the name of the day of the week", () => {
    const dayName = adapter.getDayOfWeekName(3, "long");
    expect(dayName).toBe("Wednesday");
  });

  it("SHOULD get the day of the month", () => {
    const date = DateTime.fromISO("2023-11-15");
    expect(adapter.getDay(date)).toBe(15);
  });

  it("SHOULD get the month of the year", () => {
    const date = DateTime.fromISO("2023-11-15");
    expect(adapter.getMonth(date)).toBe(11); // November
  });

  it("SHOULD get the year", () => {
    const date = DateTime.fromISO("2023-11-15");
    expect(adapter.getYear(date)).toBe(2023);
  });

  it("SHOULD get the time components of a Luxon DateTime", () => {
    const date = DateTime.fromISO("2023-11-15T14:30:45.123");
    const timeFields = adapter.getTime(date);
    expect(timeFields.hour).toBe(14);
    expect(timeFields.minute).toBe(30);
    expect(timeFields.second).toBe(45);
    expect(timeFields.millisecond).toBe(123);
  });

  it("SHOULD clone a Luxon DateTime", () => {
    const date = DateTime.fromISO("2023-11-15");
    const clonedDate = adapter.clone(date);
    expect(clonedDate.equals(date)).toBe(true);
    expect(clonedDate).not.toBe(date); // Ensure it's a different instance
  });

  it("SHOULD clone a Luxon DateTime and preserve timezone", () => {
    const timezone = "America/New_York";
    const date = adapter.date("2023-11-01", timezone);
    const clonedDate = adapter.clone(date);
    expect(clonedDate.zoneName).toBe(timezone);
    expect(clonedDate.equals(date)).toBe(true);
    expect(clonedDate).not.toBe(date);
  });

  it("SHOULD clone a Luxon DateTime and preserve locale", () => {
    const frAdapter = new AdapterLuxon({ locale: "fr" });
    const date = frAdapter.date("2023-11-01", "system");
    const clonedDate = frAdapter.clone(date);

    // Month name differs by locale; this asserts the clone still formats using French.
    expect(frAdapter.format(clonedDate, "DD MMMM YYYY")).toBe(
      "01 novembre 2023",
    );
  });

  describe("getTimezone", () => {
    it("SHOULD return UTC for dates in UTC", () => {
      const date = adapter.date("2025-01-05T00:00:00.000Z", "UTC");
      expect(adapter.getTimezone(date)).toBe("UTC");
    });

    it("SHOULD return IANA timezone name for explicit timezone", () => {
      const date = adapter.date("2025-01-05", "America/New_York");
      const tz = adapter.getTimezone(date);
      expect(tz).toBe("America/New_York");
    });

    it("SHOULD return 'system' for system timezone", () => {
      const date = adapter.date("2025-01-05", "system");
      const tz = adapter.getTimezone(date);
      expect(tz).toBe("system");
    });

    it("SHOULD return 'system' for default timezone", () => {
      const date = adapter.date("2025-01-05", "default");
      const tz = adapter.getTimezone(date);
      expect(tz).toBe("system");
    });
  });

  describe("setTimezone", () => {
    it("SHOULD preserve wall-clock time when changing timezone", () => {
      const date = adapter.date("2025-01-05T12:30:00", "America/New_York");
      const changed = adapter.setTimezone(date, "Europe/London");

      // Wall-clock should remain 12:30
      expect(changed.toFormat("HH:mm")).toBe("12:30");
      expect(changed.toISODate()).toBe("2025-01-05");
    });

    it("SHOULD handle setTimezone with default timezone", () => {
      const date = adapter.date("2025-01-05T12:30:00", "America/New_York");
      const changed = adapter.setTimezone(date, "default");

      // Should resolve to system timezone and preserve wall-clock
      expect(changed.isValid).toBe(true);
      expect(changed.toFormat("HH:mm")).toBe("12:30");
    });

    it("SHOULD handle setTimezone to system timezone", () => {
      const date = adapter.date("2025-01-05T12:30:00", "America/New_York");
      const changed = adapter.setTimezone(date, "system");

      expect(changed.isValid).toBe(true);
    });

    it("SHOULD be idempotent when timezone is already set", () => {
      const date = adapter.date("2025-01-05T12:30:00", "America/New_York");
      const changed = adapter.setTimezone(date, "America/New_York");

      // Should return the same date since it's already in that timezone
      expect(adapter.compare(date, changed)).toBe(0);
    });
  });

  describe("clone", () => {
    it("SHOULD create an independent copy", () => {
      const date = adapter.date("2025-01-05T12:30:00", "America/New_York");
      const cloned = adapter.clone(date);

      expect(adapter.compare(date, cloned)).toBe(0);
      expect(date).not.toBe(cloned);
    });

    it("SHOULD preserve instant and timezone", () => {
      const date = adapter.date("2025-01-05T00:00:00.000Z", "America/New_York");
      const cloned = adapter.clone(date);

      expect(date.toUTC().toISO()).toBe(cloned.toUTC().toISO());
      expect(adapter.getTimezone(date)).toBe(adapter.getTimezone(cloned));
    });

    it("SHOULD preserve locale", () => {
      const adapterWithLocale = new AdapterLuxon({ locale: "fr" });
      const date = adapterWithLocale.date("2025-01-05");
      const cloned = adapterWithLocale.clone(date);

      // Both should format the same way
      expect(date.locale).toBe(cloned.locale);
    });
  });
});
