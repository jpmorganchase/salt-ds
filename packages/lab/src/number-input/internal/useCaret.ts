import { type MutableRefObject, useCallback, useRef } from "react";

const useCaret = ({
  inputRef,
}: {
  inputRef: MutableRefObject<HTMLInputElement | null>;
}) => {
  const caretPositionRef = useRef<{
    start: number | null;
    end: number | null;
  } | null>(null);

  const recordCaret = useCallback(() => {
    if (inputRef.current) {
      const { selectionStart: start, selectionEnd: end } = inputRef.current;
      caretPositionRef.current = {
        start,
        end,
      };
    }
  }, [inputRef.current]);

  const restoreCaret = useCallback(() => {
    if (inputRef.current && caretPositionRef.current) {
      const { start, end } = caretPositionRef.current;
      inputRef.current.setSelectionRange(start, end);
    }
  }, [inputRef.current]);

  const resetCaret = useCallback(() => {
    if (inputRef.current) {
      const txtLength = inputRef.current.value.length;
      caretPositionRef.current = { start: txtLength, end: txtLength };
    }
  }, [inputRef.current]);

  return [recordCaret, restoreCaret, resetCaret];
};

export default useCaret;
