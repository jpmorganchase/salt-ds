import React, { ReactElement, ReactNode } from "react";
import warning from "warning";
// import { isFragment } from 'react-is';

let toolbarButtonId = 0;

export const ensureChildrenHaveIds = (
  children: ReactNode,
  container: "toolbar" | "tooltray"
): ReactElement[] =>
  React.Children.toArray(children)
    .filter(React.isValidElement)
    .map((child) => {
      // if (process.env.NODE_ENV !== 'production') {
      //   warning(
      //     !isFragment(child),
      //     `The ${container} component doesn't accept a Fragment as a child.\nConsider providing an array instead.`
      //   );
      // }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const childProps: any = child.props;
      return childProps.itemId ===
        undefined /*&& childProps.type === expectedType*/
        ? React.cloneElement(child, {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore TODO - investigate this
            // itemId: `${container}-button-generated-id-${++toolbarButtonId}`,
            id: `${container}-button-generated-id-${++toolbarButtonId}`,
          })
        : child;
    });
