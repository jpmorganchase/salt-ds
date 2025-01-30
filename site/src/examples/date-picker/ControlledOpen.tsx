import type { OpenChangeReason } from "@floating-ui/react";
import {
  Button,
  Divider,
  FlexItem,
  FlexLayout,
  StackLayout,
} from "@salt-ds/core";
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
  const triggerRef = useRef<HTMLInputElement | null>(null);
  const applyButtonRef = useRef<HTMLButtonElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

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

  const handleApply = useCallback(
    (
      event: SyntheticEvent,
      date: SingleDateSelection<DateFrameworkType> | null,
    ) => {
      console.log(
        `Applied StartDate: ${date ? dateAdapter.format(date, "DD MMM YYYY") : date}`,
      );
      setSelectedDate(date);
      setOpen(false);
    },
    [dateAdapter],
  );

  const handleOpen = useCallback(
    (
      newOpen: boolean,
      _event?: Event | undefined,
      reason?: OpenChangeReason | undefined,
    ) => {
      if (reason === undefined) {
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

  return (
    <StackLayout>
      <FlexLayout>
        <Button
          aria-label={"open picker"}
          onClick={() => {
            setOpen(true);
          }}
        >
          Open
        </Button>
      </FlexLayout>
      <DatePicker
        selectionVariant={"single"}
        onSelectionChange={handleSelectionChange}
        selectedDate={selectedDate}
        onApply={handleApply}
        onOpen={handleOpen}
        open={open}
      >
        <DatePickerTrigger>
          <DatePickerSingleInput inputRef={triggerRef} />
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
    </StackLayout>
  );
};
