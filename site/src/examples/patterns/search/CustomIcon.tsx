import { Button, Input } from "@salt-ds/core";
import { CloseIcon, EditIcon } from "@salt-ds/icons";
import { type ChangeEventHandler, useRef, useState } from "react";

export const CustomIcon = () => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const newValue = event.target.value;
    setValue(newValue);
  };

  const handleClear = () => {
    setValue("");
    inputRef.current?.focus(); // focus goes back to input
  };

  return (
    <Input
      inputRef={inputRef}
      inputProps={{ "aria-label": "Search" }}
      startAdornment={<EditIcon />}
      endAdornment={
        value && (
          <Button
            onClick={handleClear}
            aria-label="Clear input"
            appearance="transparent"
          >
            <CloseIcon aria-hidden />
          </Button>
        )
      }
      value={value}
      onChange={handleChange}
      style={{ width: 200 }}
    />
  );
};
