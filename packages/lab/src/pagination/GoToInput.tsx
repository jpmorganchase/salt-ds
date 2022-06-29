import {
  FormField,
  FormFieldProps,
  useForkRef,
  useId,
  useIsomorphicLayoutEffect,
} from "@jpmorganchase/uitk-core";
import cx from "classnames";
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
import { Input } from "../input";
import { usePaginationContext } from "./usePaginationContext";
import { withBaseName } from "./utils";

export interface GoToInputProps extends HTMLAttributes<HTMLSpanElement> {
  label?: string;
  FormFieldProps?: Partial<FormFieldProps>;
}

export const GoToInput = forwardRef<HTMLSpanElement, GoToInputProps>(
  (
    {
      className,
      id: idProp,
      label = "Go to",
      FormFieldProps: { ...restFormFieldProps } = {},
      ...restProps
    },

    forwardedRef
  ) => {
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
    }, [paginatorElement, compact, rootRef.current]);

    if (compact) {
      return null;
    }

    const widthCh = `${`${count}`.length}ch`;

    return (
      <span
        className={cx(
          withBaseName("goToInputWrapper"),
          { [withBaseName(`${position!}GoToInput`)]: position },
          className
        )}
        ref={forkedRef}
      >
        <FormField
          className={withBaseName("goToInputField")}
          fullWidth={false}
          label={label}
          labelPlacement="left"
          {...restFormFieldProps}
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
