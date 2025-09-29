import { useEffect } from "react";
import type {
  DateFrameworkType,
  SaltDateAdapter,
} from "@salt-ds/date-adapters";
import { useAriaAnnouncer } from "@salt-ds/core";
import {
  DateRangeSelection,
  SingleDateSelection,
} from "./useCalendarSelection";

export function isSingleSelectionState<TDate extends DateFrameworkType>(
    state: UseAriaCalendarAnnouncerProps<TDate>["state"],
): state is {
  selectionVariant: "single";
  multiselect: false;
  selectedDate: SingleDateSelection<TDate>;
  startVisibleMonth: TDate;
  endVisibleMonth: TDate;
} {
  return state.selectionVariant === "single" && !state.multiselect;
}

export function isMultiselectSingleSelectionState<TDate extends DateFrameworkType>(
    state: UseAriaCalendarAnnouncerProps<TDate>["state"],
): state is SelectionBaseState<TDate> & {
  selectionVariant: "single";
  multiselect: true;
  selectedDate: SingleDateSelection<TDate>[];
} {
  return (state.selectionVariant === "range" || state.selectionVariant === "offset") && state.multiselect;
}

export function isRangeSelectionState<TDate extends DateFrameworkType>(
    state: UseAriaCalendarAnnouncerProps<TDate>["state"],
): state is SelectionBaseState<TDate> & {
  selectionVariant: "range" | "offset";
  multiselect: false;
  selectedDate: DateRangeSelection<TDate>;
} {
  return (state.selectionVariant === "range" || state.selectionVariant === "offset") && !state.multiselect;
}

export function isMultiselectRangeSelectionState<TDate extends DateFrameworkType>(
    state: UseAriaCalendarAnnouncerProps<TDate>["state"],
): state is SelectionBaseState<TDate> & {
  selectionVariant: "range" | "offset";
  multiselect: true;
  selectedDate: DateRangeSelection<TDate>[];
} {
  return state.selectionVariant === "range" && state.multiselect;
}

// Announcement variants
export const AnnouncementVariantValues = [
  "minFocusableDateExceeded",
  "maxFocusableDateExceeded",
  "dateSelected",
  "visibleMonthChanged",
] as const;
export type AnnouncementVariant = (typeof AnnouncementVariantValues)[number];

interface UseAriaCalendarAnnouncerBaseProps<TDate extends DateFrameworkType> {
  /** Date adapter */
  dateAdapter: SaltDateAdapter<TDate>;
  /** Disable announcements */
  disabled?: boolean;
}

export type SelectionBaseState<TDate extends DateFrameworkType> = {
  /** Selection variant */
  selectionVariant: "single" | "range" | "offset";
  /** If `true`, the calendar will be multiselect. */
  multiselect: boolean;
  /** First visible month */
  startVisibleMonth: TDate;
  /** Second visible month */
  endVisibleMonth: TDate;
  /**
   * Selected date
   */
  selectedDate:  TDate | TDate[] | DateRangeSelection<TDate> | DateRangeSelection<TDate>[] | null | undefined;
};

// State and props interfaces for different selection variants
type SelectionState =
  | {
      selectionVariant: "single";
      multiselect: false;
    }
  | {
      selectionVariant: "single";
      multiselect: true;
    }
  | {
      selectionVariant: "range";
      multiselect: false;
    }
  | {
      selectionVariant: "range";
      multiselect: true;
    }
  | {
      selectionVariant: "offset";
      multiselect: false;
    }
  | {
      selectionVariant: "offset";
      multiselect: true;
    };

export type UseAriaCalendarAnnouncerProps<TDate extends DateFrameworkType> = UseAriaCalendarAnnouncerBaseProps<TDate> & {
  state: SelectionBaseState<TDate> & SelectionState;
  announcement: AnnouncementFunction<TDate>;
};

type AnnouncementFunction<TDate extends DateFrameworkType> = (
  variant: AnnouncementVariant,
  state: SelectionBaseState<TDate> & SelectionState,
  dateAdapter: SaltDateAdapter<TDate>
) => string | undefined;

export const useAriaCalendarAnnouncer = <TDate extends DateFrameworkType>({
  disabled,
  dateAdapter,
  state,
  announcement,
}: UseAriaCalendarAnnouncerProps<TDate>) => {
  const { selectedDate, startVisibleMonth, endVisibleMonth } = state;
  const { announce: saltAnnouncer } = useAriaAnnouncer();

  const callAnnouncer = (announcementType: AnnouncementVariant) => {
    const content = announcement(announcementType, state, dateAdapter);
    if (content) {
      saltAnnouncer(content);
    }
  };

  useEffect(() => {
    if (!disabled) {
      callAnnouncer("visibleMonthChanged");
    }
  }, [disabled, startVisibleMonth, endVisibleMonth]);

  useEffect(() => {
    if (!disabled) {
      callAnnouncer("dateSelected");
    }
  }, [disabled, selectedDate]);

  return { announce: callAnnouncer }
};
