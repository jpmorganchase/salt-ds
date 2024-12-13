import type { OpenChangeReason } from "@floating-ui/react";
import { Divider, FlexItem, FlexLayout } from "@salt-ds/core";
import type { DateFrameworkType } from "@salt-ds/date-adapters";
import {
  type DateInputSingleDetails,
  DatePicker,
  DatePickerActions,
  DatePickerOverlay,
  DatePickerSingleInput,
  DatePickerSinglePanel,
  DatePickerTrigger,
  type SingleDateSelection,
  useLocalization,
} from "@salt-ds/lab";
import {
  type FocusEvent,
  type ReactElement,
  type SyntheticEvent,
  useCallback,
  useRef,
  useState,
} from "react";

export const ControlledOpenOnFocus = (): ReactElement => {
  const [selectedDate, setSelectedDate] = useState<
    SingleDateSelection<DateFrameworkType> | null | undefined
  >(null);
  const [open, setOpen] = useState(false);
  const { dateAdapter } = useLocalization();
  const triggerRef = useRef<HTMLInputElement | null>(null);
  const applyButtonRef = useRef<HTMLButtonElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const programmaticClose = useRef(false);

  const handleSelectionChange = useCallback(
    (
      _event: SyntheticEvent,
      date: SingleDateSelection<DateFrameworkType> | null,
      _details: DateInputSingleDetails | undefined,
    ) => {
      setSelectedDate(date ?? null);
    },
    [dateAdapter],
  );

  const handleClick = useCallback(() => {
    setOpen(true);
  }, []);

  const handleInputFocus = useCallback((event: FocusEvent) => {
    // Don't re-open if closing and returning focus
    if (!programmaticClose.current) {
      setOpen(true);
    }
    programmaticClose.current = false;
  }, []);

  const handleInputBlur = useCallback((event: FocusEvent) => {
    // Don't close if the overlay now has focus
    if (!datePickerRef?.current?.contains(event.relatedTarget)) {
      setOpen(false);
    }
  }, []);

  const handleOpen = useCallback(
    (
      newOpen: boolean,
      _event?: Event | undefined,
      reason?: OpenChangeReason | undefined,
    ) => {
      if (reason === undefined) {
        programmaticClose.current = true;
        triggerRef?.current?.focus();
        setTimeout(() => {
          triggerRef?.current?.setSelectionRange(
            0,
            triggerRef.current.value.length,
          );
        }, 1);
      }
      setOpen(newOpen);
    },
    [],
  );

  const handleApply = useCallback(
    (
      event: SyntheticEvent,
      date: SingleDateSelection<DateFrameworkType> | null,
    ) => {
      console.log(
        `Applied StartDate: ${date ? dateAdapter.format(date, "DD MMM YYYY") : date}`,
      );
      setSelectedDate(date);
    },
    [dateAdapter],
  );

  return (
    <DatePicker
      selectionVariant={"single"}
      onSelectionChange={handleSelectionChange}
      selectedDate={selectedDate}
      onApply={handleApply}
      onOpen={handleOpen}
      open={open}
    >
      <DatePickerTrigger>
        <DatePickerSingleInput
          inputRef={triggerRef}
          inputProps={{
            onClick: handleClick,
            onFocus: handleInputFocus,
            onBlur: handleInputBlur,
          }}
        />
      </DatePickerTrigger>
      <DatePickerOverlay ref={datePickerRef}>
        <FlexLayout gap={0} direction="column">
          <FlexItem>
            <DatePickerSinglePanel />
            <Divider variant="tertiary" />
          </FlexItem>
          <FlexItem>
            <DatePickerActions
              selectionVariant="single"
              applyButtonRef={applyButtonRef}
            />
          </FlexItem>
        </FlexLayout>
      </DatePickerOverlay>
    </DatePicker>
  );
};
