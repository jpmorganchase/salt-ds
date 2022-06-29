import { Button, makePrefixer, useId } from "@jpmorganchase/uitk-core";
import { ErrorIcon, UploadIcon } from "@jpmorganchase/uitk-icons";
import cx from "classnames";
import {
  ChangeEventHandler,
  DragEvent,
  DragEventHandler,
  FocusEvent,
  forwardRef,
  HTMLAttributes,
  KeyboardEvent,
  ReactNode,
  SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { containsFiles, extractFiles, validateFiles } from "./internal/utils";
import { FilesValidator } from "./validators";

import "./FileDropZone.css";

// Recommended button label by ADA review
const buttonLabel = "Browse files";
const INVALID_DROP_TARGET = "Drop target doesn't contain any file.";

export type FilesAcceptedEventHandler = (
  files: ReadonlyArray<File>,
  event: SyntheticEvent
) => void;

export type FilesRejectedEventHandler<ErrorType = string> = (
  errors: ReadonlyArray<ErrorType>,
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
   * The text content of the drop area component.
   */
  children?: ReactNode;

  /**
   * Additional usage information.
   */
  description?: string;

  /**
   * If `true`, the file drop zone will be disabled.
   */
  disabled?: boolean;

  /**
   * This prop is used to help implement the accessibility logic.
   * If you don't provide this prop. It falls back to a randomly generated id.
   */
  id?: string;

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
  validate?: ReadonlyArray<FilesValidator<any>>;
}

const withBaseName = makePrefixer("uitkFileDropZone");

export const FileDropZone = forwardRef<HTMLDivElement, FileDropZoneProps>(
  function FileDropZone(
    {
      accept,
      className,
      children,
      description,
      disabled,
      id: idProp,
      validate,
      onFilesAccepted,
      onFilesRejected,
      ...restProps
    },
    ref
  ) {
    const id = useId(idProp);

    const iconId = `${id}-icon`;
    const buttonId = `${id}-button`;
    const descriptionId = `${id}-description`;

    const [dropResult, setDropResult] = useState<null | {
      event: SyntheticEvent;
      files?: ReadonlyArray<File>;
      errors: string[];
    }>(null);
    const [isActive, setActive] = useState(false);
    const [isRejected, setRejected] = useState(false);

    const buttonRef = useRef<HTMLButtonElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (!disabled && dropResult) {
        const { event, files, errors } = dropResult;

        if (errors && errors.length !== 0) {
          setRejected(true);
          if (!!onFilesRejected) {
            return onFilesRejected(errors, event);
          }
        }

        setRejected(false);
        return onFilesAccepted?.(files!, event);
      }
    }, [disabled, dropResult, onFilesAccepted, onFilesRejected]);

    const handleDragOver: DragEventHandler<HTMLDivElement> = (event) => {
      // Need to cancel the default events to allow drop
      // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Drag_operations#droptargets
      event.preventDefault();
      event.stopPropagation();

      if (disabled) {
        event.dataTransfer && (event.dataTransfer.dropEffect = "none");
        return;
      } else {
        // Not using 'move', otherwise apps like Outlook will delete the item
        event.dataTransfer && (event.dataTransfer.dropEffect = "copy");
      }

      if (!isActive && containsFiles(event)) {
        setActive(true);
      }
    };

    const handleDragLeave = () => setActive(false);

    const handleFilesDrop = (event: SyntheticEvent) => {
      if (!containsFiles(event as DragEvent)) {
        return setDropResult({
          event,
          errors: [INVALID_DROP_TARGET],
        });
      }

      const files = extractFiles(event as DragEvent);

      if (files.length > 0) {
        return setDropResult({
          event,
          files,
          errors: validate ? validateFiles({ files, validate }) : [],
        });
      }
    };

    const handleDrop: DragEventHandler<HTMLDivElement> = (event) => {
      event.preventDefault();
      event.stopPropagation();

      handleFilesDrop(event);
      setActive(false);
    };

    const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
      event.stopPropagation();

      handleFilesDrop(event);
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

    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLButtonElement>) => {
        if (["Enter", "Space"].indexOf(event.key) !== -1) {
          fileInputRef.current && fileInputRef.current.click();
        }
      },
      []
    );

    const fileDropZoneDescription = description ? (
      <div className="uitkFileDropZone-description" id={descriptionId}>
        {description}
      </div>
    ) : null;

    const buttonLabelledBy = (
      isRejected ? [buttonId, iconId, descriptionId] : [buttonId, descriptionId]
    ).join(" ");

    return (
      <div
        {...restProps}
        className={cx(
          withBaseName(),
          {
            [withBaseName("error")]: isRejected,
            [withBaseName("active")]: isActive,
            [withBaseName("disabled")]: disabled,
          },
          className
        )}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        ref={ref}
      >
        {/* TODO: Check whether we want to replace this with aria announce */}
        <div aria-live="polite">
          {/*
           * It is an ADA requirement to always display an input button.-
           */}
          {isRejected ? (
            <ErrorIcon
              aria-label="error!"
              className={withBaseName("icon")}
              size={24}
            />
          ) : (
            <UploadIcon className={withBaseName("icon")} size={24} />
          )}
          {isRejected && fileDropZoneDescription}
        </div>
        <div className={withBaseName("title")}>
          {children || "Drop files here or"}
        </div>
        <label className={withBaseName("inputRoot")}>
          <Button
            aria-labelledby={buttonLabelledBy}
            ref={buttonRef}
            className={withBaseName("inputButton")}
            data-testid="file-input-button"
            disabled={disabled}
            onKeyDown={handleKeyDown}
            onClick={handleInputClick}
          >
            {/* TODO: expose this in props */}
            {buttonLabel.toUpperCase()}
          </Button>
          <input
            accept={accept}
            className="input-hidden"
            data-testid="file-input"
            disabled={disabled}
            multiple
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            ref={fileInputRef}
            type="file"
          />
        </label>
        {!isRejected && fileDropZoneDescription}
      </div>
    );
  }
);
