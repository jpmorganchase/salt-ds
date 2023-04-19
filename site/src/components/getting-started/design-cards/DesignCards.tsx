import { Children, ReactNode } from "react";
import splitArray from "../../../utils/splitArray";
import styles from "./DesignCards.module.css";

export const DesignCards = ({ children }: { children: ReactNode }) => {
  const childrenArray = Children.toArray(children);
  const [firstRow, secondRow] = splitArray(childrenArray);

  return (
    <div className={styles.designCardsContainer}>
      <div className={styles.row}>{firstRow}</div>
      <div className={styles.row}>{secondRow}</div>
    </div>
  );
};
