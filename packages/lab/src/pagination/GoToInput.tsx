import { clsx } from "clsx";
import {
  ChangeEventHandler,
  forwardRef,
  HTMLAttributes,
  KeyboardEventHandler,
  Ref,
  useRef,
  useState,
} from "react";
import { FormField, FormFieldLabel, Input, useForkRef } from "@salt-ds/core";
import { usePaginationContext } from "./usePaginationContext";
import { withBaseName } from "./utils";

export interface GoToInputProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Input label.
   */
  label?: string;
  /**
   * Optional ref for the input component
   */
  inputRef?: Ref<HTMLInputElement>;
  /**
   * Change input variant.
   */
  inputVariant?: "primary" | "secondary";
}

export const GoToInput = forwardRef<HTMLSpanElement, GoToInputProps>(
  function GoToInput(
    {
      className,
      inputRef,
      inputVariant = "primary",
      label = "Go to",
      ...restProps
    },
    forwardedRef
  ) {
    const { count, onPageChange } = usePaginationContext();

    const rootRef = useRef<HTMLSpanElement>(null);
    const forkedRef = useForkRef(rootRef, forwardedRef);
    const [inputValue, setInputValue] = useState("");

    const onChange: ChangeEventHandler<HTMLInputElement> = (event) => {
      setInputValue(event.target.value);
    };

    const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
      if (event.key === "Enter") {
        const pageValue = Number(inputValue);
        if (
          !inputValue.startsWith("0") &&
          !isNaN(pageValue) &&
          pageValue > 0 &&
          pageValue <= count
        ) {
          onPageChange(event, pageValue);
        }
        setInputValue("");
      }
    };

    const onBlur = () => {
      setInputValue("");
    };

    const widthCh = `${`${count}`.length}ch`;

    return (
      <span
        className={clsx(withBaseName("goToInputWrapper"), className)}
        ref={forkedRef}
        {...restProps}
      >
        <FormField className={withBaseName("FormField")}>
          <FormFieldLabel>{label}</FormFieldLabel>
          <Input
            className={clsx(withBaseName("goToInput"), {
              [withBaseName("goToInputFixed")]: count < 100,
            })}
            ref={inputRef}
            inputProps={{
              style: { width: widthCh },
            }}
            onBlur={onBlur}
            onChange={onChange}
            onKeyDown={onKeyDown}
            value={inputValue}
            textAlign={"center"}
            variant={inputVariant}
          />
        </FormField>
      </span>
    );
  }
);
