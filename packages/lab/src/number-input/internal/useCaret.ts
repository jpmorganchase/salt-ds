import { type MutableRefObject, useRef } from "react";

const useCaret = ({
  inputRef,
}: {
  inputRef: MutableRefObject<HTMLInputElement | null>;
}) => {
  const caretPositionRef = useRef<{
    start: number | null;
    end: number | null;
  } | null>(null);

  const recordCaret = () => {
    if (inputRef.current) {
      const { selectionStart: start, selectionEnd: end } = inputRef.current;
      caretPositionRef.current = {
        start,
        end,
      };
    }
  };

  const restoreCaret = () => {
    if (inputRef.current && caretPositionRef.current) {
      const { start, end } = caretPositionRef.current;
      inputRef.current.setSelectionRange(start, end);
    }
  };

  const resetCaret = () => {
    if (inputRef.current) {
      const txtLength = inputRef.current.value.length;
      caretPositionRef.current = { start: txtLength, end: txtLength };
    }
  };

  return [recordCaret, restoreCaret, resetCaret];
};

export default useCaret;
