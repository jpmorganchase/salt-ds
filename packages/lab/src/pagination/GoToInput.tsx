import {
  ChangeEventHandler,
  forwardRef,
  HTMLAttributes,
  KeyboardEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import cx from "classnames";
import { useIsomorphicLayoutEffect } from "@brandname/core";
import { usePaginationContext } from "./usePaginationContext";
import { useForkRef, useId } from "../utils";
import { withBaseName } from "./utils";
import { FormField } from "../form-field";
import { Input } from "../input";

export interface GoToInputProps extends HTMLAttributes<HTMLSpanElement> {
  label?: string;
}

export const GoToInput = forwardRef<HTMLSpanElement, GoToInputProps>(
  ({ className, id: idProp, label = "Go to", ...restProps }, forwardedRef) => {
    const { compact, count, onPageChange, variant, paginatorElement } =
      usePaginationContext();

    const id = useId(idProp);

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

    useEffect(() => {
      if (compact) {
        setInputValue("");
      }
    }, [compact]);

    const [position, setPosition] = useState<"left" | "right">();

    useIsomorphicLayoutEffect(() => {
      if (paginatorElement && !compact && rootRef.current) {
        setPosition(
          rootRef.current.compareDocumentPosition(paginatorElement) ===
            Node.DOCUMENT_POSITION_PRECEDING
            ? "right"
            : "left"
        );
      }
    }, [paginatorElement, compact, rootRef.current]);

    if (compact) {
      return null;
    }

    const widthCh = `${`${count}`.length}ch`;

    return (
      <span
        className={cx(
          withBaseName("goToInputWrapper"),
          { [withBaseName(`${position}GoToInput`)]: position },
          className
        )}
        ref={forkedRef}
      >
        <FormField
          className={withBaseName("goToInputField")}
          fullWidth={false}
          label={label}
          labelPlacement="left"
          variant={variant}
        >
          <Input
            className={cx(withBaseName("goToInput"), {
              [withBaseName("goToInputFixed")]: count < 100,
            })}
            id={id}
            inputProps={{
              "aria-labelledby": id,
              "aria-label": `Page, ${count} total`,
              style: { width: widthCh },
            }}
            onBlur={onBlur}
            onChange={onChange}
            onKeyDown={onKeyDown}
            value={inputValue}
            textAlign={"center"}
          />
        </FormField>
      </span>
    );
  }
);
