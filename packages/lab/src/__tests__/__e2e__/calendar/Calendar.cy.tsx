import {
  type DateValue,
  endOfMonth,
  endOfWeek,
  parseDate,
  startOfMonth,
  startOfWeek,
  today,
} from "@internationalized/date";
import { formatDate } from "@salt-ds/lab";
import * as calendarStories from "@stories/calendar/calendar.stories";
import { composeStories } from "@storybook/react";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const {
  Single,
  CustomDayRender,
  CustomHeader,
  HideYearDropdown,
  MinMaxDate,
  TwinCalendars,
  WithLocale,
} = composeStories(calendarStories);

describe("GIVEN a Calendar", () => {
  // TODO design a compliant Header example
  const {
    default: _ignored,
    CustomHeader: _CustomHeader,
    ...allAxeStories
  } = calendarStories;
  checkAccessibility(allAxeStories);

  const testDate = parseDate("2022-02-03");
  const testTimeZone = "Europe/London";
  const testLocale = "en-GB";

  const formatDay = (date: DateValue) => {
    return formatDate(date, testLocale, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  describe("Today's Date", () => {
    it("SHOULD set `aria-current=date` on today's date", () => {
      cy.mount(<Single locale={testLocale} />);
      cy.findByRole("application").should("exist");
      cy.findByRole("application").should(
        "have.accessibleName",
        formatDate(today(testTimeZone), testLocale, {
          day: undefined,
          month: "long",
          year: "numeric",
        }),
      );
      // Verify that today's date button has `aria-current=date`
      cy.findByRole("button", {
        name: formatDay(today(testTimeZone)),
      }).should("have.attr", "aria-current", "date");
    });
  });

  describe("Navigation", () => {
    describe("Buttons", () => {
      it("SHOULD navigate to the previous month when the previous month button is clicked", () => {
        cy.mount(<Single defaultVisibleMonth={testDate} locale={testLocale} />);
        // Simulate clicking the "Previous Month" button
        cy.findByRole("button", {
          name: "Previous Month",
        }).realClick();
        // Verify that the calendar navigates to the previous month
        cy.findByRole("button", {
          name: formatDay(testDate.subtract({ months: 1 })),
        }).should("be.visible");
      });

      it("SHOULD navigate to the next month when the next month button is clicked", () => {
        cy.mount(<Single defaultVisibleMonth={testDate} locale={testLocale} />);
        // Simulate clicking the "Next Month" button
        cy.findByRole("button", {
          name: "Next Month",
        }).realClick();
        // Verify that the calendar navigates to the next month
        cy.findByRole("button", {
          name: formatDay(testDate.add({ months: 1 })),
        }).should("be.visible");
      });
    });

    describe("Dropdowns", () => {
      it("SHOULD navigate to the selected month when using the month dropdown", () => {
        cy.mount(<Single defaultVisibleMonth={testDate} locale={testLocale} />);
        // Verify the initial month in the dropdown
        cy.findByRole("combobox", { name: "Month Dropdown" }).should(
          "have.text",
          formatDate(testDate, testLocale, {
            day: undefined,
            month: "short",
            year: undefined,
          }),
        );
        // Simulate selecting a different month from the dropdown
        cy.findByRole("combobox", {
          name: "Month Dropdown",
        }).realClick();
        cy.findByRole("option", {
          name: formatDate(testDate.set({ month: 4 }), testLocale, {
            day: undefined,
            month: "short",
            year: undefined,
          }),
        })
          .realHover()
          .realClick();
        // Verify that the calendar navigates to the selected month
        cy.findByRole("combobox", { name: "Month Dropdown" }).should(
          "have.text",
          formatDate(testDate.set({ month: 4 }), testLocale, {
            day: undefined,
            month: "short",
            year: undefined,
          }),
        );
        cy.findByRole("button", {
          name: formatDay(testDate.set({ month: 4 })),
        }).should("be.visible");
      });

      it("SHOULD navigate to the selected year when using the year dropdown", () => {
        cy.mount(<Single defaultVisibleMonth={testDate} locale={testLocale} />);
        // Verify the initial year in the dropdown
        cy.findByRole("combobox", { name: "Year Dropdown" }).should(
          "have.text",
          formatDate(testDate, testLocale, {
            day: undefined,
            month: undefined,
            year: "numeric",
          }),
        );
        // Simulate selecting a different year from the dropdown
        cy.findByRole("combobox", {
          name: "Year Dropdown",
        }).realClick();
        cy.findByRole("option", {
          name: formatDate(testDate.add({ years: 1 }), testLocale, {
            day: undefined,
            month: undefined,
            year: "numeric",
          }),
        })
          .realHover()
          .realClick();
        // Verify that the calendar navigates to the selected year
        cy.findByRole("combobox", { name: "Year Dropdown" }).should(
          "have.text",
          formatDate(testDate.add({ years: 1 }), testLocale, {
            day: undefined,
            month: undefined,
            year: "numeric",
          }),
        );
        cy.findByRole("button", {
          name: formatDay(testDate.add({ years: 1 })),
        }).should("be.visible");
      });
    });

    describe("Clicking", () => {
      it("SHOULD navigate to the next month when clicking out of range dates", () => {
        cy.mount(<Single defaultVisibleMonth={testDate} locale={testLocale} />);
        // Verify the initial month in the dropdown
        cy.findByRole("combobox", { name: "Month Dropdown" }).should(
          "have.text",
          formatDate(testDate, testLocale, {
            day: undefined,
            month: "short",
            year: undefined,
          }),
        );
        // Simulate clicking a date outside the current month range
        cy.findByRole("button", {
          name: formatDay(endOfMonth(testDate).add({ days: 1 })),
        }).realClick();
        // Verify that the calendar navigates to the next month
        cy.findByRole("combobox", { name: "Month Dropdown" }).should(
          "have.text",
          formatDate(testDate.add({ months: 1 }), testLocale, {
            day: undefined,
            month: "short",
            year: undefined,
          }),
        );
      });
    });

    describe("Keyboard", () => {
      it("SHOULD move the focus when the arrow keys are pressed", () => {
        cy.mount(<Single defaultVisibleMonth={testDate} locale={testLocale} />);

        // Simulate focusing on the current date button
        cy.findByRole("button", {
          name: formatDay(testDate),
        }).focus();
        cy.findByRole("button", {
          name: formatDay(testDate),
        }).should("be.focused");

        // Simulate pressing the ArrowRight key
        cy.realPress("ArrowRight");
        cy.findByRole("button", {
          name: formatDay(testDate.add({ days: 1 })),
        }).should("be.visible");

        // Simulate pressing the ArrowLeft key
        cy.realPress("ArrowLeft");
        cy.findByRole("button", {
          name: formatDay(testDate),
        }).should("be.visible");

        // Simulate pressing the ArrowDown key
        cy.realPress("ArrowDown");
        cy.findByRole("button", {
          name: formatDay(testDate.add({ weeks: 1 })),
        }).should("be.visible");

        // Simulate pressing the ArrowUp key
        cy.realPress("ArrowUp");
        cy.findByRole("button", {
          name: formatDay(testDate),
        }).should("be.visible");
      });

      describe("SHOULD move the focus when the shortcut keys are pressed", () => {
        beforeEach(() => {
          cy.mount(
            <Single defaultVisibleMonth={testDate} locale={testLocale} />,
          );

          // Simulate focusing on the current date button
          cy.findByRole("button", {
            name: formatDay(testDate),
          }).focus();

          cy.findByRole("button", {
            name: formatDay(testDate),
          }).should("be.focused");
        });

        it("HOME", () => {
          // Simulate pressing the Home key
          cy.realPress("Home").then(() => {
            cy.findByRole("button", {
              name: formatDay(startOfWeek(testDate, testLocale)),
            }).should("be.focused");
          });
        });

        it("END", () => {
          // Simulate pressing the End key
          cy.realPress("End").then(() => {
            cy.findByRole("button", {
              name: formatDay(endOfWeek(testDate, testLocale)),
            }).should("be.focused");
          });
        });

        it("PageUp", () => {
          // Simulate pressing the PageUp key
          cy.realPress("PageUp").then(() => {
            cy.findByRole("button", {
              name: formatDay(testDate.subtract({ months: 1 })),
            }).should("be.focused");
          });
        });

        it("PageDown", () => {
          // Simulate pressing the PageDown key
          cy.realPress("PageDown").then(() => {
            cy.findByRole("button", {
              name: formatDay(testDate.add({ months: 1 })),
            }).should("be.focused");
          });
        });

        it("Shift PageUp", () => {
          // Simulate pressing Shift + PageUp keys
          cy.realPress(["Shift", "PageUp"]).then(() => {
            cy.findByRole("button", {
              name: formatDay(testDate.subtract({ years: 1 })),
            }).should("be.focused");
          });
        });

        it("Shift PageDown", () => {
          // Simulate pressing Shift + PageDown keys
          cy.realPress(["Shift", "PageDown"]).then(() => {
            cy.findByRole("button", {
              name: formatDay(testDate.add({ years: 1 })),
            }).should("be.focused");
          });
        });
      });
    });
  });

  describe("Render", () => {
    it("SHOULD hide year dropdown on navigation", () => {
      cy.mount(
        <HideYearDropdown defaultVisibleMonth={testDate} locale={testLocale} />,
      );
      // Verify that the year dropdown is not visible
      cy.findByRole("combobox", { name: "Year Dropdown" }).should("not.exist");

      // Simulate selecting a different month from the month dropdown
      cy.findByRole("combobox", { name: "Month Dropdown" }).should(
        "have.text",
        formatDate(testDate, testLocale, {
          day: undefined,
          month: "long",
          year: undefined,
        }),
      );
      cy.findByRole("combobox", {
        name: "Month Dropdown",
      }).realClick();
      const followingQuarter = testDate.add({ months: 4 });
      cy.findByRole("option", {
        name: formatDate(followingQuarter, testLocale, {
          day: undefined,
          month: "long",
          year: undefined,
        }),
      })
        .realHover()
        .realClick();
      // Verify that the calendar navigates to the selected month
      cy.findByRole("combobox", { name: "Month Dropdown" }).should(
        "have.text",
        formatDate(followingQuarter, testLocale, {
          day: undefined,
          month: "long",
          year: undefined,
        }),
      );
      cy.findByRole("button", {
        name: formatDay(followingQuarter),
      }).should("be.visible");
    });

    it("SHOULD render custom headers", () => {
      cy.mount(
        <CustomHeader defaultVisibleMonth={testDate} locale={testLocale} />,
      );
      // Simulate clicking the "Today" button
      cy.findByRole("button", { name: /Today/i }).click();
      // Verify that today's date button has `aria-current=date`
      cy.findByRole("button", {
        name: formatDay(today(testTimeZone)),
      }).should("have.attr", "aria-current", "date");
    });

    it("SHOULD render custom day", () => {
      cy.mount(
        <CustomDayRender defaultVisibleMonth={testDate} locale={testLocale} />,
      );
      // Verify that a custom day button is rendered
      cy.contains("button", /01/).should("exist");
    });

    it("SHOULD support multi-calendar selection", () => {
      const startDate = testDate;
      const endDate = testDate.add({ months: 1 });
      cy.mount(
        <TwinCalendars
          selectionVariant={"range"}
          defaultSelectedDate={{ startDate, endDate }}
          locale={testLocale}
        />,
      );
      // Verify that the start and end date buttons are pressed
      cy.findByRole("button", {
        name: formatDay(startOfMonth(startDate)),
      }).should("not.have.attr", "aria-pressed", "true");
      cy.findByRole("button", {
        name: formatDay(startDate),
      }).should("have.attr", "aria-pressed", "true");
      cy.findByRole("button", {
        name: formatDay(endDate),
      }).should("have.attr", "aria-pressed", "true");
      cy.findByRole("button", {
        name: formatDay(endOfMonth(endDate)),
      }).should("not.have.attr", "aria-pressed", "true");
    });

    it("SHOULD render different locales", () => {
      cy.mount(<WithLocale locale={"es-ES"} />);
      // Verify that the month dropdown is rendered in the specified locale
      cy.findByRole("combobox", { name: "Month Dropdown" }).should(
        "have.text",
        formatDate(today(testTimeZone), "es-ES", {
          day: undefined,
          month: "short",
          year: undefined,
        }),
      );
    });
  });

  describe("Min/Max", () => {
    it("SHOULD be selectable between min/max dates", () => {
      cy.mount(
        <MinMaxDate
          defaultVisibleMonth={testDate}
          minDate={startOfMonth(testDate).add({ days: 1 })}
          maxDate={endOfMonth(testDate).subtract({ days: 1 })}
          locale={testLocale}
        />,
      );
      // Verify the initial month in the dropdown
      cy.findByRole("combobox", { name: "Month Dropdown" }).should(
        "have.text",
        formatDate(testDate, testLocale, {
          day: undefined,
          month: "short",
          year: undefined,
        }),
      );
      // Simulate selecting a different month from the month dropdown
      cy.findByRole("combobox", {
        name: "Month Dropdown",
      }).realClick();
      // Verify out of range options are disabled
      cy.findByRole("option", {
        name: formatDate(testDate.set({ month: 1 }), testLocale, {
          day: undefined,
          month: "short",
          year: undefined,
        }),
      }).should("have.attr", "aria-disabled", "true");
      for (let monthIndex = 3; monthIndex < 12; monthIndex++) {
        cy.findByRole("option", {
          name: formatDate(testDate.set({ month: monthIndex }), testLocale, {
            day: undefined,
            month: "short",
            year: undefined,
          }),
        }).should("have.attr", "aria-disabled", "true");
      }
      // Verify in range options are enabled
      cy.findByRole("option", {
        name: formatDate(testDate.set({ month: 2 }), testLocale, {
          day: undefined,
          month: "short",
          year: undefined,
        }),
      }).should("have.attr", "aria-selected", "true");
      // Simulate selecting a different year from the year dropdown
      cy.findByRole("combobox", {
        name: "Year Dropdown",
      }).realClick();
      cy.findAllByRole("option").should("have.length", 1);
      // Verify only in range options are enabled
      cy.findByRole("option", {
        name: formatDate(testDate, testLocale, {
          day: undefined,
          month: undefined,
          year: "numeric",
        }),
      }).should("exist");
      // Verify out of range dates are disabled
      cy.findByRole("button", {
        name: formatDay(startOfMonth(testDate)),
      }).should("have.attr", "aria-disabled", "true");
      cy.findByRole("button", {
        name: formatDay(endOfMonth(testDate)),
      }).should("have.attr", "aria-disabled", "true");
    });
  });
});
