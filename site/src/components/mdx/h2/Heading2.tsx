import type { ComponentPropsWithoutRef, FC, ReactNode } from "react";
import styles from "./Heading2.module.css";

interface Heading2Props extends ComponentPropsWithoutRef<"h2"> {
  children: ReactNode;
  id?: string;
}
export const Heading2: FC<Heading2Props> = ({ children, ...rest }) => (
  <h2 className={styles.heading2} {...rest}>
    {children}
  </h2>
);
