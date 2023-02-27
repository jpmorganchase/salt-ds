import React, {
  useState,
  ReactNode,
  FC,
  ElementType,
  PropsWithChildren,
  HTMLProps,
} from "react";
import classnames from "classnames";
import { Link, LinkProps } from "@jpmorganchase/mosaic-components";
import styles from "./AnchorHeading.module.css";

interface TypographyProps {
  children: ReactNode;
  /** Additional class name for root class override */
  className?: string;
  /** Root element type */
  component?: ElementType;
  /** Component id */
  id?: string;
  /** role */
  role?: string;
}

export interface AnchorHeadingProps extends HTMLProps<HTMLHeadingElement> {
  children: ReactNode[];
  Component: FC<PropsWithChildren<TypographyProps>>;
  LinkProps?: LinkProps;
}

export const AnchorHeading: FC<PropsWithChildren<AnchorHeadingProps>> = ({
  Component,
  children,
  className,
  id,
  LinkProps: LinkPropsProp = {},
  ...rest
}) => {
  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = () => {
    setHovered(true);
  };
  const handleMouseLeave = () => {
    setHovered(false);
  };

  const { link } = LinkPropsProp;
  const anchorLink = link || `#${id}`;
  return (
    <div className={classnames(className, styles.root)}>
      <Link
        className={classnames(className, styles.link)}
        {...LinkPropsProp}
        endIcon="none"
        link={anchorLink}
        hovered={hovered}
        variant="heading"
        LinkBaseProps={{
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave,
        }}
      >
        <Component id={id} {...rest}>
          {children}
          <span className={styles.badgeContainer}>{hovered ? "#" : null}</span>
        </Component>
      </Link>
    </div>
  );
};

export const withAnchorHeading = (Component) => (props) =>
  <AnchorHeading Component={Component} {...props} />;
