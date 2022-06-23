import React, { forwardRef, ReactElement } from "react";
import cx from "classnames";

import "./SkipLinks.css";

const renderListItem = (child: { key: React.Key | null | undefined }) => (
  <li key={child.key}>{child}</li>
);

interface SkipLinksProps {
  className?: string | undefined;
  children: ReactElement[];
}

export const SkipLinks = forwardRef<HTMLUListElement, SkipLinksProps>(
  (props, ref) => {
    const { className, children, ...restProps } = props;

    const clxPrefix = "uitk";
    return (
      <ul
        {...restProps}
        className={cx(className, clxPrefix + "SkipLinks")}
        ref={ref}
      >
        {React.Children.toArray(children)
          .filter(React.isValidElement)
          .map(renderListItem)}
      </ul>
    );
  }
);
