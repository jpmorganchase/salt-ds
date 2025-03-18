import { type ReactNode, createContext, forwardRef, useContext } from "react";
import {
  type ImperativePanelGroupHandle,
  PanelGroup,
  type PanelGroupProps,
} from "react-resizable-panels";

export type SplitterAppearance = "bordered" | "transparent";
export type SplitterOrientation = "horizontal" | "vertical";

export const SplitterOrientationContext =
  createContext<SplitterOrientation>("vertical");
export const SplitterAppearanceContext =
  createContext<SplitterAppearance>("bordered");

export interface SplitterProps extends Omit<PanelGroupProps, "direction"> {
  /**
   * The orientation of the splitter.
   * Replaces `PanelGroupProps["direction"]`
   */
  orientation: SplitterOrientation;
  /**
   * The appearance of the splitter.
   * If set to "transparent", the splitter handle will
   * be transparent, hence the background will be visible.
   * @default "bordered"
   */
  appearance?: SplitterAppearance;
  children: ReactNode;
}

export const Splitter = forwardRef<ImperativePanelGroupHandle, SplitterProps>(
  function Splitter(
    { orientation, appearance: appearanceProp, ...props },
    ref,
  ) {
    const appearanceContext = useContext(SplitterAppearanceContext);
    const appearance = appearanceProp ?? appearanceContext;

    // Re-map the splitter's orientation to the direction expected by the react-resizable-panels API.
    // A "horizontal" splitter orientation requires a "vertical" panel direction, and vice versa.
    const direction = orientation === "horizontal" ? "vertical" : "horizontal";

    return (
      <SplitterOrientationContext.Provider value={orientation}>
        <SplitterAppearanceContext.Provider value={appearance}>
          <PanelGroup ref={ref} direction={direction} {...props} />
        </SplitterAppearanceContext.Provider>
      </SplitterOrientationContext.Provider>
    );
  },
);
