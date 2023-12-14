import { clsx } from "clsx";
import {
  ChangeEventHandler,
  forwardRef,
  HTMLAttributes,
  KeyboardEventHandler,
  Ref,
  useState,
} from "react";
import { FormField, FormFieldLabel, Input, makePrefixer } from "@salt-ds/core";
import { usePaginationContext } from "./usePaginationContext";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import goToInputCss from "./GoToInput.css";

const withBaseName = makePrefixer("saltGoToInput");
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

export const GoToInput = forwardRef<HTMLDivElement, GoToInputProps>(
  function GoToInput(
    {
      className,
      inputRef,
      inputVariant = "primary",
      label = "Go to",
      ...restProps
    },
    ref
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-go-to-input",
      css: goToInputCss,
      window: targetWindow,
    });

    const { count, onPageChange } = usePaginationContext();
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
      <FormField
        labelPlacement="left"
        className={clsx(withBaseName(), className)}
        ref={ref}
        {...restProps}
      >
        <FormFieldLabel>{label}</FormFieldLabel>
        <Input
          className={clsx(withBaseName("input"), {
            [withBaseName("inputDefaultSize")]: count < 100,
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
    );
  }
);
