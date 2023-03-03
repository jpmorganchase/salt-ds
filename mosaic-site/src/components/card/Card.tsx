import {
  ComponentPropsWithoutRef,
  useRef,
  cloneElement,
  CSSProperties,
  MutableRefObject,
  ReactNode,
} from "react";
import clsx from "clsx";
import { Link } from "@jpmorganchase/mosaic-site-components";

import { useTheme, useViewport } from "@salt-ds/core";

import useOnScreen from "../../utils/useOnScreen";

import styles from "./Card.module.css";

export interface CardProps extends ComponentPropsWithoutRef<"div"> {
  icon?: JSX.Element;
  inlineIcon?: JSX.Element;
  title?: string;
  description: JSX.Element | ReactNode;
  url: string;
  footerText: string;
  keylineColor: CSSProperties["color"];
  keyLineAnimation?: boolean;
}

export const Card = ({
  icon,
  inlineIcon,
  title,
  description,
  url,
  footerText,
  keylineColor,
  keyLineAnimation = true,
}: CardProps): JSX.Element => {
  const ref = useRef<HTMLDivElement>() as MutableRefObject<HTMLDivElement>;

  const onScreen: boolean = useOnScreen<HTMLDivElement>(ref, "-100px");

  const { mode } = useTheme();

  const useLightTheme = mode !== "dark";

  return (
    <Link
      className={clsx(styles.card, { [styles.lightTheme]: useLightTheme })}
      href={url}
    >
      {icon && (
        <div className={styles.iconContainer}>
          {cloneElement(icon, { ...icon.props, className: styles.icon })}
        </div>
      )}
      <div className={styles.cardContent}>
        <div className={styles.cardTitle}>
          {title && <h2>{title}</h2>}
          {inlineIcon && <div className={styles.inlineIcon}>{inlineIcon}</div>}
        </div>
        <div className={styles.cardDescription}>{description}</div>
        <div className={styles.cardFooter}>
          <p>{footerText}</p>
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

export const InlineCard = ({
  icon,
  description,
  url,
  footerText,
  keylineColor,
}: CardProps): JSX.Element => {
  const ref = useRef<HTMLDivElement>() as MutableRefObject<HTMLDivElement>;

  const { mode } = useTheme();

  const viewport = useViewport();
  const isTabletView = viewport <= 1070;

  const useLightTheme = mode !== "dark";

  if (isTabletView) {
    return (
      <Card
        icon={icon}
        description={description}
        url={url}
        footerText={footerText}
        keylineColor={keylineColor}
        keyLineAnimation={false}
      />
    );
  }

  return (
    <Link
      className={clsx(styles.inlineCard, {
        [styles.lightTheme]: useLightTheme,
      })}
      href={url}
    >
      <div className={styles.inlineCardContent}>
        {icon && (
          <div className={styles.iconContainer}>
            {cloneElement(icon, { ...icon.props, className: styles.icon })}
          </div>
        )}
        <div className={styles.textContainer}>
          <div className={styles.cardText}>
            <div className={styles.cardDescription}>{description}</div>
            <p className={styles.cardFooter}>{footerText}</p>
          </div>

          <div
            className={styles.keyline}
            style={{
              backgroundColor: keylineColor,
            }}
            ref={ref}
          />
        </div>
      </div>
    </Link>
  );
};
