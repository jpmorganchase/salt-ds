/**
 * All user-facing strings emitted by the month-year panel family.
 *
 * The Salt date-components package does not yet have a shared i18n system
 * (CalendarNavigation, DatePickerPanel etc. all hard-code English labels).
 * Consolidating our strings here means that when a shared mechanism does
 * arrive, only this file needs to change to plug the panel into it.
 *
 * Each entry is a function so callers can interpolate context (year, month
 * label) without repeating template literals throughout the component tree.
 */
export const monthYearPanelMessages = {
  previousYearLabel: "Previous year",
  previousYearOutOfRange: "Past dates are out of range",
  nextYearLabel: "Next year",
  nextYearOutOfRange: "Future dates are out of range",
  yearDropdownLabel: "Select year",
  yearChangedAnnouncement: (year: number) => `${year}.`,
  gridLabel: (year: number) => `${year} months group`,
  monthSelectedAriaLabel: (fullLabel: string) => `${fullLabel}, selected`,
  monthRangeStartAriaLabel: (fullLabel: string) =>
    `Start date: ${fullLabel}, selected`,
  monthRangeEndAriaLabel: (fullLabel: string) =>
    `End date: ${fullLabel}, selected`,
  monthRangeSpanAriaLabel: (fullLabel: string) =>
    `In range: ${fullLabel}, selected`,
  monthSelectAsEndAriaLabel: (fullLabel: string) =>
    `${fullLabel}, select as end date`,
  monthChangeStartAriaLabel: (fullLabel: string) =>
    `Change start date to ${fullLabel}`,
  monthMinimumAriaLabel: (fullLabel: string) => `${fullLabel}, minimum date`,
  monthMaximumAriaLabel: (fullLabel: string) => `${fullLabel}, maximum date`,
  monthOutOfRange: "out of range",
  selectedAnnouncement: (fullLabel: string) => `${fullLabel}, selected`,
  selectStartDate: "Select start date.",
  selectEndDate: "Select end date.",
  selectedRangeAnnouncement: (start: string, end: string) =>
    `Date range ${start} to ${end}, selected`,
} as const;
