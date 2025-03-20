import { makePrefixer, useId } from "@salt-ds/core";
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
  function SplitPanel(
    { id: idProp, variant = "primary", minSize = 10, className, ...props },
    ref,
  ) {
    const id = useId(idProp);
    const targetWindow = useWindow();

    useComponentCssInjection({
      testId: "salt-split-panel",
      css: splitPanelCSS,
      window: targetWindow,
    });

    return (
      <Panel
        id={id}
        minSize={minSize}
        data-variant={variant}
        className={clsx(withBaseName(), withBaseName(variant), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
