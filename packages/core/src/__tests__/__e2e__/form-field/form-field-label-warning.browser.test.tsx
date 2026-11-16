import { FormField, FormFieldLabel, Input } from "@salt-ds/core";
import { type ReactNode, useState } from "react";
import { createPortal } from "react-dom";
import { describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";

function ShadowHost({ children }: { children: ReactNode }) {
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);
  return (
    <div
      ref={(element) => {
        if (element && !element.shadowRoot) {
          setShadowRoot(element.attachShadow({ mode: "open" }));
        }
      }}
    >
      {shadowRoot && createPortal(children, shadowRoot)}
    </div>
  );
}

function ignoredWarnings(
  consoleSpy: { mock: { calls: unknown[][] } },
  ariaLabel: string,
) {
  return consoleSpy.mock.calls.filter(([message]) =>
    String(message).startsWith(`Salt: aria-label "${ariaLabel}" is ignored`),
  );
}

describe("GIVEN a FormFieldLabel in a shadow root", () => {
  it("warns when a control's aria-label is ignored", async () => {
    const consoleSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    try {
      await renderWithSalt(
        <ShadowHost>
          <FormField>
            <FormFieldLabel>Email address</FormFieldLabel>
            <Input aria-label="Work account" />
          </FormField>
        </ShadowHost>,
      );

      await vi.waitFor(() =>
        expect(ignoredWarnings(consoleSpy, "Work account")).toHaveLength(1),
      );
    } finally {
      consoleSpy.mockRestore();
    }
  });
});

describe("GIVEN a FormFieldLabel that re-renders", () => {
  it("checks a control again when its label text changes", async () => {
    const consoleSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    try {
      const content = (label: string) => (
        <FormField>
          <FormFieldLabel>{label}</FormFieldLabel>
          <Input aria-label="Email" />
        </FormField>
      );
      const { rerender } = await renderWithSalt(content("Work email address"));
      await expect
        .element(page.getByRole("textbox"))
        .toHaveAccessibleName("Work email address");
      expect(ignoredWarnings(consoleSpy, "Email")).toHaveLength(0);

      await rerender(content("Phone number"));
      await expect
        .element(page.getByRole("textbox"))
        .toHaveAccessibleName("Phone number");
      await vi.waitFor(() =>
        expect(ignoredWarnings(consoleSpy, "Email")).toHaveLength(1),
      );
    } finally {
      consoleSpy.mockRestore();
    }
  });

  it("checks a hidden control once it's shown", async () => {
    const consoleSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    try {
      const content = (hidden: boolean) => (
        <div hidden={hidden}>
          <FormField>
            <FormFieldLabel>Email address</FormFieldLabel>
            <Input aria-label="Work account" />
          </FormField>
        </div>
      );
      const { rerender } = await renderWithSalt(content(true));
      expect(document.querySelector("input")).toBeInTheDocument();
      expect(ignoredWarnings(consoleSpy, "Work account")).toHaveLength(0);

      await rerender(content(false));
      await vi.waitFor(() =>
        expect(ignoredWarnings(consoleSpy, "Work account")).toHaveLength(1),
      );
    } finally {
      consoleSpy.mockRestore();
    }
  });
});

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
