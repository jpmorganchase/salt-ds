import { createContext, useContext, type ReactNode } from "react";
import { PanelGroup, type PanelGroupProps } from "react-resizable-panels";

export const OrientationContext =
  createContext<SplitterProps["orientation"]>("horizontal");

export const AppearanceContext = createContext<SplitterAppearance>("bordered");
export type SplitterAppearance = "bordered" | "transparent";

export interface SplitterProps extends Omit<PanelGroupProps, "direction"> {
  /**
   * The orientation of the splitter.
   * Replaces `PanelGroupProps["direction"]`
   */
  orientation: PanelGroupProps["direction"];
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

  return (
    <OrientationContext.Provider value={orientation}>
      <AppearanceContext.Provider value={appearance}>
        <PanelGroup direction={orientation} {...props} />
      </AppearanceContext.Provider>
    </OrientationContext.Provider>
  );
}
