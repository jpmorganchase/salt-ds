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
  linkText: string;
  keylineColor: CSSProperties["color"];
  disableKeylineAnimation?: boolean;
}

const Card = ({
  icon,
  title,
  description,
  url,
  linkText,
  keylineColor,
  disableKeylineAnimation = false,
}: CardProps): JSX.Element => {
  const ref = useRef<HTMLDivElement>();

  const onScreen: boolean = useOnScreen<HTMLDivElement>(ref, "-100px");

  const { mode } = useTheme();

  const useLightTheme = mode !== "dark";

  return (
    <div className={clsx(styles.card, { [styles.lightTheme]: useLightTheme })}>
      <div className={styles.iconContainer}>{icon}</div>
      <div className={styles.cardContent}>
        <h2>{title}</h2>
        <p>{description}</p>
        <Link to={url}>{linkText}</Link>
      </div>
      <div
        className={clsx(styles.keyline, {
          [styles.animate]: onScreen && !disableKeylineAnimation,
        })}
        style={{
          backgroundColor: keylineColor,
        }}
        ref={ref}
      />
    </div>
  );
};

export default Card;
