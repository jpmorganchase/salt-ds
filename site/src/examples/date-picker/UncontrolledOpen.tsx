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
  return (
    <StackLayout>
      <FlexLayout>
        <ToggleButton
          aria-label={"open on click"}
          value={openOnClick ? "false" : "true"}
          onChange={(event) =>
            setOpenOnClick(event.currentTarget.value === "true")
          }
        >
          Open On Click
        </ToggleButton>
      </FlexLayout>
      <DatePicker selectionVariant={"single"} openOnClick={openOnClick}>
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
