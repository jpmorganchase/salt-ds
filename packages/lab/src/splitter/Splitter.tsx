import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import { type ReactNode, createContext, useContext } from "react";
import {
  type ImperativePanelHandle,
  PanelGroup,
  type PanelGroupProps,
} from "react-resizable-panels";

import splitterCSS from "./Splitter.css";

export const OrientationContext =
  createContext<SplitterProps["orientation"]>("horizontal");

export const AppearanceContext = createContext<SplitterAppearance>("bordered");
export type SplitterAppearance = "bordered" | "transparent";

export type ImperativeSplitHandle = ImperativePanelHandle;

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

const withBaseName = makePrefixer("saltSplitter");

export function Splitter({
  orientation,
  appearance: appearanceProp,
  className,
  ...props
}: SplitterProps) {
  const targetWindow = useWindow();

  const appearanceContext = useContext(AppearanceContext);
  const appearance = appearanceProp ?? appearanceContext;

  useComponentCssInjection({
    testId: "salt-splitter",
    css: splitterCSS,
    window: targetWindow,
  });

  return (
    <OrientationContext.Provider value={orientation}>
      <AppearanceContext.Provider value={appearance}>
        <PanelGroup
          className={clsx(withBaseName(), className)}
          direction={orientation}
          {...props}
        />
      </AppearanceContext.Provider>
    </OrientationContext.Provider>
  );
}
