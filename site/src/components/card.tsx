import { ComponentPropsWithoutRef, useRef } from "react";
import PencilIcon from "@site/static/img/pencil.svg";
import CodeIcon from "@site/static/img/code.svg";
import ArrowsIcon from "@site/static/img/arrows.svg";

import styles from "./Card.module.css";

type CardIconName = "pencil" | "code" | "arrows";

type CardIconsType = {
  name: CardIconName;
  icon: JSX.Element;
}[];

const cardIcons: CardIconsType = [
  { name: "pencil", icon: <PencilIcon className={styles.icon} /> },
  { name: "code", icon: <CodeIcon className={styles.icon} /> },
  { name: "arrows", icon: <ArrowsIcon className={styles.icon} /> },
];

export interface CardProps extends ComponentPropsWithoutRef<"div"> {
  icon?: CardIconName;
  title?: string;
  description?: string;
}

const Card = ({ icon, title, description }: CardProps): JSX.Element => {
  const cardIcon = cardIcons.find((cardIcon) => cardIcon.name === icon);

  return (
    <div className={styles.card}>
      {cardIcon.icon}
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
};

export default Card;
