import dayjs from "./dayjs";

export function getCurrentMonthDays(year: number, month: number) {
  const currentDate = dayjs()
    .set("year", year)
    .set("month", month)
    .startOf("month");

  return new Array(currentDate.daysInMonth()).fill(0).map((_v, index) => {
    const dayOfMonth = index + 1;
    return {
      date: dayjs(currentDate).set("date", dayOfMonth).toDate(),
      dayOfMonth,
      isCurrentMonth: true,
    };
  });
}

export function getPreviousMonthDays(
  year: number,
  month: number,
  firstDayOfTheMonth: Date
) {
  const firstDayOfTheWeek = dayjs(firstDayOfTheMonth).weekday(0);
  const previousMonth = dayjs(firstDayOfTheMonth).subtract(1, "month");

  const visibleNumberOfDaysFromPreviousMonth = dayjs(firstDayOfTheMonth).diff(
    firstDayOfTheWeek,
    "days"
  );

  return new Array(visibleNumberOfDaysFromPreviousMonth)
    .fill(0)
    .map((_v, index) => {
      const dayOfMonth = firstDayOfTheWeek.date() + index;
      return {
        date: dayjs(previousMonth).set("date", dayOfMonth).toDate(),
        dayOfMonth,
        isCurrentMonth: false,
      };
    });
}

export function getNextMonthDays(year: number, month: number) {
  const lastDayOfTheMonth = dayjs()
    .set("year", year)
    .set("month", month)
    .endOf("month");

  const endOfWeek = dayjs(lastDayOfTheMonth).weekday(6);

  const visibleNumberOfDaysFromNextMonth = dayjs(endOfWeek).diff(
    lastDayOfTheMonth,
    "days"
  );

  return new Array(visibleNumberOfDaysFromNextMonth)
    .fill(0)
    .map((_v, index) => {
      const dayOfMonth = index + 1;
      return {
        date: dayjs(endOfWeek).set("date", dayOfMonth).toDate(),
        dayOfMonth,
        isCurrentMonth: false,
      };
    });
}

export function getPadDays(startDate: Date, numberOfDays: number) {
  return new Array(numberOfDays).fill(0).map((_v, index) => {
    const dayOfMonth = dayjs(startDate).date() + index + 1;
    return {
      date: dayjs(startDate).set("date", dayOfMonth).toDate(),
      dayOfMonth,
      isCurrentMonth: false,
    };
  });
}

export function generateVisibleDays(year: number, month: number) {
  // Six weeks
  const totalDays = 6 * 7;

  const currentMonthDays = getCurrentMonthDays(year, month);
  const previousMonthDays = getPreviousMonthDays(
    year,
    month,
    currentMonthDays[0].date
  );
  const nextMonthDays = getNextMonthDays(year, month);
  const lastDate =
    nextMonthDays.length > 0
      ? nextMonthDays[nextMonthDays.length - 1].date
      : currentMonthDays[currentMonthDays.length - 1].date;
  const padDays = getPadDays(
    lastDate,
    totalDays -
      (currentMonthDays.length +
        previousMonthDays.length +
        nextMonthDays.length)
  );

  return previousMonthDays.concat(currentMonthDays, nextMonthDays, padDays);
}
