import { ComponentPropsWithoutRef, useMemo, useRef } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import PencilIcon from "@site/static/img/pencil.svg";
import CodeIcon from "@site/static/img/code.svg";
import ArrowsIcon from "@site/static/img/arrows.svg";
import useOnScreen from "../../utils/useOnScreen";

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

const getKeylineColor = (icon: CardIconName) => {
  switch (icon) {
    case "pencil":
      return "purple-50";
    case "code":
      return "teal-50";
    case "arrows":
      return "orange-30";
    default:
      return "orange-30";
  }
};

export interface CardProps extends ComponentPropsWithoutRef<"div"> {
  icon: CardIconName;
  title: string;
  description: string;
  url: string;
  linkText: string;
}

const Card = ({
  icon,
  title,
  description,
  url,
  linkText,
}: CardProps): JSX.Element => {
  const cardIcon = useMemo(
    () => cardIcons.find((cardIcon) => cardIcon.name === icon),
    [icon]
  );

  const ref = useRef<HTMLDivElement>();

  const onScreen: boolean = useOnScreen<HTMLDivElement>(ref, "-100px");

  return (
    <>
      <div className={styles.card}>
        <div className={styles.iconContainer}>{cardIcon.icon}</div>
        <div className={styles.cardContent}>
          <h2>{title}</h2>
          <p>{description}</p>
          <Link to={url}>{linkText}</Link>
        </div>
        <div
          className={clsx(styles.keyline, { [styles.animate]: onScreen })}
          style={{
            backgroundColor: `var(--uitk-color-${getKeylineColor(icon)})`,
          }}
          ref={ref}
        />
      </div>
    </>
  );
};

export default Card;
