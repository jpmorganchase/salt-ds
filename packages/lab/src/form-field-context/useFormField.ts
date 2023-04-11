import { Dispatch, FocusEventHandler, SetStateAction, useState } from "react";

// TODO: Add TS props for this
export const useFormField = ({
  onBlur,
  onFocus,
}: {
  onBlur?: FocusEventHandler<HTMLDivElement>;
  onFocus?: FocusEventHandler<HTMLDivElement>;
}): [
  { focused: boolean },
  { setFocused: Dispatch<SetStateAction<boolean>> },
  {
    onBlur: FocusEventHandler<HTMLDivElement>;
    onFocus: FocusEventHandler<HTMLDivElement>;
  }
] => {
  const [focused, setFocused] = useState(false);
  const handleBlur: FocusEventHandler<HTMLDivElement> = (event) => {
    setFocused(false);
    onBlur?.(event);
  };
  const handleFocus: FocusEventHandler<HTMLDivElement> = (event) => {
    setFocused(true);
    onFocus?.(event);
  };
  return [
    {
      focused,
    },
    {
      setFocused,
    },
    {
      onBlur: handleBlur,
      onFocus: handleFocus,
    },
  ];
};
