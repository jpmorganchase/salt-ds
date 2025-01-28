import { createContext, type ReactNode } from "react";
import { PanelGroup, type PanelGroupProps } from "react-resizable-panels";

export const OrientationContext =
  createContext<SplitterProps["orientation"]>("horizontal");

export interface SplitterProps extends Omit<PanelGroupProps, "direction"> {
  /**
   * The orientation of the splitter.
   * Replaces `PanelGroupProps["direction"]`
   */
  orientation: PanelGroupProps["direction"];
  children: ReactNode;
}

export function Splitter({ orientation, ...props }: SplitterProps) {
  return (
    <OrientationContext.Provider value={orientation}>
      <PanelGroup direction={orientation} {...props} />
    </OrientationContext.Provider>
  );
}
