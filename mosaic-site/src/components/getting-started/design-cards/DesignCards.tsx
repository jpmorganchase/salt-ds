import { Children, ReactNode } from "react";
import { Image } from "@jpmorganchase/mosaic-site-components";
import useSplitArray from "../../../utils/useSplitArray";
import styles from "./DesignCards.module.css";

type DesignCardProps = { src: string; alt: string; children: ReactNode };

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

export const DesignCard = ({ src, alt, children }: DesignCardProps) => (
  <div className={styles.card}>
    <Image src={src} alt={alt} nextImageClassName={""} />
    <div className={styles.textContainer}>{children}</div>
  </div>
);
