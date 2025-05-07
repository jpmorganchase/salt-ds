import { H2 } from "@salt-ds/core";
import type { ComponentPropsWithoutRef, FC, ReactNode } from "react";
import styles from "./Heading2.module.css";

interface Heading2Props extends Omit<ComponentPropsWithoutRef<"h2">, "color"> {
  children: ReactNode;
  id?: string;
}
export const Heading2: FC<Heading2Props> = ({ children, ...rest }) => (
  <H2 className={styles.heading2} data-mdx="heading2" {...rest}>
    {children}
  </H2>
);
