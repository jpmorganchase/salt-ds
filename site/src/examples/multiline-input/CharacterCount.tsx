import { ChangeEvent, ReactElement, useState } from "react";
import { Label, MultilineInput } from "@salt-ds/core";

export const CharacterCount = (): ReactElement => {
  const [value, setValue] = useState<string>("Value");
  const [isError, setIsError] = useState<boolean>(false);
  const MAX_CHARS = 10;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newVal = event.target.value;
    setValue(newVal);
    setIsError(newVal.length > MAX_CHARS);
  };

  return (
    <MultilineInput
      endAdornment={
        <Label variant={!isError ? "secondary" : "primary"}>
          {!isError && `${value.length}/${MAX_CHARS}`}
          {isError && <strong>{`${value.length}/${MAX_CHARS}`}</strong>}
        </Label>
      }
      style={{ width: "256px" }}
      onChange={handleChange}
      value={value}
      validationStatus={isError ? "error" : undefined}
    />
  );
};
