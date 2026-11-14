import { FormField, FormFieldLabel } from "@salt-ds/core";
import {
  DateInputRange,
  DateInputSingle,
  LocalizationProvider,
} from "@salt-ds/date-components";
import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AdapterDayjs } from "../../../../../date-adapters/src/dayjs-adapter";

function render(children: ReactNode) {
  return renderToString(
    <LocalizationProvider DateAdapter={AdapterDayjs}>
      {children}
    </LocalizationProvider>,
  );
}

function getInputs(markup: string) {
  return markup.match(/<input[^>]*>/g) ?? [];
}

describe("GIVEN date inputs rendered on the server", () => {
  it("THEN DateInputSingle keeps its fallback when the FormField has no label", () => {
    const markup = render(
      <FormField id="test-field">
        <DateInputSingle />
      </FormField>,
    );
    const [input] = getInputs(markup);

    expect(input).toContain('aria-label="date input"');
    expect(input).toContain('data-salt-aria-label-fallback="true"');
    expect(markup).not.toContain('id="label-test-field"');
  });

  it("THEN DateInputSingle keeps its fallback when an external label is absent", () => {
    const markup = render(<DateInputSingle aria-labelledby="external-label" />);
    const [input] = getInputs(markup);

    expect(input).toContain('aria-labelledby="external-label"');
    expect(input).toContain('aria-label="date input"');
  });

  it.each([
    <DateInputSingle key="root" aria-label="Trade date" />,
    <DateInputSingle
      key="input"
      aria-label="Other date"
      inputProps={{ "aria-label": "Trade date" }}
    />,
  ])(
    "THEN an explicit DateInputSingle label is not marked as a fallback",
    (input) => {
      const [inputMarkup] = getInputs(render(input));

      expect(inputMarkup).toContain('aria-label="Trade date"');
      expect(inputMarkup).not.toContain("data-salt-aria-label-fallback");
    },
  );

  it("THEN DateInputRange keeps its supplied name when the FormField has no label", () => {
    const markup = render(
      <FormField id="test-field">
        <DateInputRange aria-label="Trade period" />
      </FormField>,
    );
    const [startInput, endInput] = getInputs(markup);

    expect(startInput).toContain('aria-label="Start date Trade period"');
    expect(endInput).toContain('aria-label="End date Trade period"');
    expect(markup).toContain(">Start date Trade period</span>");
    expect(markup).toContain(">End date Trade period</span>");
    expect(markup).not.toContain('id="label-test-field"');
  });

  it("THEN DateInputRange keeps its supplied name when an external label is absent", () => {
    const markup = render(
      <DateInputRange
        aria-label="Trade period"
        aria-labelledby="external-label"
      />,
    );
    const [startInput, endInput] = getInputs(markup);

    expect(startInput).toContain('aria-label="Start date Trade period"');
    expect(endInput).toContain('aria-label="End date Trade period"');
    expect(markup).toContain(">Start date Trade period</span>");
    expect(markup).toContain(">End date Trade period</span>");
  });

  it("THEN DateInputRange preserves a nested visible label and its fallback before hydration", () => {
    function WrappedLabel() {
      return <FormFieldLabel>Booking period</FormFieldLabel>;
    }

    const markup = render(
      <FormField id="test-field">
        <WrappedLabel />
        <DateInputRange aria-label="Trade period" />
      </FormField>,
    );

    expect(markup).toMatch(/<label[^>]*id="label-test-field"/);
    for (const input of getInputs(markup)) {
      expect(input).toContain('aria-labelledby="label-test-field ');
    }
    expect(markup).toContain(">Start date Trade period</span>");
    expect(markup).toContain(">End date Trade period</span>");
  });

  it("THEN DateInputRange preserves explicit input names and IDs", () => {
    const markup = render(
      <FormField id="test-field">
        <FormFieldLabel>Booking period</FormFieldLabel>
        <DateInputRange
          aria-label="Trade period"
          startInputProps={{ id: "check-in", "aria-label": "Check-in" }}
          endInputProps={{ id: "check-out", "aria-label": "Check-out" }}
        />
      </FormField>,
    );
    const [startInput, endInput] = getInputs(markup);

    expect(startInput).toContain('id="check-in"');
    expect(startInput).toContain('aria-label="Check-in"');
    expect(endInput).toContain('id="check-out"');
    expect(endInput).toContain('aria-label="Check-out"');
    expect(markup).toContain(">Check-in</span>");
    expect(markup).toContain(">Check-out</span>");
  });
});
