import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import styles from "./PrimarySidebar.module.css";

export const PrimarySidebar = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(function PrimarySidebar({ className, ...rest }, ref) {
  return <div className={clsx(styles.root, className)} ref={ref} {...rest} />;
});
