import type { IconProps } from "@salt-ds/icons";
import { forwardRef } from "react";
import { useIcon } from "../semantic-icon-provider";
import { StatusIndicator, type ValidationStatus } from "../status-indicator";

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

  const { UploadIcon } = useIcon();
  return status ? (
    <StatusIndicator status={status} {...iconProps} />
  ) : (
    <UploadIcon {...iconProps} />
  );
});
