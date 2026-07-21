import { TZDate } from "@date-fns/tz";
import { enUS, fr } from "date-fns/locale";
import { describe, expect, it } from "vitest";
import { AdapterDateFnsTZ } from "../date-fns-tz-adapter";

describe("GIVEN an AdapterDateFnsTZ", () => {
  const adapter = new AdapterDateFnsTZ({ locale: enUS });

  it("SHOULD create a valid TZDate from a string", () => {
    const date = adapter.date("2023-11-01");
    expect(adapter.isValid(date)).toBe(true);
    expect(date.getFullYear()).toBe(2023);
    expect(date.getMonth()).toBe(10); // Months are 0-indexed
    expect(date.getDate()).toBe(1);
  });

  it("SHOULD return an invalid TZDate for an invalid string", () => {
    const date = adapter.date("invalid date");
    expect(adapter.isValid(date)).toBe(false);
  });

  it("SHOULD get the current date at the start of the day", () => {
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

  it("SHOULD get the current date and time", () => {
    const now = adapter.now();
    const current = new Date();
    expect(now.getFullYear()).toBe(current.getFullYear());
    expect(now.getMonth()).toBe(current.getMonth());
    expect(now.getDate()).toBe(current.getDate());
  });

  it("SHOULD get the timezone of a TZDate", () => {
    const date = new TZDate("2023-11-01T00:00:00Z");
    const timezone = adapter.getTimezone(date);
    expect(timezone).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone);
  });

  it("SHOULD set the timezone of a date", () => {
    const date = new Date(2023, 10, 1);
    const tzDate = adapter.setTimezone(date, "America/New_York");
    expect(adapter.getTimezone(tzDate)).toBe("America/New_York");
    expect(tzDate.getHours()).toBe(0);
    expect(tzDate.getMinutes()).toBe(0);
    expect(tzDate.getSeconds()).toBe(0);
    expect(tzDate.getMilliseconds()).toBe(0);
  });

  it("SHOULD preserve the instant for ISO strings with explicit UTC offset", () => {
    const value = "2025-01-05T00:00:00.000Z";
    const tzDate = adapter.date(value, "America/New_York");

    expect(tzDate.getTime()).toBe(new Date(value).getTime());
    expect(tzDate.toISOString()).toContain("2025-01-04T19:00:00.000-05:00");
  });

  it("SHOULD preserve the instant for ISO strings with explicit numeric offsets", () => {
    const value = "2025-01-05T00:00:00.000+02:00";
    const tzDate = adapter.date(value, "Europe/London");

    expect(tzDate.getTime()).toBe(new Date(value).getTime());
    expect(tzDate.toISOString()).toContain("2025-01-04T22:00:00.000+00:00");
  });

  it("SHOULD clone a TZDate", () => {
    const date = new TZDate("2023-11-01T00:00:00Z", "America/New_York");
    const clonedDate = adapter.clone(date);
    expect(clonedDate).toEqual(date);
    expect(clonedDate).not.toBe(date);
    expect(adapter.getTimezone(clonedDate)).toBe("America/New_York");
  });

  it("SHOULD clone a TZDate and preserve locale formatting", () => {
    const frAdapter = new AdapterDateFnsTZ({ locale: fr });
    // Use local date components to avoid UTC->timezone conversion shifting the day.
    // (00:00Z is previous day in America/New_York.)
    const date = new TZDate(2023, 10, 1, "America/New_York");
    const clonedDate = frAdapter.clone(date);

    // For date-fns-tz the locale is held by the adapter, not the TZDate instance.
    expect(frAdapter.format(clonedDate, "DD MMMM YYYY")).toBe(
      "01 novembre 2023",
    );
  });

  describe("getTimezone", () => {
    it("SHOULD return the timezone string for a TZDate", () => {
      const date = new TZDate("2023-11-01T00:00:00Z", "America/New_York");
      expect(adapter.getTimezone(date)).toBe("America/New_York");
    });

    it("SHOULD return system timezone for default TZDate", () => {
      const date = new TZDate("2023-11-01T00:00:00Z");
      const tz = adapter.getTimezone(date);
      expect(typeof tz).toBe("string");
      expect(tz.length).toBeGreaterThan(0);
    });
  });

  describe("setTimezone", () => {
    it("SHOULD preserve wall-clock time when changing timezone", () => {
      const date = new TZDate(2023, 10, 1, 12, 30, 0, 0, "America/New_York");
      const changed = adapter.setTimezone(date, "Europe/London");

      // Wall-clock should remain 12:30
      expect(changed.getHours()).toBe(12);
      expect(changed.getMinutes()).toBe(30);
      expect(changed.getDate()).toBe(1);
    });

    it("SHOULD handle setTimezone with default timezone", () => {
      const date = new TZDate(2023, 10, 1, 12, 30, 0, 0, "America/New_York");
      const changed = adapter.setTimezone(date, "default");

      expect(adapter.isValid(changed)).toBe(true);
      expect(changed.getHours()).toBe(12);
      expect(changed.getMinutes()).toBe(30);
    });

    it("SHOULD be idempotent when timezone is already set", () => {
      const date = new TZDate(2023, 10, 1, 12, 30, 0, 0, "America/New_York");
      const changed = adapter.setTimezone(date, "America/New_York");

      expect(adapter.compare(date, changed)).toBe(0);
    });
  });

  describe("clone", () => {
    it("SHOULD create an independent copy with same instant", () => {
      const date = new TZDate("2023-11-01T12:30:00.000Z", "America/New_York");
      const cloned = adapter.clone(date);

      expect(adapter.compare(date, cloned)).toBe(0);
      expect(date !== cloned).toBe(true);
    });

    it("SHOULD preserve instant and timezone", () => {
      const date = new TZDate("2023-11-01T00:00:00.000Z", "America/New_York");
      const cloned = adapter.clone(date);

      expect(date.getTime()).toBe(cloned.getTime());
      expect(adapter.getTimezone(date)).toBe(adapter.getTimezone(cloned));
    });
  });
});
