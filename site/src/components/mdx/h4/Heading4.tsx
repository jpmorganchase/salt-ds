import { H4 } from "@salt-ds/core";
import type { ComponentPropsWithoutRef, FC, ReactNode } from "react";
import styles from "./Heading4.module.css";

interface Heading4Props extends Omit<ComponentPropsWithoutRef<"h4">, "color"> {
  children: ReactNode;
  id?: string;
}

export const Heading4: FC<Heading4Props> = ({ children, ...rest }) => (
  <H4 className={styles.heading4} {...rest}>
    {children}
  </H4>
);
