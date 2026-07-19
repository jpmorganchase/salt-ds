import {
  Button,
  type ButtonProps,
  Dropdown,
  type DropdownProps,
  makePrefixer,
  Option,
} from "@salt-ds/core";
import { ChevronLeftIcon, ChevronRightIcon } from "@salt-ds/icons";
import { clsx } from "clsx";
import { type SyntheticEvent, useCallback, useMemo, useRef } from "react";
import { monthYearPanelMessages } from "./messages";

const withBaseName = makePrefixer("saltMonthYearPanel");

export interface MonthGridHeaderProps {
  /** Currently-visible year, controlled by the parent grid. */
  year: number;
  /**
   * Callback fired whenever the year changes via the previous/next arrow
   * buttons or the year dropdown.
   */
  onYearChange: (event: SyntheticEvent | null, year: number) => void;
  /** Inclusive lower year bound. Disables the previous arrow and clamps the dropdown. */
  minYear?: number;
  /** Inclusive upper year bound. Disables the next arrow and clamps the dropdown. */
  maxYear?: number;
  /** Disables all interaction in the header. */
  disabled?: boolean;
  /** Renders the year dropdown as read-only. */
  readOnly?: boolean;
  /**
   * Padding, in years, applied on either side of the initially-visible year
   * when generating the dropdown option list and neither `minYear` nor
   * `maxYear` is supplied. The window is captured on first render and does
   * not resize as the visible year advances, so navigating year-by-year does
   * not thrash the option list. Defaults to 100.
   */
  yearDropdownRange?: number;
  /** Props forwarded to the previous-year button. */
  PreviousYearButtonProps?: Partial<ButtonProps>;
  /** Props forwarded to the next-year button. */
  NextYearButtonProps?: Partial<ButtonProps>;
  /** Props forwarded to the year dropdown. */
  YearDropdownProps?: Partial<DropdownProps<number>>;
}

/**
 * Header strip rendered above each `MonthGrid`. Contains the previous-year
 * button, year dropdown and next-year button. Kept as a dedicated component
 * so `MonthGrid` can focus on the 12-button grid semantics and roving
 * tabindex, and so this piece can be replaced or reused independently.
 */
export function MonthGridHeader(props: MonthGridHeaderProps) {
  const {
    year,
    onYearChange,
    minYear,
    maxYear,
    disabled,
    readOnly,
    yearDropdownRange = 100,
    PreviousYearButtonProps,
    NextYearButtonProps,
    YearDropdownProps,
  } = props;

  const canGoPrev = minYear === undefined || year - 1 >= minYear;
  const canGoNext = maxYear === undefined || year + 1 <= maxYear;

  // Year options: when both bounds are supplied we use exactly that range;
  // otherwise we compute the window once from the initially-visible year so
  // year-by-year navigation does not regenerate 200+ options on every
  // keystroke. The visible year is always guaranteed to sit inside the
  // window.
  const initialYearRef = useRef(year);
  const yearOptions = useMemo(() => {
    const initial = initialYearRef.current;
    const lower = minYear ?? initial - yearDropdownRange;
    const upper = maxYear ?? initial + yearDropdownRange;
    const from = Math.min(lower, year);
    const to = Math.max(upper, year);
    const list: number[] = [];
    for (let y = from; y <= to; y++) list.push(y);
    return list;
  }, [minYear, maxYear, year, yearDropdownRange]);

  const handleYearDropdownChange = useCallback(
    (event: SyntheticEvent, next: number[]) => {
      // The dropdown may emit an empty selection when its value is cleared
      // (`next.length === 0`). We treat that as a no-op — the visible year
      // stays where it was and the `selected` prop will re-hydrate on the
      // next render.
      if (next.length === 0) return;
      const [nextYear] = next;
      if (nextYear !== undefined && nextYear !== year) {
        onYearChange(event, nextYear);
      }
    },
    [onYearChange, year],
  );

  return (
    <div className={withBaseName("header")}>
      <Button
        appearance="transparent"
        aria-label={monthYearPanelMessages.previousYearLabel(year - 1)}
        disabled={disabled || !canGoPrev}
        {...PreviousYearButtonProps}
        onClick={(event) => {
          PreviousYearButtonProps?.onClick?.(event);
          onYearChange(event, year - 1);
        }}
      >
        <ChevronLeftIcon aria-hidden />
      </Button>
      <Dropdown<number>
        aria-label={monthYearPanelMessages.yearDropdownLabel}
        selected={[year]}
        value={String(year)}
        disabled={disabled}
        readOnly={readOnly}
        onSelectionChange={handleYearDropdownChange}
        {...YearDropdownProps}
        className={clsx(
          withBaseName("yearDropdown"),
          YearDropdownProps?.className,
        )}
      >
        {yearOptions.map((y) => (
          <Option key={y} value={y}>
            {y}
          </Option>
        ))}
      </Dropdown>
      <Button
        appearance="transparent"
        aria-label={monthYearPanelMessages.nextYearLabel(year + 1)}
        disabled={disabled || !canGoNext}
        {...NextYearButtonProps}
        onClick={(event) => {
          NextYearButtonProps?.onClick?.(event);
          onYearChange(event, year + 1);
        }}
      >
        <ChevronRightIcon aria-hidden />
      </Button>
    </div>
  );
}

