import { FC, ReactNode } from "react";
import styles from "./Heading4.module.css";

type Heading4Props = {
  children: ReactNode;
  id?: string;
};

export const Heading4: FC<Heading4Props> = ({ children, ...rest }) => (
  <h4 className={styles.heading4} {...rest}>
    {children}
  </h4>
);
