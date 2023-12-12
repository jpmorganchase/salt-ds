import { StatusIndicator, ValidationStatus } from "@salt-ds/core";
import { forwardRef } from "react";
import { IconProps, UploadIcon } from "@salt-ds/icons";

export interface FileDropZoneIconProps extends IconProps {
  /**
   * Status indicator to be displayed.
   */
  status?: ValidationStatus;
}

export const FileDropZoneIcon = forwardRef<
  SVGSVGElement,
  FileDropZoneIconProps
>(function FileDropZoneIcon({ status, size = 2, ...rest }, ref) {
  const iconProps = {
    ref,
    size,
    ...rest,
  };
  return status ? (
    <StatusIndicator status={status} {...iconProps} />
  ) : (
    <UploadIcon {...iconProps} />
  );
});
