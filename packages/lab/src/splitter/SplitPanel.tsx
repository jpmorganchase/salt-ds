import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import { forwardRef } from "react";
import {
  type ImperativePanelHandle,
  Panel,
  type PanelProps,
} from "react-resizable-panels";

import splitPanelCSS from "./SplitPanel.css";

export type SplitPanelVariant = "primary" | "secondary" | "tertiary";

export interface SplitPanelProps extends PanelProps {
  /**
   * Styling variant
   * @default "primary"
   */
  variant?: SplitPanelVariant;
}

const withBaseName = makePrefixer("saltSplitPanel");

export const SplitPanel = forwardRef<ImperativePanelHandle, SplitPanelProps>(
  function SplitPanel({ variant = "primary", className, ...props }, ref) {
    const targetWindow = useWindow();

    useComponentCssInjection({
      testId: "salt-split-panel",
      css: splitPanelCSS,
      window: targetWindow,
    });

    return (
      <Panel
        data-variant="primary"
        className={clsx(withBaseName(), variant && withBaseName(variant))}
        {...props}
      />
    );
  },
);
