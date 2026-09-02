import { Label, MultilineInput, useAriaAnnouncer } from "@salt-ds/core";
import {
  type ChangeEvent,
  type ReactElement,
  useId,
  useRef,
  useState,
} from "react";

export const CharacterCount = (): ReactElement => {
  const { announce } = useAriaAnnouncer({ debounce: 500 });
  const [value, setValue] = useState<string>("Value");
  const [isError, setIsError] = useState<boolean>(false);
  const MAX_CHARS = 10;
  const counterId = useId();
  const prevAtLimitRef = useRef(false);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = event.target.value;
    setValue(newVal);
    if (newVal.length > MAX_CHARS) {
      setIsError(true);
      if (!prevAtLimitRef.current) {
        prevAtLimitRef.current = true;
        announce(
          `Character limit reached. ${newVal.length} of ${MAX_CHARS} characters used.`,
          { ariaLive: "assertive" },
        );
      }
    } else {
      prevAtLimitRef.current = false;
      setIsError(false);
      if (newVal.length > 0) {
        announce(`${newVal.length} of ${MAX_CHARS} characters used.`);
      }
    }
  };

  return (
    <MultilineInput
      endAdornment={
        <Label id={counterId} variant={!isError ? "secondary" : "primary"}>
          {!isError && `${value.length}/${MAX_CHARS}`}
          {isError && <strong>{`${value.length}/${MAX_CHARS}`}</strong>}
        </Label>
      }
      style={{ width: "256px" }}
      textAreaProps={{
        "aria-describedby": counterId,
        "aria-invalid": isError,
        onChange: handleChange,
      }}
      value={value}
      validationStatus={isError ? "error" : undefined}
    />
  );
};
