import {
  ComponentPropsWithoutRef,
  useRef,
  cloneElement,
  CSSProperties,
} from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import { useTheme } from "@jpmorganchase/uitk-core";

import useOnScreen from "../../utils/useOnScreen";

import styles from "./Card.module.css";

export interface CardProps extends ComponentPropsWithoutRef<"div"> {
  icon: JSX.Element;
  title: string;
  description: string;
  url: string;
  footer: string;
  keylineColor: CSSProperties["color"];
  keyLineAnimation?: boolean;
}

const Card = ({
  icon,
  title,
  description,
  url,
  footer,
  keylineColor,
  keyLineAnimation = true,
}: CardProps): JSX.Element => {
  const ref = useRef<HTMLDivElement>();

  const onScreen: boolean = useOnScreen<HTMLDivElement>(ref, "-100px");

  const { mode } = useTheme();

  const useLightTheme = mode !== "dark";

  return (
    <Link
      className={clsx(styles.card, { [styles.lightTheme]: useLightTheme })}
      to={url}
    >
      <div className={styles.iconContainer}>
        {cloneElement(icon, { ...icon.props, className: styles.icon })}
      </div>
      <div className={styles.cardContent}>
        <h2 className={styles.cardTitle}>{title}</h2>
        <p className={styles.cardDescription}>{description}</p>
        <p className={styles.cardFooter}>{footer}</p>
      </div>
      <div
        className={clsx(styles.keyline, {
          [styles.animate]: onScreen && keyLineAnimation,
        })}
        style={{
          backgroundColor: keylineColor,
        }}
        ref={ref}
      />
    </Link>
  );
};

export default Card;
