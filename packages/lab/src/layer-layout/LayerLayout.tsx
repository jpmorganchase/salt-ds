import {
  ComponentPropsWithoutRef,
  forwardRef,
  MouseEvent,
  SyntheticEvent,
  useRef,
} from "react";
import { clsx } from "clsx";

import { makePrefixer, useForkRef } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import layerLayoutCss from "./LayerLayout.css";

export const LAYER_POSITIONS = [
  "center",
  "left",
  "top",
  "right",
  "bottom",
] as const;

export type LayerPositions = typeof LAYER_POSITIONS[number];

export interface LayerLayoutProps extends ComponentPropsWithoutRef<"dialog"> {
  /**
   * Defines the layer position within the screen.
   */
  position?: LayerPositions;
  /**
   * You should use `showModal` or `show` instead.
   */
  open?: undefined;
}

const withBaseName = makePrefixer("saltLayerLayout");

export const LayerLayout = forwardRef<HTMLDialogElement, LayerLayoutProps>(
  function LayerLayout(props, ref) {
    const {
      children,
      className,
      position = "center",
      onClick,
      ...rest
    } = props;

    const dialogRef = useRef<HTMLDialogElement>(null);
    const handleRef = useForkRef(ref, dialogRef);
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-layer-layout",
      css: layerLayoutCss,
      window: targetWindow,
    });

    const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
      if (event.target === dialogRef.current) {
        dialogRef.current?.close("dismiss");
      }
      onClick?.(event);
    };

    return (
      <dialog
        className={clsx(withBaseName(), withBaseName(position), className)}
        ref={handleRef}
        onClick={handleClick}
        {...rest}
      >
        {children}
      </dialog>
    );
  }
);
