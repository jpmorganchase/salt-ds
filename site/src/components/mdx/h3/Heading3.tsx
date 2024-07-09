import type { ComponentPropsWithoutRef, FC, ReactNode } from "react";
import styles from "./Heading3.module.css";

interface Heading3Props extends ComponentPropsWithoutRef<"h3"> {
  children: ReactNode;
  id?: string;
}

export const Heading3: FC<Heading3Props> = ({ children, ...rest }) => (
  <h3 className={styles.heading3} {...rest}>
    {children}
  </h3>
);
