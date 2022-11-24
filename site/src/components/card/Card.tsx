import {
  ComponentPropsWithoutRef,
  useRef,
  cloneElement,
  CSSProperties,
} from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";

import useOnScreen from "../../utils/useOnScreen";

import styles from "./Card.module.css";

export interface CardProps extends ComponentPropsWithoutRef<"div"> {
  icon: JSX.Element;
  title: string;
  description: string;
  url: string;
  linkText: string;
  keylineColor: CSSProperties["color"];
}

const Card = ({
  icon,
  title,
  description,
  url,
  linkText,
  keylineColor,
}: CardProps): JSX.Element => {
  const ref = useRef<HTMLDivElement>();

  const onScreen: boolean = useOnScreen<HTMLDivElement>(ref, "-100px");

  return (
    <>
      <div className={styles.card}>
        <div className={styles.iconContainer}>
          {cloneElement(icon, { ...icon.props, className: styles.icon })}
        </div>
        <div className={styles.cardContent}>
          <h2>{title}</h2>
          <p>{description}</p>
          <Link to={url}>{linkText}</Link>
        </div>
        <div
          className={clsx(styles.keyline, { [styles.animate]: onScreen })}
          style={{
            backgroundColor: keylineColor,
          }}
          ref={ref}
        />
      </div>
    </>
  );
};

export default Card;
