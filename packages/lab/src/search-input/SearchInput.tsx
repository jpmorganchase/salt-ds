import { Button, useControlled, useForkRef, useIcon } from "@salt-ds/core";
import { SearchIcon } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ChangeEvent,
  type ComponentType,
  forwardRef,
  type KeyboardEvent,
  type SyntheticEvent,
  useRef,
} from "react";
import {
  InputLegacy as Input,
  type InputLegacyProps as InputProps,
  StaticInputAdornment,
} from "../input-legacy";

import searchInputCss from "./SearchInput.css";

const baseName = "saltSearchInput";

//TODO formfield integration

export interface SearchInputProps extends Omit<InputProps, "onSubmit"> {
  /**
   * Override "search" icon.
   * Set to `null` to hide.
   */
  IconComponent?: ComponentType<any> | null;
  /**
   * Callback for when clear button is clicked.
   */
  onClear?: () => void;
  /**
   * Callback for change event.
   * Event is either an Input change event or a Button click event.
   */
  onChange?: (event: SyntheticEvent<unknown>, value: string) => void;
  /**
   * Callback to trigger search.
   */
  onSubmit?: (value: InputProps["value"]) => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    {
      IconComponent = SearchIcon,
      className,
      onChange,
      onClear,
      onKeyUp,
      onSubmit,
      value: valueProp,
      defaultValue,
      ...other
    },
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-search-input",
      css: searchInputCss,
      window: targetWindow,
    });
    const { CloseIcon } = useIcon();
    const inputRef = useRef<HTMLInputElement>(null);
    const handleRef = useForkRef(inputRef, ref);

    const [value, setValue, isControlled] = useControlled({
      controlled: valueProp,
      default: defaultValue,
      name: "SearchInput",
      state: "value",
    });

    const handleChange = (
      event: ChangeEvent<HTMLInputElement>,
      newValue: string,
    ) => {
      setValue(newValue);
      onChange?.(event, newValue);
    };

    const handleClear = (event: SyntheticEvent<HTMLButtonElement>) => {
      setValue("");
      if (!isControlled) {
        onChange?.(event, "");
      }
      onClear?.();
      inputRef.current?.focus();
    };

    const handleKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" && onSubmit && value) {
        onSubmit?.(value);
      }

      onKeyUp?.(event);
    };

    return (
      <Input
        className={clsx(baseName, className)}
        ref={handleRef}
        endAdornment={
          !!value && (
            <Button
              className={clsx(`${baseName}-clearButton`)}
              onClick={handleClear}
              variant="secondary"
            >
              <CloseIcon
                aria-label="clear input"
                className={`${baseName}-clearIcon`}
              />
            </Button>
          )
        }
        onChange={handleChange}
        onKeyUp={handleKeyUp}
        startAdornment={
          IconComponent && (
            <StaticInputAdornment>
              <IconComponent className={`${baseName}-icon`} />
            </StaticInputAdornment>
          )
        }
        value={value || ""}
        {...other}
      />
    );
  },
);
