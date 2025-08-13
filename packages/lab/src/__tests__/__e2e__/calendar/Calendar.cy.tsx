import type {
  DateFrameworkType,
  SaltDateAdapter,
} from "@salt-ds/date-adapters";
import { AdapterDateFns } from "@salt-ds/date-adapters/date-fns";
import { AdapterDayjs } from "@salt-ds/date-adapters/dayjs";
import { AdapterLuxon } from "@salt-ds/date-adapters/luxon";
import { AdapterMoment } from "@salt-ds/date-adapters/moment";
import { Calendar, CalendarGrid, CalendarNavigation } from "@salt-ds/lab";
import * as calendarStories from "@stories/calendar/calendar.stories";
import "moment/dist/locale/es";

// Initialize adapters
const adapterDateFns = new AdapterDateFns();
const adapterDayjs = new AdapterDayjs();
const adapterLuxon = new AdapterLuxon();
const adapterMoment = new AdapterMoment();

// Update locale for moment
adapterMoment.moment.updateLocale("es", {
  monthsShort: [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ],
});

// Create an array of adapters
const adapters = [adapterDateFns, adapterDayjs, adapterLuxon, adapterMoment];

const {
  // Storybook wraps components in their own LocalizationProvider, so do not compose Stories
  CustomDayRendering,
  DisabledDates,
  TodayButton,
  TwinCalendars,
  UnselectableDates,
  WithLocale,
  // biome-ignore lint/suspicious/noExplicitAny: storybook stories
} = calendarStories as any;

describe("GIVEN a Calendar", () => {
  adapters.forEach((adapter: SaltDateAdapter<DateFrameworkType>) => {
    describe(`Tests with ${adapter.lib}`, () => {
      beforeEach(() => {
        const today = new Date(2024, 4, 6);
        cy.clock(today, ["Date"]);
        cy.setDateAdapter(adapter);
      });

      afterEach(() => {
        cy.clock().then((clock) => clock.restore());
      });

      const testDate = adapter.parse("02/03/2024", "DD/MM/YYYY").date;

      describe("Today's Date", () => {
        it("SHOULD set `aria-current=date` on today's date", () => {
          cy.mount(
            <Calendar selectionVariant={"single"}>
              <CalendarNavigation />
              <CalendarGrid />
            </Calendar>,
          );
          cy.findByRole("application").should("exist");
          const today = adapter.today();
          cy.findByRole("application").should(
            "have.accessibleName",
            adapter.format(today, "MMMM YYYY"),
          );
          // Verify that today's date button has `aria-current=date`
          cy.findByRole("button", {
            name: adapter.format(today, "DD MMMM YYYY"),
          }).should("have.attr", "aria-current", "date");
        });
      });

      describe("Navigation", () => {
        describe("Buttons", () => {
          it("SHOULD navigate to the previous month when the previous month button is clicked", () => {
            cy.mount(
              <Calendar
                selectionVariant={"single"}
                defaultVisibleMonth={testDate}
              >
                <CalendarNavigation />
                <CalendarGrid />
              </Calendar>,
            );
            // Simulate clicking the "Previous Month" button
            cy.findByRole("button", {
              name: "Previous Month",
            }).realClick();
            // Verify that the calendar navigates to the previous month
            const previousMonth = adapter.subtract(testDate, { months: 1 });
            cy.findByRole("button", {
              name: adapter.format(previousMonth, "DD MMMM YYYY"),
            }).should("be.visible");
          });

          it("SHOULD navigate to the next month when the next month button is clicked", () => {
            cy.mount(
              <Calendar
                selectionVariant={"single"}
                defaultVisibleMonth={testDate}
              >
                <CalendarNavigation />
                <CalendarGrid />
              </Calendar>,
            );
            // Simulate clicking the "Next Month" button
            cy.findByRole("button", {
              name: "Next Month",
            }).realClick();
            // Verify that the calendar navigates to the next month
            const nextMonth = adapter.add(testDate, { months: 1 });
            cy.findByRole("button", {
              name: adapter.format(nextMonth, "DD MMMM YYYY"),
            }).should("be.visible");
          });
        });

        describe("Dropdowns", () => {
          it("SHOULD navigate to the selected month when using the month dropdown", () => {
            cy.mount(
              <Calendar
                selectionVariant={"single"}
                defaultVisibleMonth={testDate}
              >
                <CalendarNavigation />
                <CalendarGrid />
              </Calendar>,
            );
            // Verify the initial month in the dropdown
            cy.findByRole("combobox", { name: "Month Dropdown" }).should(
              "have.text",
              adapter.format(testDate, "MMM"),
            );
            // Simulate selecting a different month from the dropdown
            cy.findByRole("combobox", {
              name: "Month Dropdown",
            }).realClick();
            const nextMonth = adapter.add(testDate, { months: 4 });
            cy.findByRole("option", {
              name: adapter.format(nextMonth, "MMM"),
            })
              .realHover()
              .realClick();
            // Verify that the calendar navigates to the selected month
            cy.findByRole("combobox", { name: "Month Dropdown" }).should(
              "have.text",
              adapter.format(nextMonth, "MMM"),
            );
            cy.findByRole("button", {
              name: adapter.format(nextMonth, "DD MMMM YYYY"),
            }).should("be.visible");
          });

          it("SHOULD navigate to the selected year when using the year dropdown", () => {
            cy.mount(
              <Calendar
                selectionVariant={"single"}
                defaultVisibleMonth={testDate}
              >
                <CalendarNavigation />
                <CalendarGrid />
              </Calendar>,
            );
            // Verify the initial year in the dropdown
            cy.findByRole("combobox", { name: "Year Dropdown" }).should(
              "have.text",
              adapter.format(testDate, "YYYY"),
            );
            // Simulate selecting a different year from the dropdown
            cy.findByRole("combobox", {
              name: "Year Dropdown",
            }).realClick();
            const nextYear = adapter.add(testDate, { years: 1 });
            cy.findByRole("option", { name: adapter.format(nextYear, "YYYY") })
              .realHover()
              .realClick();
            // Verify that the calendar navigates to the selected year
            cy.findByRole("combobox", { name: "Year Dropdown" }).should(
              "have.text",
              adapter.format(nextYear, "YYYY"),
            );
            cy.findByRole("button", {
              name: adapter.format(nextYear, "DD MMMM YYYY"),
            }).should("be.visible");
          });
        });

        describe("Clicking", () => {
          it("SHOULD navigate to the next month when clicking out of range dates", () => {
            cy.mount(
              <Calendar
                selectionVariant={"single"}
                defaultVisibleMonth={testDate}
              >
                <CalendarNavigation />
                <CalendarGrid />
              </Calendar>,
            );
            // Verify the initial month in the dropdown
            cy.findByRole("combobox", { name: "Month Dropdown" }).should(
              "have.text",
              adapter.format(testDate, "MMM"),
            );
            // Simulate clicking a date outside the current month range
            let nextMonth = adapter.endOf(testDate, "month");
            nextMonth = adapter.add(nextMonth, { days: 1 });
            cy.findByRole("button", {
              name: adapter.format(nextMonth, "DD MMMM YYYY"),
            }).realClick();
            // Verify that the calendar navigates to the next month
            cy.findByRole("combobox", { name: "Month Dropdown" }).should(
              "have.text",
              adapter.format(nextMonth, "MMM"),
            );
          });
        });

        describe("Keyboard", () => {
          it("SHOULD move the focus when the arrow keys are pressed", () => {
            cy.mount(
              <Calendar
                selectionVariant={"single"}
                defaultVisibleMonth={testDate}
              >
                <CalendarNavigation />
                <CalendarGrid />
              </Calendar>,
            );

            // Simulate focusing on the current date button
            cy.findByRole("button", {
              name: adapter.format(testDate, "DD MMMM YYYY"),
            }).focus();
            cy.findByRole("button", {
              name: adapter.format(testDate, "DD MMMM YYYY"),
            })
              .should(($button) =>
                expect($button.attr("class")).to.match(
                  /saltCalendarDay-focused/,
                ),
              )
              .should("be.focused");

            // Simulate pressing the ArrowRight key
            cy.realPress("ArrowRight");
            const nextDay = adapter.add(testDate, { days: 1 });
            cy.findByRole("button", {
              name: adapter.format(nextDay, "DD MMMM YYYY"),
            })
              .should(($button) =>
                expect($button.attr("class")).to.match(
                  /saltCalendarDay-focused/,
                ),
              )
              .should("be.focused");

            // Simulate pressing the ArrowLeft key
            cy.realPress("ArrowLeft");
            const previousDay = adapter.subtract(nextDay, { days: 1 });
            cy.findByRole("button", {
              name: adapter.format(previousDay, "DD MMMM YYYY"),
            })
              .should(($button) =>
                expect($button.attr("class")).to.match(
                  /saltCalendarDay-focused/,
                ),
              )
              .should("be.focused");

            // Simulate pressing the ArrowDown key
            cy.realPress("ArrowDown");
            const nextWeek = adapter.add(previousDay, { weeks: 1 });
            cy.findByRole("button", {
              name: adapter.format(nextWeek, "DD MMMM YYYY"),
            })
              .should(($button) =>
                expect($button.attr("class")).to.match(
                  /saltCalendarDay-focused/,
                ),
              )
              .should("be.focused");

            // Simulate pressing the ArrowUp key
            cy.realPress("ArrowUp");
            const previousWeek = adapter.subtract(nextWeek, { weeks: 1 });
            cy.findByRole("button", {
              name: adapter.format(previousWeek, "DD MMMM YYYY"),
            })
              .should(($button) =>
                expect($button.attr("class")).to.match(
                  /saltCalendarDay-focused/,
                ),
              )
              .should("be.focused");
          });

          describe("SHOULD move the focus when the shortcut keys are pressed", () => {
            beforeEach(() => {
              cy.mount(
                <Calendar
                  selectionVariant={"single"}
                  defaultVisibleMonth={testDate}
                >
                  <CalendarNavigation />
                  <CalendarGrid />
                </Calendar>,
              );

              // Simulate focusing on the current date button
              cy.findByRole("button", {
                name: adapter.format(testDate, "DD MMMM YYYY"),
              }).focus();

              cy.findByRole("button", {
                name: adapter.format(testDate, "DD MMMM YYYY"),
              })
                .should(($button) =>
                  expect($button.attr("class")).to.match(
                    /saltCalendarDay-focused/,
                  ),
                )
                .should("be.focused");
            });

            it("HOME", () => {
              // Simulate pressing the Home key
              const startOfWeek = adapter.startOf(testDate, "week");
              cy.realPress("Home").then(() => {
                cy.findByRole("button", {
                  name: adapter.format(startOfWeek, "DD MMMM YYYY"),
                })
                  .should(($button) =>
                    expect($button.attr("class")).to.match(
                      /saltCalendarDay-focused/,
                    ),
                  )
                  .should("be.focused");
              });
            });

            it("END", () => {
              // Simulate pressing the End key
              const endOfWeek = adapter.endOf(testDate, "week");
              cy.realPress("End").then(() => {
                cy.findByRole("button", {
                  name: adapter.format(endOfWeek, "DD MMMM YYYY"),
                })
                  .should(($button) =>
                    expect($button.attr("class")).to.match(
                      /saltCalendarDay-focused/,
                    ),
                  )
                  .should("be.focused");
              });
            });

            it("PageUp", () => {
              // Simulate pressing the PageUp key
              const lastMonth = adapter.subtract(testDate, { months: 1 });
              cy.realPress("PageUp").then(() => {
                cy.findByRole("button", {
                  name: adapter.format(lastMonth, "DD MMMM YYYY"),
                })
                  .should(($button) =>
                    expect($button.attr("class")).to.match(
                      /saltCalendarDay-focused/,
                    ),
                  )
                  .should("be.focused");
              });
            });

            it("PageDown", () => {
              // Simulate pressing the PageDown key
              const nextMonth = adapter.add(testDate, { months: 1 });
              cy.realPress("PageDown").then(() => {
                cy.findByRole("button", {
                  name: adapter.format(nextMonth, "DD MMMM YYYY"),
                })
                  .should(($button) =>
                    expect($button.attr("class")).to.match(
                      /saltCalendarDay-focused/,
                    ),
                  )
                  .should("be.focused");
              });
            });

            it("Shift PageUp", () => {
              // Simulate pressing Shift + PageUp keys
              const lastYear = adapter.subtract(testDate, { years: 1 });
              cy.realPress(["Shift", "PageUp"]).then(() => {
                cy.findByRole("button", {
                  name: adapter.format(lastYear, "DD MMMM YYYY"),
                })
                  .should(($button) =>
                    expect($button.attr("class")).to.match(
                      /saltCalendarDay-focused/,
                    ),
                  )
                  .should("be.focused");
              });
            });

            it("Shift PageDown", () => {
              // Simulate pressing Shift + PageDown keys
              const nextYear = adapter.add(testDate, { years: 1 });
              cy.realPress(["Shift", "PageDown"]).then(() => {
                cy.findByRole("button", {
                  name: adapter.format(nextYear, "DD MMMM YYYY"),
                })
                  .should(($button) =>
                    expect($button.attr("class")).to.match(
                      /saltCalendarDay-focused/,
                    ),
                  )
                  .should("be.focused");
              });
            });
          });
        });
      });

      describe("Render", () => {
        it("SHOULD hide year dropdown on navigation", () => {
          cy.mount(
            <Calendar
              selectionVariant={"single"}
              defaultVisibleMonth={testDate}
            >
              <CalendarNavigation hideYearDropdown />
              <CalendarGrid />
            </Calendar>,
          );
          // Verify that the year dropdown is not visible
          cy.findByRole("combobox", { name: "Year Dropdown" }).should(
            "not.exist",
          );

          // Simulate selecting a different month from the month dropdown
          cy.findByRole("combobox", { name: "Month Dropdown" }).should(
            "have.text",
            adapter.format(testDate, "MMMM"),
          );
          cy.findByRole("combobox", {
            name: "Month Dropdown",
          }).realClick();
          const nextQuarter = adapter.add(testDate, { months: 4 });
          cy.findByRole("option", {
            name: adapter.format(nextQuarter, "MMMM"),
          })
            .realHover()
            .realClick();
          // Verify that the calendar navigates to the selected month
          cy.findByRole("combobox", { name: "Month Dropdown" }).should(
            "have.text",
            adapter.format(nextQuarter, "MMMM"),
          );
          cy.findByRole("button", {
            name: adapter.format(nextQuarter, "DD MMMM YYYY"),
          }).should("be.visible");
        });

        it("SHOULD render custom headers", () => {
          cy.mount(<TodayButton defaultVisibleMonth={testDate} />);
          // Simulate clicking the "Today" button
          cy.findByRole("button", { name: /Today/i }).click();
          // Verify that today's date button has `aria-current=date`
          const today = adapter.today();
          cy.findByRole("button", {
            name: adapter.format(today, "DD MMMM YYYY"),
          }).should("have.attr", "aria-current", "date");
        });

        it("SHOULD render custom day", () => {
          cy.mount(<CustomDayRendering defaultVisibleMonth={testDate} />);
          // Verify that the button contains the text "01"
          cy.contains("button", /^1$/).should("exist");
          // Verify that there is a span with the class name "x" inside the button
          cy.contains("button", /^1$/).find("span.dot").should("exist");
        });

        it("SHOULD support multi-calendar selection", () => {
          const startDate = testDate;
          const endDate = adapter.add(testDate, { months: 1 });
          cy.mount(
            <TwinCalendars
              selectionVariant={"range"}
              defaultVisibleMonth={startDate}
              defaultSelectedDate={{ startDate, endDate }}
            />,
          );
          // Verify that the start and end date buttons are pressed
          const startOfMonth = adapter.startOf(testDate, "month");
          const endOfMonth = adapter.endOf(endDate, "month");
          cy.findByRole("button", {
            name: adapter.format(startOfMonth, "DD MMMM YYYY"),
          }).should("not.have.attr", "aria-pressed", "true");
          cy.findByRole("button", {
            name: adapter.format(startDate, "DD MMMM YYYY"),
          }).should("have.attr", "aria-pressed", "true");
          cy.findByRole("button", {
            name: adapter.format(endDate, "DD MMMM YYYY"),
          }).should("have.attr", "aria-pressed", "true");
          cy.findByRole("button", {
            name: adapter.format(endOfMonth, "DD MMMM YYYY"),
          }).should("not.have.attr", "aria-pressed", "true");
        });

        it("SHOULD render different locales", () => {
          const visibleMonth = adapter.parse("01/08/2024", "DD/MM/YYYY").date;
          cy.mount(<WithLocale defaultVisibleMonth={visibleMonth} />);
          // Verify that the month dropdown is rendered in the specified locale
          cy.findByLabelText("Month Dropdown").should("have.text", "ago");
        });
      });

      describe("Min/Max", () => {
        it("SHOULD be selectable between min/max dates", () => {
          const startOfMonth = adapter.startOf(testDate, "month");
          const endOfMonth = adapter.endOf(testDate, "month");
          const minDate = adapter.add(startOfMonth, { days: 1 });
          const maxDate = adapter.subtract(endOfMonth, { days: 1 });

          cy.mount(
            <Calendar
              selectionVariant={"single"}
              defaultVisibleMonth={startOfMonth}
              minDate={minDate}
              maxDate={maxDate}
            >
              <CalendarNavigation />
              <CalendarGrid />
            </Calendar>,
          );
          // Verify the initial month in the dropdown
          cy.findByRole("combobox", { name: "Month Dropdown" }).should(
            "have.text",
            adapter.format(testDate, "MMM"),
          );
          // Simulate selecting a different month from the month dropdown
          cy.findByRole("combobox", {
            name: "Month Dropdown",
          }).realClick();
          // Verify that only the current Month is selectable in Month Dropdown
          for (let monthIndex = 1; monthIndex <= 12; monthIndex++) {
            let startMonth = adapter.clone(testDate);
            startMonth = adapter.set(startMonth, { month: monthIndex });
            if (adapter.getMonth(startOfMonth) !== monthIndex) {
              cy.findByRole("option", {
                name: adapter.format(startMonth, "MMM"),
              }).should("have.attr", "aria-disabled", "true");
            } else {
              cy.findByRole("option", {
                name: adapter.format(startMonth, "MMM"),
              }).should("not.have.attr", "aria-disabled", "true");
            }
          }
          // Verify only the current year is selectable
          cy.findByRole("combobox", {
            name: "Year Dropdown",
          }).realClick();
          cy.findAllByRole("option").should("have.length", 1);
          // Verify out of range dates are disabled
          cy.findByRole("button", {
            name: adapter.format(startOfMonth, "DD MMMM YYYY"),
          }).should("have.attr", "aria-disabled", "true");
          cy.findByRole("button", {
            name: adapter.format(endOfMonth, "DD MMMM YYYY"),
          }).should("have.attr", "aria-disabled", "true");
          // Verify in range dates are enabled
          cy.findByRole("button", {
            name: adapter.format(minDate, "DD MMMM YYYY"),
          }).should("not.have.attr", "aria-disabled", "true");
          cy.findByRole("button", {
            name: adapter.format(maxDate, "DD MMMM YYYY"),
          }).should("not.have.attr", "aria-disabled", "true");
        });
      });

      describe("Selection", () => {
        it("SHOULD allow selection of dates", () => {
          const selectionChangeSpy = cy.stub().as("selectionChangeSpy");
          cy.mount(
            <Calendar
              defaultVisibleMonth={testDate}
              selectionVariant={"single"}
              onSelectionChange={selectionChangeSpy}
            >
              <CalendarNavigation />
              <CalendarGrid />
            </Calendar>,
          );

          cy.get("@selectionChangeSpy").should("not.have.been.called");
          cy.findByRole("button", { name: "02 March 2024" })
            .realHover()
            .realClick();

          // biome-ignore lint/suspicious/noExplicitAny: spy
          cy.get("@selectionChangeSpy").should((spy: any) => {
            const [_event, date] = spy.lastCall.args;
            expect(adapter.isValid(date)).to.be.true;
            expect(adapter.format(date, "DD MMMM YYYY")).to.equal(
              "02 March 2024",
            );
          });
        });

        it("SHOULD not allow selection of un-selectable dates", () => {
          const selectionChangeSpy = cy.stub().as("selectionChangeSpy");
          cy.mount(
            <UnselectableDates
              defaultVisibleMonth={testDate}
              onSelectionChange={selectionChangeSpy}
            />,
          );

          // Define the weekend dates in March 2024
          const weekendDates = [
            "02 March 2024", // Saturday
            "03 March 2024", // Sunday
            "09 March 2024", // Saturday
            "10 March 2024", // Sunday
            "16 March 2024", // Saturday
            "17 March 2024", // Sunday
            "23 March 2024", // Saturday
            "24 March 2024", // Sunday
            "30 March 2024", // Saturday
            "31 March 2024", // Sunday
          ];

          // Check each weekend date to ensure it is disabled
          weekendDates.forEach((date) => {
            cy.findByRole("button", { name: date }).and(
              "have.attr",
              "aria-disabled",
              "true",
            );
            cy.findByRole("button", { name: date }).realHover();
            cy.findByRole("button", { name: date }).then(($el) => {
              const describedById = $el.attr("aria-describedby");
              cy.get(`[id="${describedById}"]`)
                .should("have.attr", "role", "tooltip")
                .find(".saltTooltip-content")
                .should("have.text", "Weekends are un-selectable");
            });
          });
          cy.get("@selectionChangeSpy").should("not.have.been.called");
        });

        it("SHOULD navigate to an un-selectable date and then to a selectable date using keyboard", () => {
          const selectionChangeSpy = cy.stub().as("selectionChangeSpy");
          cy.mount(
            <UnselectableDates
              defaultVisibleMonth={testDate}
              onSelectionChange={selectionChangeSpy}
            />,
          );

          // Define the weekend dates in March 2024
          const weekendDates = [
            "02 March 2024", // Saturday
            "03 March 2024", // Sunday
          ];

          // Focus on the day before the first unselectable date
          cy.findByRole("button", { name: "01 March 2024" }).focus();

          cy.focused().type("{rightarrow}");

          // Check that the date is unselectable and has the correct tooltip
          cy.focused().should("have.attr", "aria-disabled", "true");
          cy.focused().realHover();
          cy.focused().then(($el) => {
            const describedById = $el.attr("aria-describedby");
            cy.get(`[id="${describedById}"]`)
              .should("have.attr", "role", "tooltip")
              .find(".saltTooltip-content")
              .should("have.text", "Weekends are un-selectable");
          });

          // Arrow right again to the next unselectable date
          cy.focused().type("{rightarrow}");
          // Check that the date is unselectable
          cy.focused().should("have.attr", "aria-disabled", "true");

          // Arrow right again to a selectable date
          cy.focused().type("{rightarrow}");
          // Check that the 4th March is selectable
          cy.focused().should("not.have.attr", "aria-disabled", "true");
        });
      });
    });
  });
});
