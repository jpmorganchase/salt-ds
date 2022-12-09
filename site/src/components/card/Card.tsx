import {
  ComponentPropsWithoutRef,
  useRef,
  cloneElement,
  CSSProperties,
} from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import { useTheme } from "@jpmorganchase/uitk-core";
import { TearOutIcon } from "@jpmorganchase/uitk-icons";

import useOnScreen from "../../utils/useOnScreen";

import styles from "./Card.module.css";

export interface FooterProps {
  isExternalLink?: boolean;
  footerText: string;
}

export interface CardProps extends ComponentPropsWithoutRef<"div"> {
  icon?: JSX.Element;
  inlineIcon?: JSX.Element;
  title: string;
  description: string;
  url: string;
  footer: FooterProps;
  keylineColor: CSSProperties["color"];
  keyLineAnimation?: boolean;
}

const Card = ({
  icon,
  inlineIcon,
  title,
  description,
  url,
  footer: { footerText, isExternalLink },
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
      {icon && (
        <div className={styles.iconContainer}>
          {cloneElement(icon, { ...icon.props, className: styles.icon })}
        </div>
      )}
      <div className={styles.cardContent}>
        <span className={styles.cardTitle}>
          <h2>{title}</h2>
          {inlineIcon && <div className={styles.inlineIcon}>{inlineIcon}</div>}
        </span>
        <p className={styles.cardDescription}>{description}</p>
        <div className={styles.cardFooter}>
          <p>{footerText}</p> {isExternalLink && <TearOutIcon />}
        </div>
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
