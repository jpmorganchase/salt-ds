import { MutableRefObject } from "react";
export const getCursorPosition = (
  inputRef: MutableRefObject<HTMLTextAreaElement | null>
) => {
  if (inputRef.current) {
    const { selectionStart, selectionEnd } = inputRef.current;

    // if there is no selection range
    if (selectionStart != null && selectionStart === selectionEnd) {
      return selectionStart;
    }
  }

  return -1;
};
