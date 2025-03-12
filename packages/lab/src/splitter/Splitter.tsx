import { type ReactNode, createContext, useContext } from "react";
import { PanelGroup, type PanelGroupProps } from "react-resizable-panels";

export type SplitterAppearance = "bordered" | "transparent";
export type SplitterOrientation = "horizontal" | "vertical";

export const OrientationContext =
  createContext<SplitterOrientation>("vertical");
export const AppearanceContext = createContext<SplitterAppearance>("bordered");

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

export function Splitter({
  orientation,
  appearance: appearanceProp,
  ...props
}: SplitterProps) {
  const appearanceContext = useContext(AppearanceContext);
  const appearance = appearanceProp ?? appearanceContext;

  const direction = orientation === "horizontal" ? "vertical" : "horizontal";

  return (
    <OrientationContext.Provider value={orientation}>
      <AppearanceContext.Provider value={appearance}>
        <PanelGroup
          data-orientation={orientation}
          data-appearance={appearance}
          direction={direction}
          {...props}
        />
      </AppearanceContext.Provider>
    </OrientationContext.Provider>
  );
}
