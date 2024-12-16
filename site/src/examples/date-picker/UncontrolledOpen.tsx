import { FlexLayout, StackLayout, ToggleButton } from "@salt-ds/core";
import {
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleInput,
  DatePickerSinglePanel,
  DatePickerTrigger,
} from "@salt-ds/lab";
import { type ReactElement, useState } from "react";

export const UncontrolledOpen = (): ReactElement => {
  const [openOnClick, setOpenOnClick] = useState(false);
  const [openOnKeyDown, setOpenOnKeyDown] = useState(false);
  const [openOnFocus, setOpenOnFocus] = useState(false);
  return (
    <StackLayout>
      <FlexLayout>
        <ToggleButton
          aria-label={"open on focus"}
          value={openOnFocus ? "false" : "true"}
          onChange={(event) =>
            setOpenOnFocus(event.currentTarget.value === "true")
          }
        >
          Open On Focus
        </ToggleButton>
        <ToggleButton
          aria-label={"open on click"}
          value={openOnClick ? "false" : "true"}
          onChange={(event) =>
            setOpenOnClick(event.currentTarget.value === "true")
          }
        >
          Open On Click
        </ToggleButton>
        <ToggleButton
          aria-label={"open on key down"}
          value={openOnKeyDown ? "false" : "true"}
          onChange={(event) =>
            setOpenOnKeyDown(event.currentTarget.value === "true")
          }
        >
          Open On Key Down
        </ToggleButton>
      </FlexLayout>
      <DatePicker
        selectionVariant={"single"}
        openOnClick={openOnClick}
        openOnKeyDown={openOnKeyDown}
        openOnFocus={openOnFocus}
      >
        <DatePickerTrigger>
          <DatePickerSingleInput />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <DatePickerSinglePanel />
        </DatePickerOverlay>
      </DatePicker>
    </StackLayout>
  );
};
