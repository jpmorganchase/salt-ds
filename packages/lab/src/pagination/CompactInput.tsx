import { clsx } from "clsx";
import {
  ChangeEventHandler,
  KeyboardEventHandler,
  forwardRef,
  useEffect,
  useState,
} from "react";
import { Input, InputProps } from "@salt-ds/core";
import { withBaseName } from "./utils";
import { usePaginationContext } from "./usePaginationContext";

export const CompactInput = forwardRef<
  HTMLInputElement,
  Pick<InputProps, "inputRef" | "variant">
>(function CompactInput(props, ref) {
  const { count, page, onPageChange } = usePaginationContext();

  const [inputValue, setInputValue] = useState(`${page}`);

  useEffect(() => {
    setInputValue(`${page}`);
  }, [page]);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setInputValue(event.target.value);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === "Enter") {
      const pageValue = Number(inputValue);
      if (!isNaN(pageValue) && pageValue <= count && pageValue > 0) {
        onPageChange(pageValue);
      } else {
        setInputValue(`${page}`);
      }
    }
  };

  const handleBlur = () => {
    setInputValue(`${page}`);
  };

  return (
    <Input
      className={clsx(withBaseName("compactInput"), {
        [withBaseName("compactInputFixed")]: count < 100,
      })}
      inputProps={{
        "aria-label": `Go to page, ${count} total`,
        style: { width: `${`${count}`.length}ch` },
        role: "textbox",
      }}
      onBlur={handleBlur}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      value={inputValue}
      textAlign={"center"}
      ref={ref}
      {...props}
    />
  );
});
