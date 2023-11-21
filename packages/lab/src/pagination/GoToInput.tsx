import { clsx } from "clsx";
import {
  ChangeEventHandler,
  forwardRef,
  HTMLAttributes,
  KeyboardEventHandler,
  useCallback,
  useRef,
  useState,
} from "react";
import {
  FormFieldLabel,
  Input,
  useForkRef,
  useId,
  useIsomorphicLayoutEffect,
} from "@salt-ds/core";
import { usePaginationContext } from "./usePaginationContext";
import { withBaseName } from "./utils";

export interface GoToInputProps extends HTMLAttributes<HTMLSpanElement> {
  label?: string;
}

export const GoToInput = forwardRef<HTMLSpanElement, GoToInputProps>(
  function GoToInput(
    { className, id: idProp, label, ...restProps },

    forwardedRef
  ) {
    const { count, onPageChange, paginatorElement } =
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
          withBaseName("pageInputWrapper"),
          { [withBaseName(`${position!}GoToInput`)]: position },
          className
        )}
        ref={forkedRef}
        {...restProps}
      >
        {label && <FormFieldLabel>{label}</FormFieldLabel>}
        <Input
          className={clsx(withBaseName("pageInput"), {
            [withBaseName("pageInputFixed")]: count < 100,
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
      </span>
    );
  }
);
