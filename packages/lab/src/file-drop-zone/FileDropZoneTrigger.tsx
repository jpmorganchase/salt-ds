import { Button, useForkRef } from "@salt-ds/core";
import {
  FocusEvent,
  forwardRef,
  HTMLAttributes,
  SyntheticEvent,
  useRef,
} from "react";

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
  onChange?: (event: SyntheticEvent<HTMLInputElement>) => void;
}

export const FileDropZoneTrigger = forwardRef<
  HTMLButtonElement,
  FileDropZoneTriggerProps
>(function FileDropZoneTrigger(
  { accept, children, disabled, multiple = false, onChange, ...rest },
  ref
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
        className="input-hidden"
        data-testid="file-input"
        disabled={disabled}
        multiple={multiple}
        onChange={onChange}
        onFocus={handleFocus}
        ref={fileInputRef}
        type="file"
      />
    </>
  );
});
