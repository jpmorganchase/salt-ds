import { clsx } from "clsx";
import {
  ChangeEventHandler,
  forwardRef,
  HTMLAttributes,
  KeyboardEventHandler,
  Ref,
  useCallback,
  useRef,
  useState,
} from "react";
import {
  FormField,
  FormFieldLabel,
  Input,
  useForkRef,
  useIsomorphicLayoutEffect,
} from "@salt-ds/core";
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
    const { count, onPageChange, paginatorElement } = usePaginationContext();

    const rootRef = useRef<HTMLSpanElement>(null);
    const forkedRef = useForkRef(rootRef, forwardedRef);
    const [inputValue, setInputValue] = useState("");

    const onChange: ChangeEventHandler<HTMLInputElement> = useCallback(
      (event) => {
        setInputValue(event.target.value);
      },
      [setInputValue]
    );

    const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
      if (event.key === "Enter") {
        const pageValue = Number(inputValue);
        if (
          !inputValue.startsWith("0") &&
          !isNaN(pageValue) &&
          pageValue > 0 &&
          pageValue <= count
        ) {
          onPageChange(pageValue);
        }
        setInputValue("");
      }
    };

    const onBlur = useCallback(() => {
      setInputValue("");
    }, [setInputValue]);

    const [position, setPosition] = useState<"left" | "right">();

    useIsomorphicLayoutEffect(() => {
      if (paginatorElement && rootRef.current) {
        setPosition(
          rootRef.current.compareDocumentPosition(paginatorElement) ===
            Node.DOCUMENT_POSITION_PRECEDING
            ? "right"
            : "left"
        );
      }
    }, [paginatorElement, rootRef]);

    const widthCh = `${`${count}`.length}ch`;

    return (
      <span
        className={clsx(
          withBaseName("goToInputWrapper"),
          { [withBaseName(`${position!}GoToInput`)]: position },
          className
        )}
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
