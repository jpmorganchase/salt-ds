import { Children, type ReactNode } from "react";
import splitArray from "../../../utils/splitArray";
import styles from "./DesignCards.module.css";

export const DesignCards = ({
  children,
  columns = 2,
}: {
  children: ReactNode;
  columns: number;
}) => {
  const childrenArray = Children.toArray(children);
  const rows = splitArray(childrenArray, 2);

  return (
    <div className={styles.designCardsContainer}>
      {rows.map((cards, i) => (
        <div className={styles.row} key={i}>
          {cards}
        </div>
      ))}
    </div>
  );
};
