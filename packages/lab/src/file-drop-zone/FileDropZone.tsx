import { makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import { DragEventHandler, forwardRef, HTMLAttributes, useState } from "react";
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
  status?: "success" | "error";
}

const withBaseName = makePrefixer("saltFileDropZone");

export const FileDropZone = forwardRef<HTMLDivElement, FileDropZoneProps>(
  function FileDropZone(
    {
      status,
      className,
      children,
      disabled,
      onDragOver: onDragOverProp,
      onDragLeave: onDragLeaveProp,
      onDrop: onDropProp,
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
      onDragOverProp?.(event);
    };

    const handleDragLeave: DragEventHandler<HTMLDivElement> = (event) => {
      setActive(false);
      onDragLeaveProp?.(event);
    };

    const handleDrop: DragEventHandler<HTMLDivElement> = (event) => {
      event.preventDefault();
      setActive(false);
      onDropProp?.(event);
    };

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
        {children}
      </div>
    );
  }
);
