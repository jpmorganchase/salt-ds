import { Divider, FlexItem, FlexLayout } from "@salt-ds/core";
import type { DateFrameworkType } from "@salt-ds/date-adapters";
import {
  type DateInputSingleDetails,
  DatePicker,
  DatePickerActions,
  type DatePickerOpenChangeReason,
  DatePickerOverlay,
  DatePickerSingleGridPanel,
  DatePickerSingleInput,
  DatePickerTrigger,
  type SingleDateSelection,
  useLocalization,
} from "@salt-ds/lab";
import {
  type ReactElement,
  type SyntheticEvent,
  useCallback,
  useRef,
  useState,
} from "react";

export const ControlledOpen = (): ReactElement => {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<
    SingleDateSelection<DateFrameworkType> | null | undefined
  >(null);
  const { dateAdapter } = useLocalization();
  const triggerRef = useRef<HTMLInputElement>(null);
  const applyButtonRef = useRef<HTMLButtonElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const previousSelectedDate = useRef<typeof selectedDate>(selectedDate);

  const handleSelectionChange = useCallback(
    (
      _event: SyntheticEvent,
      date: SingleDateSelection<DateFrameworkType> | null,
      _details: DateInputSingleDetails | undefined,
    ) => {
      setSelectedDate(date ?? null);
    },
    [],
  );

  const handleApply = useCallback(
    (
      _event: SyntheticEvent,
      date: SingleDateSelection<DateFrameworkType> | null,
    ) => {
      console.log(
        `Applied date: ${date ? dateAdapter.format(date, "DD MMM YYYY") : date}`,
      );
      setSelectedDate(date);
      previousSelectedDate.current = date;
      setOpen(false);
    },
    [dateAdapter],
  );

  const handleCancel = useCallback(() => {
    setSelectedDate(previousSelectedDate.current);
    setSelectedDate(previousSelectedDate.current);
  }, []);

  const handleOpenChange = useCallback(
    (newOpen: boolean, reason?: DatePickerOpenChangeReason) => {
      // reason === undefined denotes a programmatic/controlled open, so focus behavior is owned by the code
      if (reason === undefined) {
        triggerRef.current?.focus();
        setTimeout(() => {
          triggerRef.current?.setSelectionRange(
            0,
            triggerRef.current.value.length,
          );
        }, 1);
      }
      setOpen(newOpen);
    },
    [],
  );

  return (
    <DatePicker
      selectionVariant={"single"}
      onSelectionChange={handleSelectionChange}
      selectedDate={selectedDate}
      onApply={handleApply}
      onCancel={handleCancel}
      onOpenChange={handleOpenChange}
      open={open}
    >
      <DatePickerTrigger>
        <DatePickerSingleInput inputRef={triggerRef} />
      </DatePickerTrigger>
      <DatePickerOverlay ref={datePickerRef}>
        <FlexLayout gap={0} direction="column">
          <FlexItem>
            <DatePickerSingleGridPanel />
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
