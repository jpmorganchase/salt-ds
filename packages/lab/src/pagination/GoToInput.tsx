import { clsx } from "clsx";
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
    { className, id: idProp, label = "Go to", ...restProps },

    forwardedRef
  ) {
    const { compact, count, onPageChange, paginatorElement } =
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
    }, [paginatorElement, compact, rootRef]);

    if (compact) {
      return null;
    }

    const widthCh = `${`${count}`.length}ch`;

    console.log("count", count, widthCh);

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
        <FormFieldLabel>{label}</FormFieldLabel>
        <Input
          className={clsx(withBaseName("goToInput"), {
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
      </span>
    );
  }
);
