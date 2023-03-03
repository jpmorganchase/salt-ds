import { Children } from "react";
import useSplitArray from "../../../utils/useSplitArray";
import styles from "./DesignCards.module.css";

export const DesignCards = ({ children }) => {
  const childrenArray = Children.toArray(children);
  const [firstRow, secondRow] = useSplitArray(childrenArray);

  return (
    <div className={styles.designCardsContainer}>
      <div className={styles.row}>{firstRow}</div>
      <div className={styles.row}>{secondRow}</div>
    </div>
  );
};
