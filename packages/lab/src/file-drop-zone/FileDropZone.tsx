import { Button, ButtonProps, makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import {
  ComponentType,
  DragEvent,
  DragEventHandler,
  FocusEvent,
  forwardRef,
  HTMLAttributes,
  ReactNode,
  SyntheticEvent,
  useCallback,
  useRef,
  useState,
} from "react";
import { containsFiles, extractFiles, validateFiles } from "./internal/utils";
import { FilesValidator } from "./validators";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import fileDropZoneCss from "./FileDropZone.css";
import { FileDropZoneHeader } from "./FileDropZoneHeader";
import { IconProps } from "@salt-ds/icons";

const INVALID_DROP_TARGET = "Drop target doesn't contain any file.";

export type FilesAcceptedEventHandler = (
  files: readonly File[],
  event: SyntheticEvent
) => void;

export type FilesRejectedEventHandler<ErrorType = string> = (
  errors: readonly ErrorType[],
  event: SyntheticEvent
) => void;

/**
 * Removed deprecated props
 *
 * - onDrop
 * - onFileTypeError
 * - showUploadButton
 */

export interface FileDropZoneProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * `accept` attribute for HTML <input>.
   *
   * A comma separated list of file types the user can pick from the file input dialog box.
   */
  accept?: string;

  /**
   * The content of the drop area component.
   */
  children?: ReactNode;
  /**
   * If `true`, the file drop zone will be disabled.
   */
  disabled?: boolean;
  /**
   * Callback on successful file drop or selection.
   */
  onFilesAccepted?: FilesAcceptedEventHandler;

  /**
   * @see `validate` prop
   * Callback on drop or input in case of an error. A list of errors will be provided as input.
   */
  onFilesRejected?: FilesRejectedEventHandler;
  /**
   * A list of custom validation functions. Every function is provided with the entire file list as input
   * thus can perform validations on all files. Each function needs to return one or more errors in case of
   * a failed validation, or `undefined` in case of a successful one.
   *
   * All errors are collected in the end and returned as an array to `onFilesRejected`.
   */
  validate?: readonly FilesValidator[];
  HeaderComponent?: ComponentType<IconProps> | null;
  TriggerComponent?: ComponentType<ButtonProps>;
  status?: "success" | "error";
}

const withBaseName = makePrefixer("saltFileDropZone");

const FileDropZoneButton = forwardRef<HTMLButtonElement>(
  function FileDropZoneButton({ ...props }, ref) {
    return (
      <Button ref={ref} data-testid="file-input-button" {...props}>
        Browse files
      </Button>
    );
  }
);

export const FileDropZone = forwardRef<HTMLDivElement, FileDropZoneProps>(
  function FileDropZone(
    {
      HeaderComponent = FileDropZoneHeader,
      accept,
      status,
      className,
      children,
      disabled,
      validate,
      onFilesAccepted,
      onFilesRejected,
      TriggerComponent = FileDropZoneButton,
      ...restProps
    },
    ref
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-file-drop-zone",
      css: fileDropZoneCss,
      window: targetWindow,
    });
    const [isActive, setActive] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver: DragEventHandler<HTMLDivElement> = (event) => {
      // Need to cancel the default events to allow drop
      // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Drag_operations#droptargets

      event.preventDefault();
      event.stopPropagation();

      if (disabled) {
        event.dataTransfer && (event.dataTransfer.dropEffect = "none");
        return;
      }
      event.dataTransfer && (event.dataTransfer.dropEffect = "copy");
      if (!isActive && containsFiles(event)) {
        setActive(true);
      }
    };

    const handleDragLeave = () => {
      setActive(false);
    };

    const handleFilesDrop = (event: SyntheticEvent) => {
      event.stopPropagation();
      if (!containsFiles(event as DragEvent)) {
        const errors = [INVALID_DROP_TARGET];
        return onFilesRejected?.(errors, event);
      }
      const files = extractFiles(event as DragEvent);
      if (files.length > 0) {
        const errors = validate ? validateFiles({ files, validate }) : [];
        if (errors && errors.length !== 0) {
          return onFilesRejected?.(errors, event);
        }
        return onFilesAccepted?.(files, event);
      }
    };

    const handleDrop: DragEventHandler<HTMLDivElement> = (event) => {
      event.preventDefault();
      handleFilesDrop(event);
      setActive(false);
    };

    // As an ADA requirement when dialog is closed and the focus is returned to the input, we need to
    // move focus back on the button element so that all labels can be announced correctly
    const handleInputFocus = useCallback(
      (event: FocusEvent<HTMLInputElement>) => {
        event.stopPropagation();
        buttonRef.current && buttonRef.current.focus();
      },
      []
    );

    const handleInputClick = useCallback(
      (event: SyntheticEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        fileInputRef.current && fileInputRef.current.click();
      },
      []
    );
    return (
      <div
        className={clsx(
          withBaseName(),
          {
            [withBaseName("error")]: status === "error",
            [withBaseName("success")]: status === "success",
            [withBaseName("active")]: isActive,
            [withBaseName("disabled")]: disabled,
          },
          className
        )}
        onDragLeave={!disabled ? handleDragLeave : undefined}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        ref={ref}
        {...restProps}
      >
        {HeaderComponent && <HeaderComponent status={status} />}

        {/* TODO: pass labelledBy to trigger */}
        <TriggerComponent
          onClick={handleInputClick}
          disabled={disabled}
          ref={buttonRef}
        />
        {children}
        <input
          accept={accept}
          className="input-hidden"
          data-testid="file-input"
          disabled={disabled}
          multiple
          onChange={handleFilesDrop}
          onFocus={handleInputFocus}
          ref={fileInputRef}
          type="file"
        />
      </div>
    );
  }
);
