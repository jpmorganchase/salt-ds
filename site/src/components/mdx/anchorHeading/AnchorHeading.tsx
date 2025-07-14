import { LinkedIcon } from "@salt-ds/icons";
import { clsx } from "clsx";
import type NextLink from "next/link";
import type {
  ComponentPropsWithoutRef,
  ElementType,
  FC,
  HTMLProps,
  PropsWithChildren,
  ReactNode,
} from "react";
import { LinkBase } from "../../link/Link";
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
  LinkProps?: ComponentPropsWithoutRef<typeof NextLink>;
}

export const AnchorHeading: FC<PropsWithChildren<AnchorHeadingProps>> = ({
  Component,
  children,
  className,
  id,
  LinkProps: LinkPropsProp = {},
  ...rest
}) => {
  const anchorLink = `#${id}`;
  return (
    <div className={clsx(styles.root, className)}>
      <LinkBase {...LinkPropsProp} href={anchorLink} className={styles.link}>
        <Component id={id} {...rest}>
          {children}
          <span className={styles.badgeContainer}>
            <LinkedIcon color="inherit" />
          </span>
        </Component>
      </LinkBase>
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
