import { composeStories } from "@storybook/react";
import * as datePickerStories from "@stories/date-picker/date-picker.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";
import {
  CalendarDate,
  DateFormatter,
  DateValue,
  endOfMonth,
  getLocalTimeZone,
  startOfMonth,
  today,
} from "@internationalized/date";
import { ChangeEvent, useState } from "react";

const composedStories = composeStories(datePickerStories);
const { Default, Range } = composedStories;

const testDate = new CalendarDate(2000, 2, 1);
const testInput = "02-feb-2000";
const rangeTestInput = "02-mar-2000";
const localTimeZone = getLocalTimeZone();
const currentLocale = navigator.languages[0];
const formatDate = (date: DateValue, options?: Intl.DateTimeFormatOptions) => {
  const formatter = new DateFormatter(currentLocale, options);
  return formatter.format(date.toDate(localTimeZone));
};
const formatInput = (date: DateValue): string =>
  new DateFormatter("EN-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date.toDate(localTimeZone));

const formatDay = (date: DateValue) => {
  return formatDate(date, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

describe("GIVEN a DatePicker", () => {
  checkAccessibility(composedStories);

  describe("WHEN single datepicker is mounted", () => {
    it("THEN it should mount with the specified defaultSelectedDate", () => {
      cy.mount(<Default defaultSelectedDate={testDate} />);
      cy.findByRole("textbox").should("have.value", formatInput(testDate));
    });
    it("THEN should format a valid date with a different format on blur", () => {
      cy.mount(<Default defaultSelectedDate={testDate} />);
      cy.findByRole("textbox").click().clear().type(testInput);
      cy.findByRole("textbox").blur();
      cy.findByRole("textbox").should(
        "have.value",
        formatInput(testDate.add({ days: 1 }))
      );
    });
    it("THEN should not format invalid dates on blur", () => {
      cy.mount(<Default defaultSelectedDate={testDate} />);
      cy.findByRole("textbox").click().clear().type("2 fev");
      cy.findByRole("textbox").blur();
      cy.findByRole("textbox").should("have.value", "2 fev");
    });
    it("THEN should not format invalid dates on blur if controlled", () => {
      cy.mount(<Default selectedDate={testDate} />);
      cy.findByRole("textbox").click().clear().type("2 fev");
      cy.findByRole("textbox").blur();
      cy.findByRole("textbox").should("have.value", "2 fev");
    });
    it("THEN clicking the calendar button should open the panel", () => {
      cy.mount(<Default defaultSelectedDate={testDate} />);
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      cy.findByRole("application").should("exist");

      // Regression - #3471
      cy.get(".saltDatePickerPanel").should("have.css", "z-index", "1500");
    });
    it("THEN should close the calendar panel once a date is selected", () => {
      cy.mount(<Default defaultSelectedDate={testDate} />);
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      cy.findByRole("button", {
        name: formatDay(testDate.add({ days: 11 })),
      }).should("exist");
      cy.findByRole("button", {
        name: formatDay(testDate.add({ days: 11 })),
      }).realClick();
      cy.findByRole("application").should("not.exist");
      cy.findByRole("textbox").should("have.focus");
    });
    it("THEN open button should be disabled when component is disabled", () => {
      cy.mount(<Default defaultSelectedDate={testDate} disabled />);
      cy.findByRole("button").should("be.disabled");
    });
    it("THEN render read only when prop is passed", () => {
      cy.mount(<Default defaultSelectedDate={testDate} readOnly />);
      cy.findByRole("textbox").should("have.attr", "readonly");
      cy.findByRole("button").should("be.disabled");
    });
    it("THEN it should update the selected month when changing selected date", () => {
      cy.mount(<Default defaultSelectedDate={testDate} />);
      cy.findByRole("textbox").click().clear().type(testInput);
      cy.findByRole("textbox").blur();
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      cy.findAllByRole("combobox")
        .eq(0)
        .should("have.text", formatDate(testDate, { month: "short" }));
      cy.findAllByRole("combobox")
        .eq(1)
        .should("have.text", formatDate(testDate, { year: "numeric" }));
    });
    it("THEN it should clear the date if an empty input is submitted", () => {
      cy.mount(
        <Default
          defaultSelectedDate={testDate}
          CalendarProps={{ visibleMonth: testDate }}
        />
      );
      cy.findByRole("textbox").click().clear();
      cy.findByRole("textbox").blur();
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      cy.findByRole("button", { name: formatDay(testDate) }).should(
        "not.have.attr",
        "aria-pressed",
        "true"
      );
    });
    it("should allow a controlled open state", () => {
      cy.mount(<Default open />);
      cy.findAllByRole("application").should("exist");
      cy.realPress("Escape");
      cy.findAllByRole("application").should("exist");
    });
    it("THEN should mount with specified date if controlled", () => {
      cy.mount(<Default selectedDate={testDate} />);
      cy.findByRole("textbox").should("have.value", formatInput(testDate));
    });
    it("should call onChange with the new controlled value", () => {
      const changeSpy = cy.stub().as("changeSpy");

      function ControlledPicker() {
        const [date, setDate] = useState(testDate);
        const onChange = (event: ChangeEvent<HTMLInputElement>) => {
          // React 16 backwards compatibility
          event.persist();
          setDate(testDate);
          changeSpy(event);
        };

        return <Default selectedDate={date} onChange={onChange} />;
      }

      cy.mount(<ControlledPicker />);
      cy.findByRole("textbox").click().clear().type(testInput);
      cy.get("@changeSpy").should("have.been.calledWithMatch", {
        target: { value: testInput },
      });
    });
  });

  describe("WHEN range datepicker is mounted", () => {
    it("THEN it should mount with the specified defaultSelectedDate", () => {
      cy.mount(
        <Range
          defaultSelectedDate={{
            startDate: testDate,
            endDate: testDate.add({ months: 1 }),
          }}
        />
      );
      cy.findAllByRole("textbox")
        .eq(0)
        .should("have.value", formatInput(testDate));
      cy.findAllByRole("textbox")
        .eq(1)
        .should("have.value", formatInput(testDate.add({ months: 1 })));
    });

    it("THEN it should allow selecting start and end date through input", () => {
      cy.mount(<Range />);
      cy.findAllByRole("textbox").eq(0).clear().click().type(testInput);
      cy.findAllByRole("textbox").eq(1).click().type(rangeTestInput);
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      cy.findAllByRole("button", {
        pressed: true,
      }).should("have.length", 30);
    });
    it("THEN it should not close the calendar when a start date is selected", () => {
      cy.mount(<Range />);
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      cy.findByRole("button", {
        name: formatDay(startOfMonth(today(localTimeZone)).add({ days: 11 })),
      }).should("exist");
      cy.findByRole("button", {
        name: formatDay(startOfMonth(today(localTimeZone)).add({ days: 11 })),
      }).realClick();
      cy.findAllByRole("application").should("have.length", 2);
    });
    it("THEN it should close the calendar when an end date is selected", () => {
      cy.mount(<Range />);
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      cy.findByRole("button", {
        name: formatDay(startOfMonth(today(localTimeZone)).add({ days: 11 })),
      }).realClick();
      cy.findByRole("button", {
        name: formatDay(startOfMonth(today(localTimeZone)).add({ days: 12 })),
      }).realClick();
      cy.findByRole("application").should("not.exist");
      cy.findAllByRole("textbox").eq(1).should("have.focus");
    });
    it("THEN it should move both months forward if selecting a starting date in the second calendar", () => {
      cy.mount(
        <Range
          defaultSelectedDate={{
            startDate: testDate,
            endDate: testDate.add({ months: 1 }),
          }}
        />
      );
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      cy.findAllByRole("combobox")
        .eq(0)
        .should("have.text", formatDate(testDate, { month: "short" }));
      cy.findAllByRole("combobox")
        .eq(2)
        .should(
          "have.text",
          formatDate(testDate.add({ months: 1 }), { month: "short" })
        );
      cy.findByRole("button", {
        name: formatDay(testDate.add({ months: 1, days: 1 })),
      }).should("exist");
      cy.findByRole("button", {
        name: formatDay(testDate.add({ months: 1, days: 1 })),
      }).realClick();
      cy.findAllByRole("combobox")
        .eq(0)
        .should(
          "have.text",
          formatDate(testDate.add({ months: 1 }), { month: "short" })
        );
      cy.findAllByRole("combobox")
        .eq(2)
        .should(
          "have.text",
          formatDate(testDate.add({ months: 2 }), { month: "short" })
        );
    });

    it("should show two calendars by default", () => {
      cy.mount(<Range />);
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      cy.findAllByRole("application").should("have.length", 2);
    });

    it("should show one calendar when visibleMonths is 1", () => {
      cy.mount(<Range visibleMonths={1} />);
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      cy.findAllByRole("application").should("have.length", 1);
    });
    it("should show hover all the first month when hovering through the second one ", () => {
      cy.mount(<Range />);
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      cy.findByRole("button", {
        name: formatDay(startOfMonth(today(localTimeZone)).add({ days: 15 })),
      }).realClick();
      cy.findByRole("button", {
        name: formatDay(
          startOfMonth(today(localTimeZone)).add({ days: 15, months: 1 })
        ),
      }).realHover();
      cy.findByRole("button", {
        name: formatDay(endOfMonth(today(localTimeZone))),
      }).should("have.class", "saltCalendarDay-hovered");
    });
    it("should disable the first calendar's next month button and the second calendar's previous month button when a start date has been selected", () => {
      cy.mount(<Range />);
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      cy.findByRole("button", {
        name: formatDay(today(localTimeZone)),
      }).realClick();
      cy.findAllByRole("button", { name: "Next Month" })
        .eq(0)
        .should("have.attr", "aria-disabled", "true");
      cy.findAllByRole("button", { name: "Previous Month" })
        .eq(1)
        .should("have.attr", "aria-disabled", "true");
    });

    it("should not disable the first calendar's next month button and the second calendar's previous month button when visibleMonths is 1 and a start date has been selected", () => {
      cy.mount(<Range visibleMonths={1} />);
      cy.findByRole("button", { name: "Open Calendar" }).realClick();
      cy.findByRole("button", {
        name: formatDay(today(localTimeZone)),
      }).realClick();
      cy.findByRole("button", { name: "Next Month" }).should(
        "not.have.attr",
        "aria-disabled",
        "true"
      );
      cy.findByRole("button", { name: "Previous Month" }).should(
        "not.have.attr",
        "aria-disabled",
        "true"
      );
    });
    it("THEN should mount with specified date if controlled", () => {
      cy.mount(
        <Range
          selectedDate={{
            startDate: testDate,
            endDate: testDate.add({ months: 1 }),
          }}
        />
      );
      cy.findAllByRole("textbox")
        .eq(0)
        .should("have.value", formatInput(testDate));
      cy.findAllByRole("textbox")
        .eq(1)
        .should("have.value", formatInput(testDate.add({ months: 1 })));
    });
    it("THEN should not format invalid dates on blur if controlled", () => {
      cy.mount(
        <Range
          selectedDate={{
            startDate: testDate,
            endDate: testDate.add({ months: 1 }),
          }}
        />
      );
      cy.findAllByRole("textbox").eq(0).clear().click().type("2 fev");
      cy.findAllByRole("textbox").eq(0).blur();
      cy.findAllByRole("textbox").eq(0).should("have.value", "2 fev");
    });
    it("should call onChange with the new controlled value", () => {
      const changeSpy = cy.stub().as("changeSpy");

      function ControlledRangePicker() {
        const [date, setDate] = useState(testDate);
        const onChange = (
          event: ChangeEvent<HTMLInputElement>,
          startDate?: string,
          endDate?: string
        ) => {
          // React 16 backwards compatibility
          event.persist();
          setDate(testDate);
          changeSpy(startDate, endDate);
        };

        return <Range selectedDate={date} onChange={onChange} />;
      }

      cy.mount(<ControlledRangePicker />);
      cy.findAllByRole("textbox").eq(0).click().clear().type(testInput);
      cy.get("@changeSpy").should("have.been.calledWith", testInput);
      cy.findAllByRole("textbox").eq(1).click().clear().type(rangeTestInput);
      cy.get("@changeSpy").should(
        "have.been.calledWith",
        testInput,
        rangeTestInput
      );
    });
  });
});
