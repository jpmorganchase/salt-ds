import { clsx } from "clsx";
import {
  ChangeEventHandler,
  KeyboardEventHandler,
  forwardRef,
  useEffect,
  useState,
} from "react";
import { Input, InputProps } from "../input";
import { makePrefixer } from "../utils";
import { usePaginationContext } from "./usePaginationContext";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import compactInputCss from "./CompactInput.css";

const withBaseName = makePrefixer("saltCompactInput");

export const CompactInput = forwardRef<
  HTMLInputElement,
  Pick<InputProps, "inputRef" | "variant">
>(function CompactInput(props, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-compact-input",
    css: compactInputCss,
    window: targetWindow,
  });

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
        onPageChange(event, pageValue);
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
      className={clsx(withBaseName(), {
        [withBaseName("defaultSize")]: count < 100,
      })}
      inputProps={{
        "aria-label": `Go to page, ${count} total`,
        style: { width: `${`${count}`.length}ch` },
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
