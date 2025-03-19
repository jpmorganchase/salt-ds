import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import styles from "./SecondarySidebar.module.css";

export const SecondarySidebar = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(function SecondarySidebar({ className, ...rest }, ref) {
  return <div className={clsx(styles.root, className)} ref={ref} {...rest} />;
});
