import { Button, useForkRef, ValidationStatus } from "@salt-ds/core";
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
   * Callback for input change event
   */
  onChange?: (event: SyntheticEvent<HTMLInputElement>) => void;
  /**
   * Status indicator to be displayed.
   */
  status?: ValidationStatus;
}

export const FileDropZoneTrigger = forwardRef<
  HTMLButtonElement,
  FileDropZoneTriggerProps
>(function FileDropZoneTrigger({ disabled, accept, onChange, ...rest }, ref) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // As an ADA requirement when dialog is closed and the focus is returned to the input, we need to
  // move focus back on the button element so that all labels can be announced correctly
  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    event.stopPropagation();
    buttonRef.current && buttonRef.current.focus();
  };

  const handleClick = (event: SyntheticEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    fileInputRef.current && fileInputRef.current.click();
  };

  return (
    <>
      <Button
        data-testid="file-input-button"
        onClick={handleClick}
        disabled={disabled}
        ref={useForkRef(ref, buttonRef)}
        {...rest}
      >
        Browse files
      </Button>
      <input
        accept={accept}
        className="input-hidden"
        data-testid="file-input"
        disabled={disabled}
        multiple
        onChange={onChange}
        onFocus={handleFocus}
        ref={fileInputRef}
        type="file"
      />
    </>
  );
});
