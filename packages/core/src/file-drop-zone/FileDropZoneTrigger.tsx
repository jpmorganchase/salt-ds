import {
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type FocusEvent,
  forwardRef,
  type MouseEvent,
  useRef,
} from "react";
import { Button, type ButtonProps } from "../button";
import { useForkRef } from "../utils";

export interface FileDropZoneTriggerProps
  extends Omit<ComponentPropsWithoutRef<"button">, "onChange"> {
  /**
   * `accept` attribute for HTML <input>.
   *
   * A comma separated list of file types the user can pick from the file input dialog box.
   */
  accept?: string;
  /**
   * Disable all trigger elements.
   */
  disabled?: boolean;
  /**
   * Allows multiple files to be uploaded.
   */
  multiple?: boolean;
  /**
   * The name applied to the hidden input.
   */
  name?: string;
  /**
   * Callback for input change event
   */
  onChange?: (event: ChangeEvent<HTMLInputElement>, files: File[]) => void;
  /**
   * The appearance of the button. Options are 'solid', 'bordered', and 'transparent'.
   * 'solid' is the default value.
   */
  appearance?: ButtonProps["appearance"];
  /**
   * The sentiment of the button. Options are 'accented' and 'neutral'.
   * 'neutral' is the default value.
   *
   */
  sentiment?: Extract<ButtonProps["sentiment"], "accented" | "neutral">;
}

export const FileDropZoneTrigger = forwardRef<
  HTMLButtonElement,
  FileDropZoneTriggerProps
>(function FileDropZoneTrigger(
  {
    accept,
    children,
    disabled,
    multiple = false,
    name,
    onClick,
    onChange,
    ...rest
  },
  ref,
) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useForkRef(ref, buttonRef);

  // As an ADA requirement when dialog is closed and the focus is returned to the input, we need to
  // move focus back on the button element so that all labels can be announced correctly
  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    event.stopPropagation();
    buttonRef.current?.focus();
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    event.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    onChange?.(event, files);

    // Reset after onChange so consumers can read the selected files first.
    // Clearing the value allows selecting the same file again - #3591.
    event.target.value = "";
  };
  return (
    <>
      <Button
        onClick={handleClick}
        disabled={disabled}
        ref={triggerRef}
        {...rest}
      >
        {children ?? "Browse files"}
      </Button>
      <input
        accept={accept}
        style={{ display: "none" }}
        disabled={disabled}
        multiple={multiple}
        name={name}
        onChange={handleChange}
        onFocus={handleFocus}
        ref={fileInputRef}
        type="file"
      />
    </>
  );
});
