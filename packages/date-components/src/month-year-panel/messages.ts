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
  previousYearLabel: (year: number) => `Previous year, ${year}`,
  nextYearLabel: (year: number) => `Next year, ${year}`,
  yearDropdownLabel: "Year Dropdown",
  singleGridLabel: (year: number) => `Select a month in ${year}`,
  startGridLabel: (year: number) => `Start month, ${year}`,
  endGridLabel: (year: number) => `End month, ${year}`,
  monthOutOfRange: "out of range",
  monthUnselectableAriaLabel: (fullLabel: string, reason: string) =>
    `${fullLabel}, ${reason}`,
  selectedAnnouncement: (fullLabel: string) => `Selected ${fullLabel}`,
  selectedRangeAnnouncement: (start: string, end: string) =>
    `Selected range: start ${start}, end ${end}`,
  noStartMonth: "no start month",
  noEndMonth: "no end month",
} as const;

