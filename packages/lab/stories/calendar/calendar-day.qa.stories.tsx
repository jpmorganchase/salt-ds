import { withDateMock } from ".storybook/decorators/withDateMock";
import { Calendar } from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";
import { CalendarDay } from "../../../lab/src/calendar/internal/CalendarDay";
import { useLocalization } from "../../src";
import "./calendar.stories.css";

export default {
  title: "Lab/Calendar/Calendar QA",
  component: CalendarDay,
  decorators: [withDateMock],
  globals: {
    a11y: {
      manual: true,
    },
  },
};

const QAContainerParameters = {
  chromatic: { disableSnapshot: false },
};

export const CalendayDaySingle: StoryFn<QAContainerProps> = () => {
  const { dateAdapter } = useLocalization();
  const date = dateAdapter.parse("2024-05-02", "YYYY-MM-DD").date;
  const month = dateAdapter.parse("2024-05-01", "YYYY-MM-DD").date;
  return (
    <Calendar selectionVariant={"single"}>
      <QAContainer
        cols={4}
        itemPadding={1}
        itemWidthAuto
        transposeDensity
        vertical
      >
        <div className={"saltCalendarMonth-single"}>
          <CalendarDay date={date} month={month} />
          <CalendarDay
            className={"saltCalendarDay saltCalendarDay-selected"}
            date={date}
            month={month}
          />
          <CalendarDay
            className={"saltCalendarDay saltCalendarDay-hovered"}
            date={date}
            month={month}
          />
          <CalendarDay
            className={"saltCalendarDay saltCalendarDay-outsideCurrentMonth"}
            date={date}
            month={month}
          />
          <CalendarDay
            className={"saltCalendarDay saltCalendarDay-unselectable"}
            date={date}
            month={month}
          />
          <CalendarDay
            className={"saltCalendarDay saltCalendarDay-outOfRange"}
            date={date}
            month={month}
          />
          <CalendarDay
            className={"saltCalendarDay saltCalendarDay-focused"}
            date={date}
            month={month}
          />
        </div>
      </QAContainer>
    </Calendar>
  );
};

CalendayDaySingle.parameters = {
  ...QAContainerParameters,
  dateLocale: "en-US",
  dateAdapter: "luxon",
};

export const CalendayDayRange: StoryFn<QAContainerProps> = () => {
  const { dateAdapter } = useLocalization();
  const date = dateAdapter.parse("2024-05-02", "YYYY-MM-DD").date;
  const month = dateAdapter.parse("2024-05-01", "YYYY-MM-DD").date;
  return (
    <Calendar selectionVariant={"range"}>
      <QAContainer
        cols={4}
        itemPadding={1}
        itemWidthAuto
        transposeDensity
        vertical
      >
        <div className={"saltCalendarMonth-range"}>
          <CalendarDay
            className={"saltCalendarDay saltCalendarDay-hoveredStart"}
            date={date}
            month={month}
          />
          <CalendarDay
            className={
              "saltCalendarDay saltCalendarDay-selectedStart saltCalendarDay-selectedEnd"
            }
            date={date}
            month={month}
          />
          <div className={"calendar-grid"}>
            <CalendarDay
              className={
                "saltCalendarDay saltCalendarDay-selectedStart saltCalendarDay-hoveredStart"
              }
              date={date}
              month={month}
            />
            <CalendarDay
              className={
                "saltCalendarDay saltCalendarDay-selectedSpan saltCalendarDay-hoveredSpan"
              }
              date={date}
              month={month}
            />
            <CalendarDay
              className={
                "saltCalendarDay saltCalendarDay-selectedEnd saltCalendarDay-hoveredEnd"
              }
              date={date}
              month={month}
            />
          </div>
          <div className={"calendar-grid"}>
            <CalendarDay
              className={
                "saltCalendarDay saltCalendarDay-selectedStart saltCalendarDay-hoveredStart"
              }
              date={date}
              month={month}
            />
            <CalendarDay
              className={
                "saltCalendarDay saltCalendarDay-hoveredSpan saltCalendarDay-hoveredEnd"
              }
              date={date}
              month={month}
            />
          </div>
          <div className={"calendar-grid"}>
            <CalendarDay
              className={
                "saltCalendarDay saltCalendarDay-selectedStart saltCalendarDay-hoveredStart"
              }
              date={date}
              month={month}
            />
            <CalendarDay
              className={"saltCalendarDay saltCalendarDay-hoveredSpan"}
              date={date}
              month={month}
            />
            <CalendarDay
              className={
                "saltCalendarDay saltCalendarDay-hoveredSpan saltCalendarDay-hoveredEnd"
              }
              date={date}
              month={month}
            />
          </div>
          <div className={"calendar-grid"}>
            <CalendarDay
              className={
                "saltCalendarDay saltCalendarDay-selectedStart saltCalendarDay-hoveredStart"
              }
              date={date}
              month={month}
            />
            <CalendarDay
              className={
                "saltCalendarDay saltCalendarDay-selectedSpan saltCalendarDay-hoveredSpan"
              }
              date={date}
              month={month}
            />
            <CalendarDay
              className={
                "saltCalendarDay saltCalendarDay-focused  saltCalendarDay-selectedEnd saltCalendarDay-hoveredEnd"
              }
              date={date}
              month={month}
            />
          </div>
          <div className={"calendar-grid"}>
            <CalendarDay
              className={
                "saltCalendarDay saltCalendarDay-selectedStart saltCalendarDay-focused"
              }
              date={date}
              month={month}
            />
            <CalendarDay
              className={"saltCalendarDay saltCalendarDay-selectedSpan"}
              date={date}
              month={month}
            />
            <CalendarDay
              className={"saltCalendarDay saltCalendarDay-selectedSpan"}
              date={date}
              month={month}
            />
            <CalendarDay
              className={"saltCalendarDay saltCalendarDay-selectedEnd"}
              date={date}
              month={month}
            />
          </div>
        </div>
      </QAContainer>
    </Calendar>
  );
};

CalendayDayRange.parameters = {
  ...QAContainerParameters,
  dateLocale: "en-US",
  dateAdapter: "luxon",
};

export const CalendayDayOffset: StoryFn<QAContainerProps> = () => {
  const { dateAdapter } = useLocalization();
  const date = dateAdapter.parse("2024-05-02", "YYYY-MM-DD").date;
  const month = dateAdapter.parse("2024-05-01", "YYYY-MM-DD").date;
  return (
    <Calendar selectionVariant={"offset"}>
      <QAContainer
        cols={4}
        itemPadding={1}
        height={600}
        width={450}
        itemWidthAuto
        transposeDensity
        vertical
      >
        <div className={"saltCalendarMonth-offset"}>
          <div className={"calendar-grid"}>
            <CalendarDay
              className={
                "saltCalendarDay saltCalendarDay-selectedStart saltCalendarDay-offset"
              }
              date={date}
              month={month}
            />
            <CalendarDay
              className={
                "saltCalendarDay saltCalendarDay-selectedSpan saltCalendarDay-offset"
              }
              date={date}
              month={month}
            />
            <CalendarDay
              className={
                "saltCalendarDay saltCalendarDay-selectedEnd saltCalendarDay-offset"
              }
              date={date}
              month={month}
            />
          </div>
          <div className={"calendar-grid"}>
            <CalendarDay
              className={
                "saltCalendarDay saltCalendarDay-hoveredStart saltCalendarDay-offset"
              }
              date={date}
              month={month}
            />
            <CalendarDay
              className={
                "saltCalendarDay saltCalendarDay-hoveredSpan saltCalendarDay-offset"
              }
              date={date}
              month={month}
            />
            <CalendarDay
              className={
                "saltCalendarDay saltCalendarDay-hoveredEnd saltCalendarDay-offset"
              }
              date={date}
              month={month}
            />
          </div>
        </div>
      </QAContainer>
    </Calendar>
  );
};

CalendayDayOffset.parameters = {
  ...QAContainerParameters,
  dateLocale: "en-US",
  dateAdapter: "luxon",
};
