import { makePrefixer, useForkRef, ValidationStatus } from "@salt-ds/core";
import { clsx } from "clsx";
import {
  DragEventHandler,
  forwardRef,
  HTMLAttributes,
  useRef,
  useState,
} from "react";
import { containsFiles } from "./internal/utils";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import fileDropZoneCss from "./FileDropZone.css";

export interface FileDropZoneProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * If `true`, the file drop zone will be disabled.
   */
  disabled?: boolean;
  /**
   * Status indicator to be displayed.
   */
  status?: Omit<ValidationStatus, "info" | "warning">;
}

const withBaseName = makePrefixer("saltFileDropZone");

export const FileDropZone = forwardRef<HTMLDivElement, FileDropZoneProps>(
  function FileDropZone(
    {
      status,
      className,
      children,
      disabled,
      onDragOver,
      onDragLeave,
      onDrop,
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

    const regionRef = useRef<HTMLDivElement>(null);
    const dropZoneRef = useForkRef(ref, regionRef);

    const handleDragOver: DragEventHandler<HTMLDivElement> = (event) => {
      // Need to cancel the default events to allow drop
      // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Drag_operations#droptargets

      event.preventDefault();
      event.stopPropagation();

      if (disabled) {
        if (event.dataTransfer) {
          event.dataTransfer.dropEffect = "none";
        }
        return;
      }
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "copy";
      }
      if (!isActive && containsFiles(event)) {
        setActive(true);
      }
      onDragOver?.(event);
    };

    const handleDragLeave: DragEventHandler<HTMLDivElement> = (event) => {
      if (disabled) {
        return;
      }
      const region = regionRef?.current;
      const eventTarget = event.relatedTarget;
      if (eventTarget !== region && !region?.contains(eventTarget as Node)) {
        setActive(false);
      }
      onDragLeave?.(event);
    };

    const handleDrop: DragEventHandler<HTMLDivElement> = (event) => {
      if (disabled) {
        return;
      }
      event.preventDefault();
      setActive(false);
      onDrop?.(event);
    };

    return (
      <div
        className={clsx(
          withBaseName(),
          {
            [withBaseName(status as string)]: status,
            [withBaseName("active")]: isActive,
            [withBaseName("disabled")]: disabled,
          },
          className
        )}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        ref={dropZoneRef}
        {...restProps}
      >
        {children}
      </div>
    );
  }
);
