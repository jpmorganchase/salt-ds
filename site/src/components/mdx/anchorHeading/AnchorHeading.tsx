import { Link, type LinkProps } from "@jpmorganchase/mosaic-components";
import clsx from "clsx";
import {
  type ElementType,
  type FC,
  type HTMLProps,
  type PropsWithChildren,
  type ReactNode,
  useState,
} from "react";
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
    <div className={clsx(styles.root, className)}>
      <Link
        className={styles.link}
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

type WithAnchorHeadingProps = JSX.IntrinsicAttributes &
  AnchorHeadingProps & { children?: ReactNode };

export const withAnchorHeading =
  (Component: FC<PropsWithChildren<TypographyProps>>) =>
  (props: WithAnchorHeadingProps) => (
    <AnchorHeading {...props} Component={Component} />
  );
