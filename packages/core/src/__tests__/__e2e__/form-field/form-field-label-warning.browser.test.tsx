import { FormField, FormFieldLabel, Input } from "@salt-ds/core";
import { describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";

describe("GIVEN a FormFieldLabel with a text alternative", () => {
  it("does not warn when the label's aria-label retains the control's name", async () => {
    const consoleSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    try {
      await renderWithSalt(
        <FormField>
          <FormFieldLabel aria-label="Work email address">
            Email address
          </FormFieldLabel>
          <Input aria-label="Work email address" />
        </FormField>,
      );

      await expect
        .element(page.getByRole("textbox"))
        .toHaveAccessibleName("Work email address");
      expect(
        consoleSpy.mock.calls.filter(([message]) =>
          String(message).includes("is ignored because FormFieldLabel"),
        ),
      ).toHaveLength(0);
    } finally {
      consoleSpy.mockRestore();
    }
  });

  it("does not warn when an image's alt retains the control's name", async () => {
    const consoleSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    try {
      await renderWithSalt(
        <FormField>
          <FormFieldLabel>
            <img alt="Work" /> email address
          </FormFieldLabel>
          <Input aria-label="Work email address" />
        </FormField>,
      );

      await expect
        .element(page.getByRole("textbox"))
        .toHaveAccessibleName("Work email address");
      expect(
        consoleSpy.mock.calls.filter(([message]) =>
          String(message).includes("is ignored because FormFieldLabel"),
        ),
      ).toHaveLength(0);
    } finally {
      consoleSpy.mockRestore();
    }
  });

  it("warns when matching text is hidden from the accessible name", async () => {
    const consoleSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    try {
      await renderWithSalt(
        <FormField>
          <FormFieldLabel>
            <span aria-hidden="true">Address </span>Postcode
          </FormFieldLabel>
          <Input aria-label="Address" />
        </FormField>,
      );

      await expect
        .element(page.getByRole("textbox"))
        .toHaveAccessibleName("Postcode");
      expect(
        consoleSpy.mock.calls.filter(([message]) =>
          String(message).startsWith('Salt: aria-label "Address" is ignored'),
        ),
      ).toHaveLength(1);
    } finally {
      consoleSpy.mockRestore();
    }
  });

  it("uses the text alternative of additional aria-labelledby references", async () => {
    const consoleSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    try {
      await renderWithSalt(
        <>
          <span id="additional-label" role="img" aria-label="Work account">
            Work
          </span>
          <FormField>
            <FormFieldLabel>Email address</FormFieldLabel>
            <Input
              aria-label="Work account"
              aria-labelledby="additional-label"
            />
          </FormField>
        </>,
      );

      await expect
        .element(page.getByRole("textbox"))
        .toHaveAccessibleName("Email address Work account");
      expect(
        consoleSpy.mock.calls.filter(([message]) =>
          String(message).includes("is ignored because FormFieldLabel"),
        ),
      ).toHaveLength(0);
    } finally {
      consoleSpy.mockRestore();
    }
  });

  it("does not warn for controls inside a hidden panel", async () => {
    const consoleSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    try {
      await renderWithSalt(
        <div hidden>
          <FormField>
            <FormFieldLabel>Email address</FormFieldLabel>
            <Input aria-label="Email address" />
          </FormField>
        </div>,
      );

      expect(document.querySelector("input")).toBeInTheDocument();
      expect(
        consoleSpy.mock.calls.filter(([message]) =>
          String(message).includes("is ignored because FormFieldLabel"),
        ),
      ).toHaveLength(0);
    } finally {
      consoleSpy.mockRestore();
    }
  });

  it("still warns for disabled controls whose aria-label is ignored", async () => {
    const consoleSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    try {
      await renderWithSalt(
        <FormField disabled>
          <FormFieldLabel>Email address</FormFieldLabel>
          <Input aria-label="Work account" />
        </FormField>,
      );

      const input = page.getByRole("textbox");
      await expect.element(input).toBeDisabled();
      await expect.element(input).toHaveAccessibleName("Email address");
      expect(
        consoleSpy.mock.calls.filter(([message]) =>
          String(message).startsWith(
            'Salt: aria-label "Work account" is ignored',
          ),
        ),
      ).toHaveLength(1);
    } finally {
      consoleSpy.mockRestore();
    }
  });

  it("ignores marked generated fallbacks while checking identical consumer labels", async () => {
    const consoleSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    try {
      await renderWithSalt(
        <>
          <FormField id="generated-fallback">
            <FormFieldLabel>Trade date</FormFieldLabel>
            <input
              aria-label="date input"
              aria-labelledby="label-generated-fallback"
              data-salt-aria-label-fallback
            />
          </FormField>
          <FormField id="consumer-label">
            <FormFieldLabel>Trade date</FormFieldLabel>
            <input
              id="consumer-date-input"
              aria-label="date input"
              aria-labelledby="label-consumer-label"
            />
          </FormField>
        </>,
      );

      for (const input of await page.getByRole("textbox").all()) {
        await expect.element(input).toHaveAccessibleName("Trade date");
      }
      const warnings = consoleSpy.mock.calls.filter(([message]) =>
        String(message).startsWith('Salt: aria-label "date input" is ignored'),
      );
      expect(warnings).toHaveLength(1);
      expect(warnings[0][1]).toBe(
        document.getElementById("consumer-date-input"),
      );
    } finally {
      consoleSpy.mockRestore();
    }
  });
});
