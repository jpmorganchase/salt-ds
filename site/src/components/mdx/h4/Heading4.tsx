import type { ComponentPropsWithoutRef, FC, ReactNode } from "react";
import styles from "./Heading4.module.css";

interface Heading4Props extends ComponentPropsWithoutRef<"h4"> {
  children: ReactNode;
  id?: string;
}

export const Heading4: FC<Heading4Props> = ({ children, ...rest }) => (
  <h4 className={styles.heading4} {...rest}>
    {children}
  </h4>
);
