import {
  type DateValue,
  endOfMonth,
  endOfWeek,
  getLocalTimeZone,
  parseDate,
  startOfMonth,
  startOfWeek,
  today,
} from "@internationalized/date";
import * as calendarStories from "@stories/calendar/calendar.stories";
import { composeStories } from "@storybook/react";
import { formatDate, getCurrentLocale } from "@salt-ds/lab";
import {
  checkAccessibility
} from "../../../../../../cypress/tests/checkAccessibility";

const {
  Single,
  CustomDayRender,
  CustomHeader,
  HideYearDropdown,
  MinMaxDates,
  TwinCalendars,
  WithLocaleES
} = composeStories(calendarStories);

describe("GIVEN a Calendar", () => {

  checkAccessibility(calendarStories);

  const testDate = parseDate("2022-02-03");
  const localTimeZone = getLocalTimeZone();
  const currentLocale = navigator.languages[0];

  const formatDay = (date: DateValue) => {
    return formatDate(date, currentLocale, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  describe("Today's Date", () => {
    it("SHOULD set `aria-current=date` on today's date", () => {
      cy.mount(<Single />);
      cy.findByRole("application").should("exist");
      cy.findByRole("application").should(
        "have.accessibleName",
        formatDate(today(localTimeZone), currentLocale, {
          day: undefined,
          month: "long",
          year: "numeric",
        }),
      );
      cy.findByRole("button", {
        name: formatDay(today(localTimeZone)),
      }).should("have.attr", "aria-current", "date");
    });
  });
  describe("Navigation", () => {
    describe("Buttons", () => {
      it("SHOULD navigate to the previous month when the previous month button is clicked", () => {
        cy.mount(<Single defaultVisibleMonth={testDate} />);
        cy.findByRole("button", {
          name: "Previous Month",
        }).realClick();

        cy.findByRole("button", {
          name: formatDay(testDate.subtract({ months: 1 })),
        }).should("be.visible");
      });

      it("SHOULD navigate to the next month when the next month button is clicked", () => {
        cy.mount(<Single defaultVisibleMonth={testDate} />);
        cy.findByRole("button", {
          name: "Next Month",
        }).realClick();

        cy.findByRole("button", {
          name: formatDay(testDate.add({ months: 1 })),
        }).should("be.visible");
      });
    });

    describe("Dropdowns", () => {
      it("SHOULD navigate to the selected month when using the month dropdown", () => {
        cy.mount(<Single defaultVisibleMonth={testDate} />);
        cy.findByRole("combobox", { name: "Month Dropdown" }).should(
          "have.text",
          formatDate(testDate, currentLocale, {
            day: undefined,
            month: "short",
            year: undefined,
          }),
        );
        cy.findByRole("combobox", {
          name: "Month Dropdown",
        }).realClick();
        cy.findByRole("option", {
          name: formatDate(testDate.set({ month: 4 }), currentLocale, {
            day: undefined,
            month: "short",
            year: undefined,
          }),
        })
          .realHover()
          .realClick();
        cy.findByRole("combobox", { name: "Month Dropdown" }).should(
          "have.text",
          formatDate(testDate.set({ month: 4 }), currentLocale, {
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
        cy.mount(<Single defaultVisibleMonth={testDate} />);
        cy.findByRole("combobox", { name: "Year Dropdown" }).should(
          "have.text",
          formatDate(testDate, currentLocale, {
            day: undefined,
            month: undefined,
            year: "numeric",
          }),
        );
        cy.findByRole("combobox", {
          name: "Year Dropdown",
        }).realClick();
        cy.findByRole("option", {
          name: formatDate(testDate.add({ years: 1 }), currentLocale, {
            day: undefined,
            month: undefined,
            year: "numeric",
          }),
        })
          .realHover()
          .realClick();
        cy.findByRole("combobox", { name: "Year Dropdown" }).should(
          "have.text",
          formatDate(testDate.add({ years: 1 }), currentLocale, {
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
        cy.mount(<Single defaultVisibleMonth={testDate} />);
        cy.findByRole("combobox", { name: "Month Dropdown" }).should(
          "have.text",
          formatDate(testDate, currentLocale, {
            day: undefined,
            month: "short",
            year: undefined,
          }),
        );
        cy.findByRole("button", {
          name: formatDay(endOfMonth(testDate).add({ days: 1 })),
        }).realClick();
        cy.findByRole("combobox", { name: "Month Dropdown" }).should(
          "have.text",
          formatDate(testDate.add({ months: 1 }), currentLocale, {
            day: undefined,
            month: "short",
            year: undefined,
          }),
        );
      });
    });

    describe("Keyboard", () => {
      it("SHOULD move the focus when the arrow keys are pressed", () => {
        cy.mount(<Single defaultVisibleMonth={testDate} />);

        cy.findByRole("button", {
          name: formatDay(testDate),
        }).focus();
        cy.findByRole("button", {
          name: formatDay(testDate),
        }).should("be.focused");

        cy.realPress("ArrowRight");
        cy.findByRole("button", {
          name: formatDay(testDate.add({ days: 1 })),
        }).should("be.visible");

        cy.realPress("ArrowLeft");
        cy.findByRole("button", {
          name: formatDay(testDate),
        }).should("be.visible");

        cy.realPress("ArrowDown");
        cy.findByRole("button", {
          name: formatDay(testDate.add({ weeks: 1 })),
        }).should("be.visible");

        cy.realPress("ArrowUp");
        cy.findByRole("button", {
          name: formatDay(testDate),
        }).should("be.visible");
      });

      describe("SHOULD move the focus when the shortcut keys are pressed", () => {
        beforeEach(() => {
          cy.mount(<Single defaultVisibleMonth={testDate} />);

          cy.findByRole("button", {
            name: formatDay(testDate),
          }).focus();

          cy.findByRole("button", {
            name: formatDay(testDate),
          }).should("be.focused");
        });

        it("HOME", () => {
          cy.realPress("Home").then(() => {
            cy.findByRole("button", {
              name: formatDay(startOfWeek(testDate, currentLocale)),
            }).should("be.focused");
          });
        });

        it("END", () => {
          cy.realPress("End").then(() => {
            cy.findByRole("button", {
              name: formatDay(endOfWeek(testDate, currentLocale)),
            }).should("be.focused");
          });
        });

        it("PageUp", () => {
          cy.realPress("PageUp").then(() => {
            cy.findByRole("button", {
              name: formatDay(testDate.subtract({ months: 1 })),
            }).should("be.focused");
          });
        });

        it("PageDown", () => {
          cy.realPress("PageDown").then(() => {
            cy.findByRole("button", {
              name: formatDay(testDate.add({ months: 1 })),
            }).should("be.focused");
          });
        });

        it("Shift PageUp", () => {
          cy.realPress(["Shift", "PageUp"]).then(() => {
            cy.findByRole("button", {
              name: formatDay(testDate.subtract({ years: 1 })),
            }).should("be.focused");
          });
        });

        it("Shift PageDown", () => {
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
      cy.mount(<HideYearDropdown defaultVisibleMonth={testDate} />);
      cy.findByRole("combobox", { name: "Year Dropdown" }).should("not.exist");

      cy.findByRole("combobox", { name: "Month Dropdown" }).should(
        "have.text",
        formatDate(testDate, currentLocale, {
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
        name: formatDate(followingQuarter, currentLocale, {
          day: undefined,
          month: "long",
          year: undefined,
        }),
      })
        .realHover()
        .realClick();
      cy.findByRole("combobox", { name: "Month Dropdown" }).should(
        "have.text",
        formatDate(followingQuarter, currentLocale, {
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
      cy.mount(<CustomHeader defaultVisibleMonth={testDate} />);
      cy.findByRole("button", { name: /Today/i }).click();
      cy.findByRole("button", {
        name: formatDay(today(getLocalTimeZone())),
      }).should("have.attr", "aria-current", "date");
    });
    it("SHOULD render custom day", () => {
      cy.mount(<CustomDayRender defaultVisibleMonth={testDate} />);
      cy.contains("button", /01/).should("exist");
    });
    it("SHOULD support multi-calendar selection", () => {
      const startDate = testDate;
      const endDate = testDate.add({ months: 1 });
      cy.mount(
        <TwinCalendars
          selectionVariant={"range"}
          defaultSelectedDate={{ startDate, endDate }}
        />,
      );
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
      cy.mount(<WithLocaleES locale={"es-ES"}/>);
      cy.findByRole("combobox", {name: "Month Dropdown"}).should(
        "have.text",
        formatDate(today(getLocalTimeZone()), "es-ES", {
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
        <MinMaxDates
          defaultVisibleMonth={testDate}
          minDate={startOfMonth(testDate).add({days: 1})}
          maxDate={endOfMonth(testDate).subtract({days: 1})}
        />,
      );
      cy.findByRole("combobox", {name: "Month Dropdown"}).should(
        "have.text",
        formatDate(testDate, currentLocale, {
          day: undefined,
          month: "short",
          year: undefined,
        }),
      );
      cy.findByRole("combobox", {
        name: "Month Dropdown",
      }).realClick();
      cy.findByRole("option", {
        name: formatDate(testDate.set({month: 1}), currentLocale, {
          day: undefined,
          month: "short",
          year: undefined,
        }),
      }).should("have.attr", "aria-disabled", "true");
      cy.findByRole("option", {
        name: formatDate(testDate.set({month: 2}), currentLocale, {
          day: undefined,
          month: "short",
          year: undefined,
        }),
      }).should("have.attr", "aria-selected", "true");
      for (let monthIndex = 3; monthIndex < 12; monthIndex++) {
        cy.findByRole("option", {
          name: formatDate(
            testDate.set({month: monthIndex}),
            currentLocale,
            {
              day: undefined,
              month: "short",
              year: undefined,
            },
          ),
        }).should("have.attr", "aria-disabled", "true");
      }
      cy.findByRole("combobox", {
        name: "Year Dropdown",
      }).realClick();
      cy.findAllByRole("option").should("have.length", 1);
      cy.findByRole("option", {
        name: formatDate(testDate, currentLocale, {
          day: undefined,
          month: undefined,
          year: "numeric",
        }),
      }).should("exist");
      cy.findByRole("button", {
        name: formatDay(startOfMonth(testDate)),
      }).should("have.attr", "aria-disabled", "true");
      cy.findByRole("button", {
        name: formatDay(endOfMonth(testDate)),
      }).should("have.attr", "aria-disabled", "true");
    });
  });
});
