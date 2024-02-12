import { composeStories } from "@storybook/react";
import * as calendarStories from "@stories/calendar/calendar.stories";
import {
  DateFormatter,
  DateValue,
  endOfMonth,
  endOfWeek,
  endOfYear,
  getLocalTimeZone,
  parseDate,
  startOfMonth,
  startOfWeek,
  startOfYear,
  today,
} from "@internationalized/date";

const {
  Default,
  MultiSelection,
  OffsetSelection,
  RangeSelection,
  UnselectableDates,
  CustomDayRender,
  NavigationBlocked,
  HideOutOfRangeDays,
} = composeStories(calendarStories);

const testDate = parseDate("2022-01-01");
const localTimeZone = getLocalTimeZone();
const currentLocale = navigator.languages[0];

const formatDate = (date: DateValue, options?: Intl.DateTimeFormatOptions) => {
  const formatter = new DateFormatter(currentLocale, options);
  return formatter.format(date.toDate(localTimeZone));
};

describe("GIVEN a Calendar", () => {
  describe("Today's Date", () => {
    it("SHOULD set `aria-current=date` on today's date", () => {
      cy.mount(<Default />);
      cy.findByRole("button", {
        name: formatDate(today(localTimeZone)),
      }).should("have.attr", "aria-current", "date");
    });
  });

  describe("Navigation", () => {
    describe("Buttons", () => {
      it("SHOULD navigate to the previous month when the previous month button is clicked", () => {
        cy.mount(<Default defaultVisibleMonth={testDate} />);
        cy.findByRole("button", {
          name: `Previous Month, ${formatDate(
            testDate.subtract({ months: 1 })
          )}`,
        }).realClick();

        cy.findByRole("button", {
          name: formatDate(testDate.subtract({ months: 1 })),
        }).should("be.visible");
      });

      it("SHOULD navigate to the next month when the next month button is clicked", () => {
        cy.mount(<Default defaultVisibleMonth={testDate} />);
        cy.findByRole("button", {
          name: `Next Month, ${formatDate(testDate.add({ months: 1 }))}`,
        }).realClick();

        cy.findByRole("button", {
          name: formatDate(testDate.add({ months: 1 })),
        }).should("be.visible");
      });
    });

    describe("Dropdowns", () => {
      it("SHOULD navigate to the selected month when using the month dropdown", () => {
        cy.mount(<Default defaultVisibleMonth={testDate} />);
        cy.findByRole("combobox", { name: "Month Dropdown" }).should(
          "have.text",
          formatDate(testDate, { month: "short" })
        );
        cy.findByRole("combobox", {
          name: "Month Dropdown",
        }).realClick();
        cy.findByRole("option", {
          name: formatDate(testDate.set({ month: 4 }), { month: "short" }),
        })
          .realHover()
          .realClick();
        cy.findByRole("combobox", { name: "Month Dropdown" }).should(
          "have.text",
          formatDate(testDate.set({ month: 4 }), { month: "short" })
        );
        cy.findByRole("button", {
          name: formatDate(testDate.set({ month: 4 })),
        }).should("be.visible");
      });

      it("SHOULD navigate to the selected year when using the year dropdown", () => {
        cy.mount(<Default defaultVisibleMonth={testDate} />);
        cy.findByRole("combobox", { name: "Year Dropdown" }).should(
          "have.text",
          formatDate(testDate, { year: "numeric" })
        );
        cy.findByRole("combobox", {
          name: "Year Dropdown",
        }).realClick();
        cy.findByRole("option", {
          name: formatDate(testDate.add({ years: 1 }), { year: "numeric" }),
        })
          .realHover()
          .realClick();
        cy.findByRole("combobox", { name: "Year Dropdown" }).should(
          "have.text",
          formatDate(testDate.add({ years: 1 }), { year: "numeric" })
        );
        cy.findByRole("button", {
          name: formatDate(testDate.add({ years: 1 })),
        }).should("be.visible");
      });
    });

    describe("Clicking", () => {
      it("SHOULD navigate to the next month when clicking out of range dates", () => {
        cy.mount(<Default defaultVisibleMonth={testDate} />);
        cy.findByRole("combobox", { name: "Month Dropdown" }).should(
          "have.text",
          formatDate(testDate, { month: "short" })
        );
        cy.findByRole("button", {
          name: formatDate(endOfMonth(testDate).add({ days: 1 })),
        }).realClick();
        cy.findByRole("combobox", { name: "Month Dropdown" }).should(
          "have.text",
          formatDate(testDate.add({ months: 1 }), { month: "short" })
        );
      });
    });

    describe("Keyboard", () => {
      it("SHOULD move the focus when the arrow keys are pressed", () => {
        cy.mount(<Default defaultVisibleMonth={testDate} />);

        cy.findByRole("button", {
          name: formatDate(testDate),
        }).focus();
        cy.findByRole("button", {
          name: formatDate(testDate),
        }).should("be.focused");

        cy.realPress("ArrowRight");
        cy.findByRole("button", {
          name: formatDate(testDate.add({ days: 1 })),
        }).should("be.visible");

        cy.realPress("ArrowLeft");
        cy.findByRole("button", {
          name: formatDate(testDate),
        }).should("be.visible");

        cy.realPress("ArrowDown");
        cy.findByRole("button", {
          name: formatDate(testDate.add({ weeks: 1 })),
        }).should("be.visible");

        cy.realPress("ArrowUp");
        cy.findByRole("button", {
          name: formatDate(testDate),
        }).should("be.visible");
      });

      describe("SHOULD move the focus when the shortcut keys are pressed", () => {
        beforeEach(() => {
          cy.mount(<Default defaultVisibleMonth={testDate} />);

          cy.findByRole("button", {
            name: formatDate(testDate),
          }).focus();

          cy.findByRole("button", {
            name: formatDate(testDate),
          }).should("be.focused");
        });

        it("HOME", () => {
          cy.realPress("Home").then(() => {
            cy.findByRole("button", {
              name: formatDate(startOfWeek(testDate, currentLocale)),
            }).should("be.focused");
          });
        });

        it("END", () => {
          cy.realPress("End").then(() => {
            cy.findByRole("button", {
              name: formatDate(endOfWeek(testDate, currentLocale)),
            }).should("be.focused");
          });
        });

        it("PageUp", () => {
          cy.realPress("PageUp").then(() => {
            cy.findByRole("button", {
              name: formatDate(testDate.subtract({ months: 1 })),
            }).should("be.focused");
          });
        });

        it("PageDown", () => {
          cy.realPress("PageDown").then(() => {
            cy.findByRole("button", {
              name: formatDate(testDate.add({ months: 1 })),
            }).should("be.focused");
          });
        });

        it("Shift PageUp", () => {
          cy.realPress(["Shift", "PageUp"]).then(() => {
            cy.findByRole("button", {
              name: formatDate(testDate.subtract({ years: 1 })),
            }).should("be.focused");
          });
        });

        it("Shift PageDown", () => {
          cy.realPress(["Shift", "PageDown"]).then(() => {
            cy.findByRole("button", {
              name: formatDate(testDate.add({ years: 1 })),
            }).should("be.focused");
          });
        });
      });
    });
  });

  describe("Single Selection", () => {
    it("SHOULD hover one day when a day is hovered", () => {
      cy.mount(<Default defaultVisibleMonth={testDate} />);
      cy.findByRole("button", {
        name: formatDate(testDate),
      }).realHover({ position: "bottom" });
      cy.findByRole("button", {
        name: formatDate(testDate),
      }).should("have.class", "saltCalendarDay-hovered");

      cy.get("body").realHover({ position: "topLeft" });
      cy.get(".saltCalendarDay-hovered").should("not.exist");
    });
    it("SHOULD only allow one date to be selected at a time", () => {
      cy.mount(<Default defaultVisibleMonth={testDate} />);
      cy.findByRole("button", { name: formatDate(testDate) }).realClick();
      cy.findByRole("button", { name: formatDate(testDate) }).should(
        "have.attr",
        "aria-pressed",
        "true"
      );

      cy.findByRole("button", {
        name: formatDate(testDate.add({ days: 1 })),
      }).realClick();
      cy.findByRole("button", { name: formatDate(testDate) }).should(
        "not.have.attr",
        "aria-pressed"
      );
      cy.findByRole("button", {
        name: formatDate(testDate.add({ days: 1 })),
      }).should("have.attr", "aria-pressed", "true");
      cy.realPress("ArrowRight");
      cy.realPress("Enter");
      cy.findByRole("button", {
        name: formatDate(testDate.add({ days: 2 })),
      }).should("have.attr", "aria-pressed", "true");
    });

    it("SHOULD not allow deselection", () => {
      cy.mount(<Default defaultVisibleMonth={testDate} />);
      cy.findByRole("button", { name: formatDate(testDate) }).realClick();
      cy.findByRole("button", { name: formatDate(testDate) }).realClick();
      cy.findByRole("button", { name: formatDate(testDate) }).should(
        "have.attr",
        "aria-pressed",
        "true"
      );
    });
  });

  describe("Multi-Selection", () => {
    it("SHOULD allow multiple dates to be selected and unselected", () => {
      cy.mount(<MultiSelection defaultVisibleMonth={testDate} />);
      cy.findByRole("button", { name: formatDate(testDate) }).realClick();
      cy.findByRole("button", { name: formatDate(testDate) }).should(
        "have.attr",
        "aria-pressed",
        "true"
      );

      cy.findByRole("button", {
        name: formatDate(testDate.add({ days: 1 })),
      }).realClick();
      cy.findByRole("button", {
        name: formatDate(testDate.add({ days: 1 })),
      }).should("have.attr", "aria-pressed", "true");
      cy.findByRole("button", {
        name: formatDate(testDate.add({ days: 1 })),
      }).should("have.attr", "aria-pressed", "true");

      cy.findByRole("button", {
        name: formatDate(testDate.add({ days: 1 })),
      }).realClick();
      cy.findByRole("button", {
        name: formatDate(testDate),
      }).realClick();
      cy.findByRole("button", {
        name: formatDate(testDate),
      }).should("not.have.attr", "aria-pressed");
      cy.findByRole("button", {
        name: formatDate(testDate.add({ days: 1 })),
      }).should("not.have.attr", "aria-pressed");

      cy.findByRole("button", {
        name: formatDate(testDate),
      }).should("be.focused");
      cy.realPress("Enter");
      cy.realPress("ArrowRight");
      cy.realPress("Enter");
      cy.findByRole("button", {
        name: formatDate(testDate),
      }).should("have.attr", "aria-pressed", "true");
      cy.findByRole("button", {
        name: formatDate(testDate.add({ days: 1 })),
      }).should("have.attr", "aria-pressed", "true");
    });
  });

  function getAllDatesInRange(startDate: DateValue, endDate: DateValue) {
    const dates = [];

    let currentDate = startDate;
    while (currentDate.compare(endDate) <= 0) {
      dates.push(startDate);
      currentDate = currentDate.add({ days: 1 });
    }
    return dates;
  }

  describe("Offset Selection", () => {
    it("SHOULD allow a defined range to be selected", () => {
      cy.mount(<OffsetSelection defaultVisibleMonth={testDate} />);
      const baseDate = testDate.add({ days: 3 });
      const datesInRange = getAllDatesInRange(
        // @ts-ignore
        baseDate,
        // @ts-ignore
        OffsetSelection.args?.endDateOffset(baseDate)
      );
      cy.findByRole("button", {
        name: formatDate(baseDate),
      }).realHover();
      for (let dateInRange of datesInRange) {
        cy.findByRole("button", {
          name: formatDate(dateInRange),
        }).should("have.class", "saltCalendarDay-hoveredOffset");
      }

      cy.findByRole("button", {
        name: formatDate(baseDate),
      }).realClick();

      for (let dateInRange of datesInRange) {
        cy.findByRole("button", {
          name: formatDate(dateInRange),
        }).should("have.attr", "aria-pressed", "true");
      }

      const newBaseDate = baseDate.add({ weeks: 1 });
      const datesInNewRange = getAllDatesInRange(
        newBaseDate,
        // @ts-ignore
        OffsetSelection.args?.endDateOffset(newBaseDate)
      );

      cy.findByRole("button", {
        name: formatDate(baseDate.add({ weeks: 1 })),
      }).realClick();
      for (let dateInRange of datesInNewRange) {
        cy.findByRole("button", {
          name: formatDate(dateInRange),
        }).should("have.attr", "aria-pressed", "true");
      }

      for (let dateInRange of datesInRange) {
        cy.findByRole("button", {
          name: formatDate(dateInRange),
        }).should("not.have.attr", "aria-pressed");
      }

      cy.realPress("ArrowUp");
      cy.realPress("Enter");
      for (let dateInRange of datesInRange) {
        cy.findByRole("button", {
          name: formatDate(dateInRange),
        }).should("have.attr", "aria-pressed", "true");
      }
    });
  });

  describe("Range Selection", () => {
    it("SHOULD allow a range to be selected", () => {
      cy.mount(<RangeSelection defaultVisibleMonth={testDate} />);
      cy.findByRole("button", { name: formatDate(testDate) }).realClick();
      cy.findByRole("button", {
        name: formatDate(testDate),
      }).should("have.attr", "aria-pressed", "true");

      cy.findByRole("button", {
        name: formatDate(testDate.add({ days: 2 })),
      }).realHover();
      cy.findByRole("button", {
        name: formatDate(testDate.add({ days: 1 })),
      }).should("have.class", "saltCalendarDay-hoveredSpan");
      cy.findByRole("button", {
        name: formatDate(testDate.add({ days: 2 })),
      }).should("have.class", "saltCalendarDay-hoveredSpan");

      cy.findByRole("button", {
        name: formatDate(testDate.add({ days: 2 })),
      }).realClick();
      cy.findByRole("button", {
        name: formatDate(testDate),
      })
        .should("have.attr", "aria-pressed", "true")
        .and("have.class", "saltCalendarDay-selectedStart");
      cy.findByRole("button", {
        name: formatDate(testDate.add({ days: 1 })),
      })
        .should("have.attr", "aria-pressed", "true")
        .and("have.class", "saltCalendarDay-selectedSpan");
      cy.findByRole("button", {
        name: formatDate(testDate.add({ days: 2 })),
      })
        .should("have.attr", "aria-pressed", "true")
        .and("have.class", "saltCalendarDay-selectedEnd");

      cy.findByRole("button", {
        name: formatDate(testDate.add({ weeks: 1 })),
      }).realClick();
      cy.findByRole("button", {
        name: formatDate(testDate.add({ weeks: 1 })),
      }).should("have.attr", "aria-pressed", "true");
      cy.findAllByRole("button", {
        pressed: true,
      }).should("have.length", 1);

      cy.findByRole("button", {
        name: formatDate(testDate),
      }).realClick();
      cy.findByRole("button", {
        name: formatDate(testDate),
      }).should("have.attr", "aria-pressed", "true");
      cy.findAllByRole("button", {
        pressed: true,
      }).should("have.length", 1);

      cy.realPress("ArrowRight");
      cy.realPress("ArrowRight");
      cy.get(".saltCalendarDay-hoveredSpan").should("not.exist");
      cy.realPress("Enter");
      cy.findByRole("button", {
        name: formatDate(testDate),
      })
        .should("have.attr", "aria-pressed", "true")
        .and("have.class", "saltCalendarDay-selectedStart");
      cy.findByRole("button", {
        name: formatDate(testDate.add({ days: 1 })),
      })
        .should("have.attr", "aria-pressed", "true")
        .and("have.class", "saltCalendarDay-selectedSpan");
      cy.findByRole("button", {
        name: formatDate(testDate.add({ days: 2 })),
      })
        .should("have.attr", "aria-pressed", "true")
        .and("have.class", "saltCalendarDay-selectedEnd");
    });
  });

  describe("Unselectable Days", () => {
    describe("Tertiary", () => {
      it("SHOULD apply `aria-disabled=true` to unselectable days", () => {
        cy.mount(<UnselectableDates defaultVisibleMonth={testDate} />);
        cy.findByRole("button", {
          name: formatDate(endOfWeek(testDate, currentLocale)),
        }).should("have.attr", "aria-disabled", "true");

        cy.findByRole("button", {
          name: formatDate(endOfWeek(testDate, currentLocale)),
        }).realClick();
        cy.findByRole("button", {
          name: formatDate(endOfWeek(testDate, currentLocale)),
        }).should("not.have", "aria-pressed", "true");
      });
    });

    describe("Secondary", () => {
      it("SHOULD apply `aria-disabled=true` to unselectable days", () => {
        cy.mount(<UnselectableDates defaultVisibleMonth={testDate} />);
        cy.findByRole("button", {
          name: formatDate(parseDate("2022-01-17")),
        }).should("have.attr", "aria-disabled", "true");

        cy.findByRole("button", {
          name: formatDate(parseDate("2022-01-17")),
        }).realClick();
        cy.findByRole("button", {
          name: formatDate(parseDate("2022-01-17")),
        }).should("not.have", "aria-pressed", "true");
      });

      it("SHOULD allow a tooltip to be shown", () => {
        cy.mount(<UnselectableDates defaultVisibleMonth={testDate} />);
        cy.findByRole("button", {
          name: formatDate(parseDate("2022-01-17")),
        }).realHover();

        cy.findByRole("tooltip").should(
          "have.text",
          UnselectableDates.args?.isDayUnselectable?.(
            parseDate("2022-01-17")
            // @ts-ignore
          )
        );
      });
    });
  });

  describe("Custom Day Render", () => {
    it("SHOULD allow custom day contents", () => {
      cy.mount(<CustomDayRender defaultVisibleMonth={testDate} />);
      cy.findByRole("button", {
        name: formatDate(testDate),
      }).should("have.text", formatDate(testDate, { day: "2-digit" }));
    });
  });

  describe("Navigation Blocked", () => {
    it("SHOULD prevent navigation past a minimum date and maximum date", () => {
      const minDate = testDate.subtract({ months: 2 });
      const maxDate = testDate.add({ months: 2 });
      cy.mount(
        <NavigationBlocked
          defaultVisibleMonth={testDate}
          minDate={minDate}
          maxDate={maxDate}
        />
      );
      cy.findByRole("button", {
        name: `Previous Month, ${formatDate(testDate.subtract({ months: 1 }))}`,
      }).realClick();
      cy.findByRole("button", {
        name: `Previous Month, ${formatDate(testDate.subtract({ months: 2 }))}`,
      }).realClick();
      cy.findByRole("button", {
        name: `Previous Month, ${formatDate(testDate.subtract({ months: 3 }))}`,
      }).should("have.attr", "aria-disabled", "true");
      cy.findByRole("button", {
        name: `Previous Month, ${formatDate(testDate.subtract({ months: 3 }))}`,
      }).realHover();
      cy.findByRole("tooltip").should(
        "have.text",
        "Past dates are out of range"
      );

      cy.findByRole("combobox", { name: "Month Dropdown" }).realClick();
      cy.findAllByRole("option")
        .filter("[aria-disabled=true]")
        .should("have.length", 10);

      cy.findAllByRole("option")
        .filter("[aria-disabled=true]")
        .eq(0)
        .realHover();

      cy.findByRole("tooltip").should(
        "have.text",
        "This month is out of range"
      );

      cy.findByRole("button", {
        name: `Next Month, ${formatDate(testDate.subtract({ months: 1 }))}`,
      }).realClick();
      cy.findByRole("button", {
        name: `Next Month, ${formatDate(testDate)}`,
      }).realClick();
      cy.findByRole("button", {
        name: `Next Month, ${formatDate(testDate.add({ months: 1 }))}`,
      }).realClick();
      cy.findByRole("button", {
        name: `Next Month, ${formatDate(testDate.add({ months: 2 }))}`,
      }).realClick();
      cy.findByRole("button", {
        name: `Next Month, ${formatDate(testDate.add({ months: 3 }))}`,
      }).should("have.attr", "aria-disabled", "true");
      cy.findByRole("button", {
        name: `Next Month, ${formatDate(testDate.add({ months: 3 }))}`,
      }).realHover();
      cy.findByRole("tooltip").should(
        "have.text",
        "Future dates are out of range"
      );

      cy.findByRole("combobox", { name: "Month Dropdown" }).realClick();
      cy.findAllByRole("option")
        .filter("[aria-disabled=true]")
        .should("have.length", 9);
      cy.realPress("Escape");

      cy.findByRole("combobox", { name: "Year Dropdown" }).realClick();
      cy.findAllByRole("option").should("have.length", 2);

      cy.findByRole("button", {
        name: `Previous Month, ${formatDate(testDate.add({ months: 1 }))}`,
      }).realClick();
    });
  });

  describe("Hide out of range days", () => {
    it("SHOULD hide the days not in the current month from be displayed when set to true", () => {
      cy.mount(<HideOutOfRangeDays defaultVisibleMonth={testDate} />);
      const lastPreviousOutOfRangeDate = formatDate(parseDate("2021-12-31"));
      cy.get(`[aria-label="${lastPreviousOutOfRangeDate}"]`)
        .eq(1)
        .should("not.be.visible")
        .and("have.attr", "aria-hidden", "true");

      const firstNextOutOfRangeDate = formatDate(parseDate("2022-02-01"));
      cy.get(`[aria-label="${firstNextOutOfRangeDate}"]`)
        .eq(0)
        .should("not.be.visible")
        .and("have.attr", "aria-hidden", "true");
    });
  });

  describe("Navigation Wrapping", () => {
    it("SHOULD wrap to the previous year", () => {
      const date = startOfYear(today(localTimeZone));
      cy.mount(<Default defaultVisibleMonth={date} />);
      cy.findByRole("button", {
        name: `Previous Month, ${formatDate(date.subtract({ months: 1 }))}`,
      }).realClick();

      cy.findByRole("button", {
        name: formatDate(date.subtract({ months: 1 })),
      }).should("be.visible");
    });

    it("SHOULD wrap to the next year", () => {
      const date = endOfYear(today(localTimeZone));
      cy.mount(<Default defaultVisibleMonth={date} />);
      cy.findByRole("button", {
        name: `Next Month, ${formatDate(
          startOfMonth(date.add({ months: 1 }))
        )}`,
      }).realClick();

      cy.findByRole("button", {
        name: formatDate(startOfMonth(date.add({ months: 1 }))),
      }).should("be.visible");
    });

    describe("WHEN `hideYearDropdown=true`", () => {
      it("SHOULD not wrap to the previous year", () => {
        const date = startOfYear(today(localTimeZone));
        cy.mount(<Default defaultVisibleMonth={date} hideYearDropdown />);
        cy.findByRole("button", {
          name: `Previous Month, ${formatDate(date.subtract({ months: 1 }))}`,
        }).realClick();

        cy.findByRole("button", {
          name: formatDate(date),
        }).should("be.visible");
        cy.findByRole("button", {
          name: `Previous Month, ${formatDate(date.subtract({ months: 1 }))}`,
        }).should("have.attr", "aria-disabled", "true");
        cy.findByRole("button", {
          name: `Previous Month, ${formatDate(date.subtract({ months: 1 }))}`,
        }).realHover();
        cy.findByRole("tooltip").should(
          "have.text",
          "Past dates are out of range"
        );
      });

      it("SHOULD not wrap to the next year", () => {
        const date = endOfYear(today(localTimeZone));
        cy.mount(<Default defaultVisibleMonth={date} hideYearDropdown />);
        cy.findByRole("button", {
          name: `Next Month, ${formatDate(
            startOfMonth(date.add({ months: 1 }))
          )}`,
        }).realClick();

        cy.findByRole("button", {
          name: formatDate(date),
        }).should("be.visible");
        cy.findByRole("button", {
          name: `Next Month, ${formatDate(
            startOfMonth(date.add({ months: 1 }))
          )}`,
        }).should("have.attr", "aria-disabled", "true");
        cy.findByRole("button", {
          name: `Next Month, ${formatDate(
            startOfMonth(date.add({ months: 1 }))
          )}`,
        }).realHover();
        cy.findByRole("tooltip").should(
          "have.text",
          "Future dates are out of range"
        );
      });
    });
  });
});
//TODO:remove testid for role checks where possible
