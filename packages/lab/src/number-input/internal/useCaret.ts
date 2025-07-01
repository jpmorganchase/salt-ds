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

  // biome-ignore lint/correctness/useExhaustiveDependencies: Refs shouldn't be used in dependency arrays
  const recordCaret = useCallback(() => {
    if (inputRef.current) {
      const { selectionStart: start, selectionEnd: end } = inputRef.current;
      caretPositionRef.current = {
        start,
        end,
      };
    }
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Refs shouldn't be used in dependency arrays
  const restoreCaret = useCallback(() => {
    if (inputRef.current && caretPositionRef.current) {
      const { start, end } = caretPositionRef.current;
      inputRef.current.setSelectionRange(start, end);
    }
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Refs shouldn't be used in dependency arrays
  const resetCaret = useCallback(() => {
    if (inputRef.current) {
      const txtLength = inputRef.current.value.length;
      caretPositionRef.current = { start: txtLength, end: txtLength };
    }
  }, []);

  return [recordCaret, restoreCaret, resetCaret];
};

export default useCaret;
