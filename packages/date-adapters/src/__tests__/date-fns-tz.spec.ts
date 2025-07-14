import { TZDate } from "@date-fns/tz";
import { enUS } from "date-fns/locale";
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

  it("SHOULD clone a TZDate", () => {
    const date = new TZDate("2023-11-01T00:00:00Z");
    const clonedDate = adapter.clone(date);
    expect(clonedDate).toEqual(date);
    expect(clonedDate).not.toBe(date);
  });
});
