import {
  type ChangeEvent,
  type FocusEvent,
  forwardRef,
  type HTMLAttributes,
  type SyntheticEvent,
  useRef,
} from "react";
import { Button } from "../button";
import { useForkRef } from "../utils";

export interface FileDropZoneTriggerProps
  extends Omit<HTMLAttributes<HTMLButtonElement>, "onChange"> {
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
   * Callback for input change event
   */
  onChange?: (event: ChangeEvent<HTMLInputElement>, files: File[]) => void;
}

export const FileDropZoneTrigger = forwardRef<
  HTMLButtonElement,
  FileDropZoneTriggerProps
>(function FileDropZoneTrigger(
  { accept, children, disabled, multiple = false, onChange, ...rest },
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

  const handleClick = (event: SyntheticEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    // Allow selecting the same file multiple times - #3591
    // User would still be able to put back the value in onChange, if necessary
    event.target.value = "";
    onChange?.(event, files);
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
        onChange={handleChange}
        onFocus={handleFocus}
        ref={fileInputRef}
        type="file"
      />
    </>
  );
});
