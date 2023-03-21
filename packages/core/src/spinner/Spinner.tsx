import { clsx } from "clsx";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer, useId } from "../utils";
import { SpinnerSVG } from "./svgSpinners/SpinnerSVG";

import "./Spinner.css";

const withBaseName = makePrefixer("saltSpinner");

export interface SpinnerProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * A label for accessibility
   */
  "aria-label"?: string;
  /**
   * Determines the size of the spinner. Must be one of: 'default', 'large'.
   */
  size?: "default" | "large";
  /**
   * The ids of the SvgSpinner components
   */
  id?: string;
}

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  function Spinner({ className, size = "default", id: idProp, ...rest }, ref) {
    const id = useId(idProp);

    return (
      <div
        className={clsx(withBaseName(), withBaseName(size), className)}
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        {...rest}
      >
        <SpinnerSVG id={id} />
      </div>
    );
  }
);
