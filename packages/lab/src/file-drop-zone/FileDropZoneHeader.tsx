import { StatusIndicator, ValidationStatus } from "@salt-ds/core";
import { forwardRef } from "react";
import { IconProps, UploadIcon } from "@salt-ds/icons";

export interface FileDropZoneHeaderProps extends IconProps {
  /**
   * Status indicator to be displayed.
   */
  status?: ValidationStatus;
  title?: string;
}

export const FileDropZoneHeader = forwardRef<
  SVGSVGElement,
  FileDropZoneHeaderProps
>(function FileDropZoneHeader(
  { status, title = "Drop files here or", size = 2, ...rest },
  ref
) {
  return (
    <>
      <div aria-live="polite">
        {status ? (
          <StatusIndicator ref={ref} status={status} size={size} {...rest} />
        ) : (
          <UploadIcon size={size} />
        )}
      </div>
      <strong>{title}</strong>
    </>
  );
});
