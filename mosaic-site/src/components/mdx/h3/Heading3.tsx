import { FC, ReactNode } from "react";
import styles from "./Heading3.module.css";

type Heading3Props = {
  children: ReactNode;
  id?: string;
};

export const Heading3: FC<Heading3Props> = ({ children, ...rest }) => (
  <h3 className={styles.heading3} {...rest}>
    {children}
  </h3>
);
