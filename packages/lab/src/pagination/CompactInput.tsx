import { clsx } from "clsx";
import {
  ChangeEventHandler,
  HTMLAttributes,
  KeyboardEventHandler,
  forwardRef,
  useEffect,
  useState,
} from "react";
import { Input, useId } from "@salt-ds/core";
import { withBaseName } from "./utils";
import { usePaginationContext } from "./usePaginationContext";

export interface CompactInputProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Id of the input field
   */
  id?: string;
  /**
   * Change input variant.
   */
  inputVariant?: "primary" | "secondary";
}

export const CompactInput = forwardRef<HTMLSpanElement, CompactInputProps>(
  function CompactInput({ id: idProp, inputVariant, ...restProps }, ref) {
    const { count, page, onPageChange } = usePaginationContext();

    const [inputValue, setInputValue] = useState(`${page}`);

    const id = useId(idProp);

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
      <span
        className={clsx(withBaseName("compactInputField"))}
        {...restProps}
        ref={ref}
      >
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
          id={id}
          value={inputValue}
          textAlign={"center"}
          variant={inputVariant}
        />
      </span>
    );
  }
);
