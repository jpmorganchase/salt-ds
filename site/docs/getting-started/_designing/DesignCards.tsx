import { Children } from "react";
import useSplitArray from "@site/src/utils/useSplitArray";
import styles from "./DesignCards.module.css";

type CardInfoType = { img: string; altText: string; content?: string };

const DesignCards = ({ children }) => {
  const childrenArray = Children.toArray(children);
  const [firstRow, secondRow] = useSplitArray(childrenArray);

  return (
    <div className={styles.designCardsContainer}>
      <div className={styles.row}>{firstRow}</div>
      <div className={styles.row}>{secondRow}</div>
    </div>
  );
};

export const DesignCard = ({ img, altText, children }: CardInfoType) => (
  <div className={styles.card}>
    <img src={img} alt={altText} />
    <div className={styles.textContainer}>{children}</div>
  </div>
);

export default DesignCards;
