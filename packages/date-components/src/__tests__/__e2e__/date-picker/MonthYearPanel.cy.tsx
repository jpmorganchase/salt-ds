import type { ParserResult } from "@salt-ds/date-adapters";
import { AdapterDateFns } from "@salt-ds/date-adapters/date-fns";
import {
  DateParserField,
  DatePicker,
  DatePickerOverlay,
  DatePickerRangeInput,
  DatePickerSingleInput,
  DatePickerTrigger,
  LocalizationProvider,
  MonthYearRangePanel,
  MonthYearSinglePanel,
} from "@salt-ds/date-components";

const adapter = new AdapterDateFns();

const MONTH_YEAR_FORMATS = [
  "MMMM YYYY",
  "MMM YYYY",
  "MM/YYYY",
  "MM YYYY",
  "M/YYYY",
  "M YYYY",
];

function parseMonthYear(inputDate: string, format: string): ParserResult<Date> {
  const value = (inputDate ?? "").trim();
  if (!value.length) {
    return adapter.parse("", format);
  }
  for (const candidate of [format, ...MONTH_YEAR_FORMATS]) {
    const result = adapter.parse(value, candidate);
    if (result?.date && adapter.isValid(result.date as Date)) {
      return {
        ...result,
        date: adapter.startOf(result.date as Date, "month"),
        value,
      };
    }
  }
  return adapter.parse(value, format);
}

function parseMonthYearRange(
  inputDate: string,
  field: DateParserField,
  format: string,
): ParserResult<Date> {
  const result = parseMonthYear(inputDate, format);
  if (!result?.date || !adapter.isValid(result.date as Date)) {
    return result;
  }
  const normalised =
    field === DateParserField.END
      ? adapter.endOf(result.date as Date, "month")
      : adapter.startOf(result.date as Date, "month");
  return { ...result, date: normalised };
}

function SingleFixture(props: {
  defaultSelectedDate?: Date;
  minDate?: Date;
  maxDate?: Date;
}) {
  return (
    <LocalizationProvider DateAdapter={AdapterDateFns}>
      <DatePicker
        selectionVariant="single"
        defaultSelectedDate={props.defaultSelectedDate}
        minDate={props.minDate}
        maxDate={props.maxDate}
      >
        <DatePickerTrigger>
          <DatePickerSingleInput format="MMMM YYYY" parse={parseMonthYear} />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <MonthYearSinglePanel />
        </DatePickerOverlay>
      </DatePicker>
    </LocalizationProvider>
  );
}

function RangeFixture(props: {
  defaultSelectedDate?: { startDate: Date | null; endDate: Date | null };
}) {
  return (
    <LocalizationProvider DateAdapter={AdapterDateFns}>
      <DatePicker
        selectionVariant="range"
        defaultSelectedDate={props.defaultSelectedDate}
      >
        <DatePickerTrigger>
          <DatePickerRangeInput
            format="MMMM YYYY"
            parse={parseMonthYearRange}
          />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <MonthYearRangePanel />
        </DatePickerOverlay>
      </DatePicker>
    </LocalizationProvider>
  );
}

describe("GIVEN a MonthYearSinglePanel", () => {
  beforeEach(() => {
    cy.clock(new Date(2026, 6, 17), ["Date"]);
  });
  afterEach(() => {
    cy.clock().then((clock) => clock.restore());
  });

  it("SHOULD open with correct ARIA structure and initial focus on selected month", () => {
    cy.mount(<SingleFixture defaultSelectedDate={new Date(2026, 2, 1)} />);
    cy.findByRole("button", { name: "Open Calendar" }).click();
    cy.findByRole("grid").should("have.attr", "aria-rowcount", "4");
    cy.findByRole("grid").should("have.attr", "aria-colcount", "3");
    cy.findByRole("button", { name: "March 2026" })
      .should("have.attr", "aria-pressed", "true")
      .and("have.focus");
  });

  it("SHOULD focus January when no date is selected", () => {
    cy.mount(<SingleFixture />);
    cy.findByRole("button", { name: "Open Calendar" }).realClick();
    cy.findByRole("button", { name: "January 2026" }).should("have.focus");
  });

  it("SHOULD roll over year when arrow keys move past a boundary", () => {
    cy.mount(<SingleFixture defaultSelectedDate={new Date(2026, 10, 1)} />);
    cy.findByRole("button", { name: "Open Calendar" }).realClick();
    // Nov 2026 focused → ArrowDown → Feb 2027
    cy.realPress("ArrowDown");
    cy.findByRole("button", { name: "February 2027" }).should("have.focus");
    // ArrowRight on Dec 2027 → Jan 2028
    cy.realPress("End");
    cy.realPress("ArrowRight");
    cy.findByRole("button", { name: "January 2028" }).should("have.focus");
  });

  it("SHOULD disable months outside min/max range", () => {
    cy.mount(
      <SingleFixture
        minDate={new Date(2026, 3, 1)}
        maxDate={new Date(2026, 8, 30)}
      />,
    );
    cy.findByRole("button", { name: "Open Calendar" }).realClick();
    // Unselectable months use aria-disabled (not the native `disabled`
    // attribute) so they remain focusable via arrow-key navigation.
    cy.findByRole("button", { name: /^March 2026/ }).should(
      "have.attr",
      "aria-disabled",
      "true",
    );
    cy.findByRole("button", { name: /^April 2026/ }).should(
      "not.have.attr",
      "aria-disabled",
    );
    cy.findByRole("button", { name: /^September 2026/ }).should(
      "not.have.attr",
      "aria-disabled",
    );
    cy.findByRole("button", { name: /^October 2026/ }).should(
      "have.attr",
      "aria-disabled",
      "true",
    );
  });

  it("SHOULD allow keyboard focus to move onto a disabled month", () => {
    cy.mount(
      <SingleFixture
        defaultSelectedDate={new Date(2026, 3, 1)}
        minDate={new Date(2026, 3, 1)}
        maxDate={new Date(2026, 8, 30)}
      />,
    );
    cy.findByRole("button", { name: "Open Calendar" }).click();
    // April 2026 (first allowed month) starts focused. ArrowLeft should
    // move to the disabled March 2026 rather than being blocked.
    cy.realPress("ArrowLeft");
    cy.findByRole("button", { name: /^March 2026/ })
      .should("have.attr", "aria-disabled", "true")
      .and("have.focus");
  });

  it("SHOULD return focus to the input after Escape", () => {
    cy.mount(<SingleFixture />);
    // Open via the input so Escape returns focus back to it.
    cy.findByRole("textbox").click().type("{downArrow}", { force: true });
    cy.realPress("Escape");
    cy.findByRole("textbox").should("have.focus");
  });

  it("SHOULD sync visible year when the input value changes", () => {
    cy.mount(<SingleFixture />);
    cy.findByRole("textbox").realClick().realType("April 2030{enter}");
    cy.findByRole("button", { name: "Open Calendar" }).realClick();
    cy.findByRole("button", { name: "April 2030" }).should(
      "have.attr",
      "aria-pressed",
      "true",
    );
  });
});

describe("GIVEN a MonthYearRangePanel", () => {
  beforeEach(() => {
    cy.clock(new Date(2026, 6, 17), ["Date"]);
  });
  afterEach(() => {
    cy.clock().then((clock) => clock.restore());
  });

  it("SHOULD render two independent grids labelled start and end", () => {
    cy.mount(<RangeFixture />);
    cy.findAllByRole("button", { name: "Open Calendar" }).first().realClick();
    cy.findByRole("grid", { name: /^Start month/ }).should("exist");
    cy.findByRole("grid", { name: /^End month/ }).should("exist");
  });

  it("SHOULD set the start date when nothing is selected and any month is clicked", () => {
    cy.mount(<RangeFixture />);
    cy.findAllByRole("button", { name: "Open Calendar" }).first().realClick();
    cy.findByRole("grid", { name: /^Start month/ })
      .findByRole("button", { name: "March 2026" })
      .realClick();
    // Overlay stays open until end date is selected; aria-modal hides the
    // outer inputs from the a11y tree, so query them via CSS.
    cy.get("input.saltDateInput-input")
      .first()
      .should("have.value", "March 2026");
    cy.get("input.saltDateInput-input").last().should("have.value", "");
  });

  it("SHOULD set the start date when the first click lands in the end grid", () => {
    cy.mount(<RangeFixture />);
    cy.findAllByRole("button", { name: "Open Calendar" }).first().realClick();
    // No dates set yet, so a click in either grid becomes the new start.
    cy.findByRole("grid", { name: /^End month/ })
      .findByRole("button", { name: "September 2027" })
      .realClick();
    cy.get("input.saltDateInput-input")
      .first()
      .should("have.value", "September 2027");
    cy.get("input.saltDateInput-input").last().should("have.value", "");
  });

  it("SHOULD complete the range when start is set and a later month is clicked", () => {
    cy.mount(<RangeFixture />);
    cy.findAllByRole("button", { name: "Open Calendar" }).first().realClick();
    cy.findByRole("grid", { name: /^Start month/ })
      .findByRole("button", { name: "March 2026" })
      .realClick();
    cy.findByRole("grid", { name: /^End month/ })
      .findByRole("button", { name: "September 2027" })
      .realClick();
    // Overlay auto-closes on complete range — inputs return to the a11y tree.
    cy.findAllByRole("textbox")
      .first()
      .should("have.value", "March 2026");
    cy.findAllByRole("textbox")
      .last()
      .should("have.value", "September 2027");
  });

  it("SHOULD replace the start date when an earlier month is clicked with only start set", () => {
    cy.mount(<RangeFixture />);
    cy.findAllByRole("button", { name: "Open Calendar" }).first().realClick();
    // Pin start at June 2026, then click an earlier month; the pick becomes
    // the new start rather than an invalid end < start.
    cy.findByRole("grid", { name: /^Start month/ })
      .findByRole("button", { name: "June 2026" })
      .realClick();
    cy.findByRole("grid", { name: /^Start month/ })
      .findByRole("button", { name: "February 2026" })
      .realClick();
    cy.get("input.saltDateInput-input")
      .first()
      .should("have.value", "February 2026");
    cy.get("input.saltDateInput-input").last().should("have.value", "");
  });

  it("SHOULD start a new range when clicking after both endpoints are set", () => {
    cy.mount(
      <RangeFixture
        defaultSelectedDate={{
          startDate: new Date(2026, 2, 1),
          endDate: new Date(2026, 8, 30),
        }}
      />,
    );
    cy.findAllByRole("button", { name: "Open Calendar" }).first().realClick();
    cy.findByRole("grid", { name: /^Start month/ })
      .findByRole("button", { name: "November 2026" })
      .realClick();
    cy.get("input.saltDateInput-input")
      .first()
      .should("have.value", "November 2026");
    cy.get("input.saltDateInput-input").last().should("have.value", "");
  });

  it("SHOULD allow the start and end to sit in the same year", () => {
    cy.mount(<RangeFixture />);
    cy.findAllByRole("button", { name: "Open Calendar" }).first().realClick();
    // The two grids are kept on consecutive years, but selection is
    // independent of visible-year layout — clicking two months in the
    // same start grid produces a same-year range.
    cy.findByRole("grid", { name: /^Start month/ })
      .findByRole("button", { name: "March 2026" })
      .realClick();
    cy.findByRole("grid", { name: /^Start month/ })
      .findByRole("button", { name: "September 2026" })
      .realClick();
    cy.findAllByRole("textbox")
      .first()
      .should("have.value", "March 2026");
    cy.findAllByRole("textbox")
      .last()
      .should("have.value", "September 2026");
  });

  it("SHOULD keep the two grids on consecutive years when the range fits in a single year", () => {
    cy.mount(
      <RangeFixture
        defaultSelectedDate={{
          startDate: new Date(2026, 2, 1),
          endDate: new Date(2026, 8, 30),
        }}
      />,
    );
    cy.findAllByRole("button", { name: "Open Calendar" }).first().realClick();
    // Start grid anchors on the year that contains both endpoints; the
    // end grid is shifted forward so no two grids ever display the same
    // year, regardless of where the range happens to fall.
    cy.findAllByRole("combobox", { name: "Year Dropdown" })
      .first()
      .should("have.text", "2026");
    cy.findAllByRole("combobox", { name: "Year Dropdown" })
      .last()
      .should("have.text", "2027");
  });

  it("SHOULD NOT re-anchor visible years when selecting a month already visible in a grid", () => {
    cy.mount(<RangeFixture />);
    cy.findAllByRole("button", { name: "Open Calendar" }).first().realClick();
    // Both grids default to 2026 / 2027. A click in the end grid should
    // only set the selection — it must not shift the start grid to the
    // clicked year nor push the end grid to the following year.
    cy.findByRole("grid", { name: /^End month/ })
      .findByRole("button", { name: "September 2027" })
      .realClick();
    cy.findAllByRole("combobox", { name: "Year Dropdown" })
      .first()
      .should("have.text", "2026");
    cy.findAllByRole("combobox", { name: "Year Dropdown" })
      .last()
      .should("have.text", "2027");
    // The selection is still anchored on September 2027 (Calendar-style
    // first-click semantics: the initial pick becomes the start date).
    cy.get("input.saltDateInput-input")
      .first()
      .should("have.value", "September 2027");
  });

  it("SHOULD highlight months between the start and end of the selected range", () => {
    cy.mount(
      <RangeFixture
        defaultSelectedDate={{
          startDate: new Date(2026, 2, 1),
          endDate: new Date(2027, 8, 30),
        }}
      />,
    );
    cy.findAllByRole("button", { name: "Open Calendar" }).first().realClick();
    // Start marker (March 2026) on the left grid.
    cy.findByRole("grid", { name: /^Start month/ })
      .findByRole("button", { name: "March 2026" })
      .should("have.class", "saltCalendarDay-selectedStart");
    // Months later in 2026 form the in-between span.
    cy.findByRole("grid", { name: /^Start month/ })
      .findByRole("button", { name: "June 2026" })
      .should("have.class", "saltCalendarDay-selectedSpan");
    // Months earlier in 2027 (right grid) are also in-between.
    cy.findByRole("grid", { name: /^End month/ })
      .findByRole("button", { name: "March 2027" })
      .should("have.class", "saltCalendarDay-selectedSpan");
    // End marker (September 2027) on the right grid.
    cy.findByRole("grid", { name: /^End month/ })
      .findByRole("button", { name: "September 2027" })
      .should("have.class", "saltCalendarDay-selectedEnd");
    // A month before start is not part of the range.
    cy.findByRole("grid", { name: /^Start month/ })
      .findByRole("button", { name: "January 2026" })
      .should("not.have.class", "saltCalendarDay-selectedSpan")
      .and("not.have.class", "saltCalendarDay-selectedStart")
      .and("not.have.class", "saltCalendarDay-selectedEnd");
  });

  it("SHOULD preview the range on hover while only the start is committed", () => {
    cy.mount(
      <RangeFixture
        defaultSelectedDate={{
          startDate: new Date(2026, 2, 1),
          endDate: null,
        }}
      />,
    );
    cy.findAllByRole("button", { name: "Open Calendar" }).first().realClick();
    // Hover a later month in the start grid → preview span builds towards it.
    cy.findByRole("grid", { name: /^Start month/ })
      .findByRole("button", { name: "June 2026" })
      .realHover();
    cy.findByRole("grid", { name: /^Start month/ })
      .findByRole("button", { name: "April 2026" })
      .should("have.class", "saltCalendarDay-hoveredSpan");
    cy.findByRole("grid", { name: /^Start month/ })
      .findByRole("button", { name: "June 2026" })
      .should("have.class", "saltCalendarDay-hoveredEnd");
    // Moving the pointer off the grid clears the preview.
    cy.findByRole("grid", { name: /^End month/ }).realHover();
    cy.findByRole("grid", { name: /^Start month/ })
      .findByRole("button", { name: "April 2026" })
      .should("not.have.class", "saltCalendarDay-hoveredSpan");
  });

  it("SHOULD preview the range as the user arrows across months with the keyboard", () => {
    cy.mount(
      <RangeFixture
        defaultSelectedDate={{
          startDate: new Date(2026, 2, 1),
          endDate: null,
        }}
      />,
    );
    cy.findAllByRole("button", { name: "Open Calendar" }).first().realClick();
    // Overlay opens with keyboard focus on the start month (March 2026).
    // Arrow through three months to June 2026.
    cy.realPress("ArrowRight");
    cy.realPress("ArrowRight");
    cy.realPress("ArrowRight");
    cy.findByRole("grid", { name: /^Start month/ })
      .findByRole("button", { name: "June 2026" })
      .should("have.focus")
      .and("have.class", "saltCalendarDay-hoveredEnd");
    cy.findByRole("grid", { name: /^Start month/ })
      .findByRole("button", { name: "April 2026" })
      .should("have.class", "saltCalendarDay-hoveredSpan");
    cy.findByRole("grid", { name: /^Start month/ })
      .findByRole("button", { name: "May 2026" })
      .should("have.class", "saltCalendarDay-hoveredSpan");
  });

  it("SHOULD hand keyboard focus to the end grid when moving past December of the start grid", () => {
    cy.mount(<RangeFixture />);
    cy.findAllByRole("button", { name: "Open Calendar" }).first().realClick();
    // Focus starts on January 2026 (start grid). Jump to December 2026,
    // then ArrowRight — focus should land on January 2027 in the end grid
    // rather than advancing the start grid's visible year.
    cy.realPress("End");
    cy.findByRole("grid", { name: /^Start month/ })
      .findByRole("button", { name: "December 2026" })
      .should("have.focus");
    cy.realPress("ArrowRight");
    cy.findByRole("grid", { name: /^End month/ })
      .findByRole("button", { name: "January 2027" })
      .should("have.focus");
    // The start grid is still on 2026 — no year rollover happened.
    cy.findAllByRole("combobox", { name: "Year Dropdown" })
      .first()
      .should("have.text", "2026");
  });

  it("SHOULD hand keyboard focus back to the start grid when moving before January of the end grid", () => {
    cy.mount(<RangeFixture />);
    cy.findAllByRole("button", { name: "Open Calendar" }).first().realClick();
    // Move focus onto January of the end grid without committing a
    // selection (the end grid's initial focusable button is January).
    cy.findByRole("grid", { name: /^End month/ })
      .findByRole("button", { name: "January 2027" })
      .focus();
    cy.realPress("ArrowLeft");
    cy.findByRole("grid", { name: /^Start month/ })
      .findByRole("button", { name: "December 2026" })
      .should("have.focus");
    // The end grid is still on 2027 — no year rollover happened.
    cy.findAllByRole("combobox", { name: "Year Dropdown" })
      .last()
      .should("have.text", "2027");
  });

  it("SHOULD still roll over the year on the last calendar when moving forward past its December", () => {
    cy.mount(<RangeFixture />);
    cy.findAllByRole("button", { name: "Open Calendar" }).first().realClick();
    // Focus December on the end grid, then ArrowRight — the end grid
    // (the last visible calendar) legitimately rolls its own year over.
    cy.findByRole("grid", { name: /^End month/ })
      .findByRole("button", { name: "December 2027" })
      .focus();
    cy.realPress("ArrowRight");
    cy.findByRole("grid", { name: /^End month/ })
      .findByRole("button", { name: "January 2028" })
      .should("have.focus");
    cy.findAllByRole("combobox", { name: "Year Dropdown" })
      .last()
      .should("have.text", "2028");
  });

  it("SHOULD advance the start grid year past December when the two grids show non-consecutive years", () => {
    cy.mount(<RangeFixture />);
    cy.findAllByRole("button", { name: "Open Calendar" }).first().realClick();
    // Fast-forward the end grid to 2035 via the year dropdown so the two
    // grids display 2026 / 2035 (non-consecutive).
    cy.findAllByRole("combobox", { name: "Year Dropdown" }).last().click();
    cy.findAllByRole("option", { name: "2035" }).last().click();
    cy.findAllByRole("combobox", { name: "Year Dropdown" })
      .last()
      .should("have.text", "2035");
    // Focus December of the start grid and arrow forward. Since the end
    // grid is not on 2027 (the year immediately after the start grid),
    // focus should stay in the start grid and its year should advance.
    cy.findByRole("grid", { name: /^Start month/ })
      .findByRole("button", { name: "December 2026" })
      .focus();
    cy.realPress("ArrowRight");
    cy.findByRole("grid", { name: /^Start month/ })
      .findByRole("button", { name: "January 2027" })
      .should("have.focus");
    cy.findAllByRole("combobox", { name: "Year Dropdown" })
      .first()
      .should("have.text", "2027");
    // The end grid is untouched.
    cy.findAllByRole("combobox", { name: "Year Dropdown" })
      .last()
      .should("have.text", "2035");
  });

  it("SHOULD retreat the end grid year past January when the two grids show non-consecutive years", () => {
    cy.mount(<RangeFixture />);
    cy.findAllByRole("button", { name: "Open Calendar" }).first().realClick();
    // Fast-forward the end grid so the two grids display 2026 / 2035.
    cy.findAllByRole("combobox", { name: "Year Dropdown" }).last().click();
    cy.findAllByRole("option", { name: "2035" }).last().click();
    // Focus January of the end grid and arrow backward. Since the start
    // grid is not on 2034 (the year immediately before the end grid),
    // focus should stay in the end grid and its year should retreat.
    cy.findByRole("grid", { name: /^End month/ })
      .findByRole("button", { name: "January 2035" })
      .focus();
    cy.realPress("ArrowLeft");
    cy.findByRole("grid", { name: /^End month/ })
      .findByRole("button", { name: "December 2034" })
      .should("have.focus");
    cy.findAllByRole("combobox", { name: "Year Dropdown" })
      .last()
      .should("have.text", "2034");
    // The start grid is untouched.
    cy.findAllByRole("combobox", { name: "Year Dropdown" })
      .first()
      .should("have.text", "2026");
  });
});
