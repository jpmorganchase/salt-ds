import { FC, CSSProperties } from "react";
export interface FlexboxProps {
  style?: CSSProperties;
  height?: number;
  row?: boolean;
  width?: number;
}
/**
 * Container for testing responsive components - a bit basic, but
 * does the job for now
 */
export declare const AdjustableFlexbox: FC<FlexboxProps>;
