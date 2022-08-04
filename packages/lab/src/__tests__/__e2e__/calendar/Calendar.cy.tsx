import { composeStories } from "@storybook/testing-react";
import * as calendarStories from "@stories/calendar.stories";

const {
  DefaultCalendar,
  MultiSelection,
  OffsetSelection,
  RangeSelection,
  UnselectableHighEmphasisDates,
  UnselectableLowEmphasisDates,
  CustomFirstDayOfWeek,
  CustomDayRender,
  NavigationBlocked,
  HideOutOfRangeDays,
} = composeStories(calendarStories);
import dayjs from "../../../calendar/internal/dayjs";

const formatDate = (date: dayjs.Dayjs) => {
  return date.format("dddd, LL");
};

const testDate = dayjs("2022-01-01T00:00:00.000");
const testDateDate = testDate.toDate();

describe("GIVEN a Calendar component", () => {
  describe("Today's Date", () => {
    it("SHOULD set `aria-current=date` on today's date", () => {
      cy.mount(<DefaultCalendar />);
      cy.findByRole("button", {
        name: formatDate(dayjs()),
      }).should("have.attr", "aria-current", "date");
    });
  });

  describe("Navigation", () => {
    describe("Buttons", () => {
      it("SHOULD navigate to the previous month when the previous month button is clicked", () => {
        cy.mount(<DefaultCalendar initialVisibleMonth={testDateDate} />);
        cy.findByRole("button", {
          name: `Previous Month, ${testDate
            .subtract(1, "month")
            .format("MMMM YYYY")}`,
        }).realClick();

        cy.findByRole("button", {
          name: formatDate(testDate.subtract(1, "month")),
        }).should("be.visible");
      });

      it("SHOULD navigate to the next month when the next month button is clicked", () => {
        cy.mount(<DefaultCalendar initialVisibleMonth={testDateDate} />);
        cy.findByRole("button", {
          name: `Next Month, ${testDate.add(1, "month").format("MMMM YYYY")}`,
        }).realClick();

        cy.findByRole("button", {
          name: formatDate(testDate.add(1, "month")),
        }).should("be.visible");
      });
    });

    describe("Dropdowns", () => {
      it("SHOULD navigate to the selected month when using the month dropdown", () => {
        cy.mount(<DefaultCalendar initialVisibleMonth={testDateDate} />);
        cy.findByRole("option", { name: testDate.format("MMM") }).should(
          "be.visible"
        );
        cy.findByRole("listbox", {
          name: "Month Dropdown",
        }).realClick();
        cy.findByRole("option", {
          name: testDate.set("month", 4).format("MMM"),
        })
          .realHover()
          .realClick();
        cy.findByRole("option", {
          name: testDate.set("month", 4).format("MMM"),
        }).should("be.visible");
        cy.findByRole("button", {
          name: formatDate(testDate.set("month", 4)),
        }).should("be.visible");
      });

      it("SHOULD navigate to the selected year when using the year dropdown", () => {
        cy.mount(<DefaultCalendar initialVisibleMonth={testDateDate} />);
        cy.findByRole("option", { name: testDate.format("YYYY") }).should(
          "be.visible"
        );
        cy.findByRole("listbox", {
          name: "Year Dropdown",
        }).realClick();
        cy.findByRole("option", {
          name: testDate.add(1, "year").format("YYYY"),
        })
          .realHover()
          .realClick();
        cy.findByRole("option", {
          name: testDate.add(1, "year").format("YYYY"),
        }).should("be.visible");
        cy.findByRole("button", {
          name: formatDate(testDate.add(1, "year")),
        }).should("be.visible");
      });
    });

    describe("Clicking", () => {
      it("SHOULD navigate to the next month when clicking out of range dates", () => {
        cy.mount(<DefaultCalendar initialVisibleMonth={testDateDate} />);
        cy.findByRole("option", {
          name: testDate.format("MMM"),
        }).should("be.visible");
        cy.findByRole("button", {
          name: formatDate(testDate.endOf("month").add(1, "day")),
        }).realClick();
        cy.findByRole("option", {
          name: testDate.add(1, "month").format("MMM"),
        }).should("be.visible");
      });
    });

    describe("Keyboard", () => {
      it("SHOULD move the focus when the arrow keys are pressed", () => {
        cy.mount(<DefaultCalendar initialVisibleMonth={testDateDate} />);

        cy.findByRole("button", {
          name: formatDate(testDate),
        }).focus();
        cy.findByRole("button", {
          name: formatDate(testDate),
        }).should("be.focused");

        cy.realPress("ArrowRight");
        cy.findByRole("button", {
          name: formatDate(testDate.add(1, "day")),
        }).should("be.visible");

        cy.realPress("ArrowLeft");
        cy.findByRole("button", {
          name: formatDate(testDate),
        }).should("be.visible");

        cy.realPress("ArrowDown");
        cy.findByRole("button", {
          name: formatDate(testDate.add(1, "week")),
        }).should("be.visible");

        cy.realPress("ArrowUp");
        cy.findByRole("button", {
          name: formatDate(testDate),
        }).should("be.visible");
      });

      it("SHOULD move the focus when the shortcut keys are pressed", () => {
        cy.mount(<DefaultCalendar initialVisibleMonth={testDateDate} />);

        cy.findByRole("button", {
          name: formatDate(testDate),
        }).focus();

        cy.findByRole("button", {
          name: formatDate(testDate),
        }).should("be.focused");

        cy.realPress("Home");
        cy.findByRole("button", {
          name: formatDate(testDate.startOf("week")),
        }).should("be.focused");

        cy.realPress("End");
        cy.findByRole("button", {
          name: formatDate(testDate.endOf("week")),
        }).should("be.focused");

        //RESET
        cy.findByRole("button", {
          name: formatDate(testDate),
        }).focus();

        cy.findByRole("button", {
          name: formatDate(testDate),
        }).should("be.focused");

        cy.realPress("PageUp");
        cy.findByRole("button", {
          name: formatDate(testDate.subtract(1, "month")),
        }).should("be.focused");

        cy.realPress("PageDown");
        cy.findByRole("button", {
          name: formatDate(testDate),
        }).should("be.focused");

        cy.realPress(["Shift", "PageUp"]);
        cy.findByRole("button", {
          name: formatDate(testDate.subtract(1, "year")),
        }).should("be.focused");

        cy.realPress(["Shift", "PageDown"]);
        cy.findByRole("button", {
          name: formatDate(testDate),
        }).should("be.focused");
      });
    });
  });

  describe("Single Selection", () => {
    it("SHOULD hover one day when a day is hovered", () => {
      cy.mount(<DefaultCalendar initialVisibleMonth={testDateDate} />);
      cy.findByRole("button", {
        name: formatDate(testDate),
      }).realHover({ position: "bottom" });
      cy.findByRole("button", {
        name: formatDate(testDate),
      }).should("have.class", "uitkCalendarDay-hovered");

      cy.get("body").realHover({ position: "topLeft" });
      cy.get(".uitkCalendarDay-hovered").should("not.exist");
    });
    it("SHOULD only allow one date to be selected at a time", () => {
      cy.mount(<DefaultCalendar initialVisibleMonth={testDateDate} />);
      cy.findByRole("button", { name: formatDate(testDate) }).realClick();
      cy.findByRole("button", { name: formatDate(testDate) }).should(
        "have.attr",
        "aria-pressed",
        "true"
      );

      cy.findByRole("button", {
        name: formatDate(testDate.add(1, "day")),
      }).realClick();
      cy.findByRole("button", { name: formatDate(testDate) }).should(
        "not.have.attr",
        "aria-pressed"
      );
      cy.findByRole("button", {
        name: formatDate(testDate.add(1, "day")),
      }).should("have.attr", "aria-pressed", "true");
      cy.realPress("ArrowRight");
      cy.realPress("Enter");
      cy.findByRole("button", {
        name: formatDate(testDate.add(2, "day")),
      }).should("have.attr", "aria-pressed", "true");
    });

    it("SHOULD not allow deselection", () => {
      cy.mount(<DefaultCalendar initialVisibleMonth={testDateDate} />);
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
      cy.mount(<MultiSelection initialVisibleMonth={testDateDate} />);
      cy.findByRole("button", { name: formatDate(testDate) }).realClick();
      cy.findByRole("button", { name: formatDate(testDate) }).should(
        "have.attr",
        "aria-pressed",
        "true"
      );

      cy.findByRole("button", {
        name: formatDate(testDate.add(1, "day")),
      }).realClick();
      cy.findByRole("button", {
        name: formatDate(testDate.add(1, "day")),
      }).should("have.attr", "aria-pressed", "true");
      cy.findByRole("button", {
        name: formatDate(testDate.add(1, "day")),
      }).should("have.attr", "aria-pressed", "true");

      cy.findByRole("button", {
        name: formatDate(testDate.add(1, "day")),
      }).realClick();
      cy.findByRole("button", {
        name: formatDate(testDate),
      }).realClick();
      cy.findByRole("button", {
        name: formatDate(testDate),
      }).should("not.have.attr", "aria-pressed");
      cy.findByRole("button", {
        name: formatDate(testDate.add(1, "day")),
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
        name: formatDate(testDate.add(1, "day")),
      }).should("have.attr", "aria-pressed", "true");
    });
  });

  function getAllDatesInRange(startDate: Date, endDate: Date) {
    const count = dayjs(startDate).diff(endDate, "days");
    const dates = [];
    for (let i = 0; i < count; i++) {
      dates.push(dayjs(startDate).add(count, "days").toDate());
    }
    return dates;
  }

  describe("Offset Selection", () => {
    it("SHOULD allow a defined range to be selected", () => {
      cy.mount(<OffsetSelection initialVisibleMonth={testDateDate} />);
      const baseDate = testDate.add(3, "days");
      const datesInRange = getAllDatesInRange(
        // @ts-ignore
        OffsetSelection.args?.startDateOffset(baseDate),
        // @ts-ignore
        OffsetSelection.args?.endDateOffset(baseDate)
      );
      cy.findByRole("button", {
        name: formatDate(baseDate),
      }).realHover();
      for (let dateInRange of datesInRange) {
        cy.findByRole("button", {
          name: formatDate(dayjs(dateInRange)),
        }).should("have.class", "uitkCalendarDay-hoveredOffset");
      }

      cy.findByRole("button", {
        name: formatDate(baseDate),
      }).realClick();

      for (let dateInRange of datesInRange) {
        cy.findByRole("button", {
          name: formatDate(dayjs(dateInRange)),
        }).should("have.attr", "aria-pressed", "true");
      }

      const newBaseDate = baseDate.add(1, "week");
      const datesInNewRange = getAllDatesInRange(
        // @ts-ignore
        OffsetSelection.args?.startDateOffset(newBaseDate),
        // @ts-ignore
        OffsetSelection.args?.endDateOffset(newBaseDate)
      );

      cy.findByRole("button", {
        name: formatDate(baseDate.add(1, "week")),
      }).realClick();
      for (let dateInRange of datesInNewRange) {
        cy.findByRole("button", {
          name: formatDate(dayjs(dateInRange)),
        }).should("have.attr", "aria-pressed", "true");
      }

      for (let dateInRange of datesInRange) {
        cy.findByRole("button", {
          name: formatDate(dayjs(dateInRange)),
        }).should("not.have.attr", "aria-pressed");
      }

      cy.realPress("ArrowUp");
      cy.realPress("Enter");
      for (let dateInRange of datesInRange) {
        cy.findByRole("button", {
          name: formatDate(dayjs(dateInRange)),
        }).should("have.attr", "aria-pressed", "true");
      }
    });
  });

  describe("Range Selection", () => {
    it("SHOULD allow a range to be selected", () => {
      cy.mount(<RangeSelection initialVisibleMonth={testDateDate} />);
      cy.findByRole("button", { name: formatDate(testDate) }).realClick();
      cy.findByRole("button", {
        name: formatDate(testDate),
      }).should("have.attr", "aria-pressed", "true");

      cy.findByRole("button", {
        name: formatDate(testDate.add(2, "days")),
      }).realHover();
      cy.findByRole("button", {
        name: formatDate(testDate.add(1, "days")),
      }).should("have.class", "uitkCalendarDay-hoveredSpan");
      cy.findByRole("button", {
        name: formatDate(testDate.add(2, "days")),
      }).should("have.class", "uitkCalendarDay-hoveredSpan");

      cy.findByRole("button", {
        name: formatDate(testDate.add(2, "days")),
      }).realClick();
      cy.findByRole("button", {
        name: formatDate(testDate),
      })
        .should("have.attr", "aria-pressed", "true")
        .and("have.class", "uitkCalendarDay-selectedStart");
      cy.findByRole("button", {
        name: formatDate(testDate.add(1, "days")),
      })
        .should("have.attr", "aria-pressed", "true")
        .and("have.class", "uitkCalendarDay-selectedSpan");
      cy.findByRole("button", {
        name: formatDate(testDate.add(2, "days")),
      })
        .should("have.attr", "aria-pressed", "true")
        .and("have.class", "uitkCalendarDay-selectedEnd");

      cy.findByRole("button", {
        name: formatDate(testDate.add(1, "week")),
      }).realClick();
      cy.findByRole("button", {
        name: formatDate(testDate.add(1, "week")),
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
      cy.get(".uitkCalendarDay-hoveredSpan").should("not.exist");
      cy.realPress("Enter");
      cy.findByRole("button", {
        name: formatDate(testDate),
      })
        .should("have.attr", "aria-pressed", "true")
        .and("have.class", "uitkCalendarDay-selectedStart");
      cy.findByRole("button", {
        name: formatDate(testDate.add(1, "days")),
      })
        .should("have.attr", "aria-pressed", "true")
        .and("have.class", "uitkCalendarDay-selectedSpan");
      cy.findByRole("button", {
        name: formatDate(testDate.add(2, "days")),
      })
        .should("have.attr", "aria-pressed", "true")
        .and("have.class", "uitkCalendarDay-selectedEnd");
    });
  });

  describe("Unselectable Days", () => {
    describe("Low Emphasis", () => {
      it("SHOULD apply `aria-disabled=true` to unselectable days", () => {
        cy.mount(
          <UnselectableLowEmphasisDates initialVisibleMonth={testDateDate} />
        );
        cy.findByRole("button", {
          name: formatDate(testDate.endOf("week")),
        }).should("have.attr", "aria-disabled", "true");

        cy.findByRole("button", {
          name: formatDate(testDate.endOf("week")),
        }).realClick();
        cy.findByRole("button", {
          name: formatDate(testDate.endOf("week")),
        }).should("not.have", "aria-pressed", "true");
      });
    });

    describe("High Emphasis", () => {
      it("SHOULD apply `aria-disabled=true` to unselectable days", () => {
        cy.mount(
          <UnselectableHighEmphasisDates initialVisibleMonth={testDateDate} />
        );
        cy.findByRole("button", {
          name: formatDate(testDate),
        }).should("have.attr", "aria-disabled", "true");

        cy.findByRole("button", {
          name: formatDate(testDate.endOf("week")),
        }).realClick();
        cy.findByRole("button", {
          name: formatDate(testDate),
        }).should("not.have", "aria-pressed", "true");
      });

      it("SHOULD allow a tooltip to be shown", () => {
        cy.mount(
          <UnselectableHighEmphasisDates
            initialVisibleMonth={testDateDate}
            // @ts-expect-error `data-*` attributes are not recognized in props objects
            TooltipProps={{ "data-testid": "tooltip" }}
          />
        );
        cy.findByRole("button", {
          name: formatDate(testDate),
        }).realHover();

        cy.findByTestId("tooltip").should(
          "have.text",
          UnselectableHighEmphasisDates.args?.isDayUnselectable?.(
            testDateDate
            // @ts-ignore
          )?.tooltip
        );
      });
    });
  });

  describe("Custom first day of the week", () => {
    it("SHOULD allow you to change the first day of the week", () => {
      cy.mount(<CustomFirstDayOfWeek initialVisibleMonth={testDateDate} />);
      cy.findByTestId("CalendarWeekHeader").should(
        "have.text",
        "SuMoTuWeThFrSa"
      );
      cy.findAllByTestId("CalendarDateGrid")
        .eq(1)
        .findAllByRole("button")
        .first()
        .should(
          "have.accessibleName",
          formatDate(
            testDate
              .startOf("month")
              .startOf("week")
              .add(-1 + (CustomFirstDayOfWeek.args!.firstDayOfWeek || 0), "day")
          )
        );
    });
  });

  describe("Custom Day Render", () => {
    it("SHOULD allow custom day contents", () => {
      cy.mount(<CustomDayRender initialVisibleMonth={testDateDate} />);
      cy.findByRole("button", {
        name: formatDate(testDate),
      }).should("have.text", testDate.format("ddd"));
    });
  });

  describe("Navigation Blocked", () => {
    it("SHOULD prevent navigation past a minimum date and maximum date", () => {
      const minDate = testDate.subtract(2, "month").toDate();
      const maxDate = testDate.add(2, "month").toDate();
      cy.mount(
        <NavigationBlocked
          initialVisibleMonth={testDateDate}
          minDate={minDate}
          maxDate={maxDate}
        />
      );
      cy.findByRole("button", {
        name: `Previous Month, ${testDate
          .subtract(1, "month")
          .format("MMMM YYYY")}`,
      }).realClick();
      cy.findByRole("button", {
        name: `Previous Month, ${testDate
          .subtract(2, "month")
          .format("MMMM YYYY")}`,
      }).realClick();
      cy.findByRole("button", {
        name: `Previous Month, ${testDate
          .subtract(3, "month")
          .format("MMMM YYYY")}`,
      }).should("be.disabled");

      cy.findByRole("listbox", { name: "Month Dropdown" }).realClick();
      cy.findByTestId("dropdown-list")
        .findAllByRole("option")
        .filter("[aria-disabled=true]")
        .should("have.length", 10);

      cy.findByRole("button", {
        name: `Next Month, ${testDate
          .subtract(1, "month")
          .format("MMMM YYYY")}`,
      }).realClick();
      cy.findByRole("button", {
        name: `Next Month, ${testDate.format("MMMM YYYY")}`,
      }).realClick();
      cy.findByRole("button", {
        name: `Next Month, ${testDate.add(1, "month").format("MMMM YYYY")}`,
      }).realClick();
      cy.findByRole("button", {
        name: `Next Month, ${testDate.add(2, "month").format("MMMM YYYY")}`,
      }).realClick();
      cy.findByRole("button", {
        name: `Next Month, ${testDate.add(3, "month").format("MMMM YYYY")}`,
      }).should("be.disabled");

      cy.findByRole("listbox", { name: "Month Dropdown" }).realClick();
      cy.findByTestId("dropdown-list")
        .findAllByRole("option")
        .filter("[aria-disabled=true]")
        .should("have.length", 9);
      cy.realPress("Escape");

      cy.findByRole("listbox", { name: "Year Dropdown" }).realClick();
      cy.findByTestId("dropdown-list")
        .findAllByRole("option")
        .should("have.length", 2);

      cy.findByRole("button", {
        name: `Previous Month, ${testDate.add(1, "month").format("MMMM YYYY")}`,
      }).realClick();
    });
  });

  describe("Hide out of range days", () => {
    it("SHOULD hide the days not in the current month from be displayed when set to true", () => {
      cy.mount(<HideOutOfRangeDays initialVisibleMonth={testDateDate} />);
      const lastPreviousOutOfRangeDate = formatDate(
        dayjs("2021-12-31T00:00:00.000")
      );
      cy.get(`[aria-label="${lastPreviousOutOfRangeDate}"]`)
        .eq(1)
        .should("not.be.visible")
        .and("have.attr", "aria-hidden", "true");

      const firstNextOutOfRangeDate = formatDate(
        dayjs("2022-02-01T00:00:00.000")
      );
      cy.get(`[aria-label="${firstNextOutOfRangeDate}"]`)
        .eq(0)
        .should("not.be.visible")
        .and("have.attr", "aria-hidden", "true");
    });
  });
});
