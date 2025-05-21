import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import styles from "./SecondarySidebar.module.css";

export const SecondarySidebar = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(function SecondarySidebar({ className, ...rest }, ref) {
  return (
    <div
      // Make the side bar appear smaller using MD class,
      // temporary solution until we have alternative design for the right bar
      className={clsx("salt-density-medium", styles.root, className)}
      ref={ref}
      {...rest}
    />
  );
});
