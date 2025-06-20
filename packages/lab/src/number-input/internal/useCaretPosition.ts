import { type MutableRefObject, useLayoutEffect, useRef } from "react";

const useCaretPosition = ({
  inputRef,
  value,
}: {
  inputRef: MutableRefObject<HTMLInputElement | null>;
  value: string | number;
}) => {
  const caretPosition = useRef({
    beforeStart: String(value).length,
    beforeEnd: String(value).length,
  });

  const setCaretPosition = (start: number, end: number) => {
    caretPosition.current = {
      beforeStart: start,
      beforeEnd: end,
    };
  };

  const resetCaretPosition = () => {
    caretPosition.current = {
      beforeStart: String(value).length,
      beforeEnd: String(value).length,
    };
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useLayoutEffect(() => {
    if (inputRef.current) {
      inputRef.current.setSelectionRange(
        caretPosition.current.beforeStart,
        caretPosition.current.beforeEnd,
      );
    }
  }, [value]);

  return { setCaretPosition, resetCaretPosition };
};

export default useCaretPosition;
