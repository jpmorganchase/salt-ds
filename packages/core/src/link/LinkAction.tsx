import {
  type ComponentPropsWithoutRef,
  cloneElement,
  forwardRef,
  type ReactNode,
} from "react";
import { renderProps } from "../utils";

interface LinkActionProps extends ComponentPropsWithoutRef<"a"> {
  externalLinkContent?: ReactNode;
}

export const LinkAction = forwardRef<HTMLAnchorElement, LinkActionProps>(
  function LinkAction({ externalLinkContent, ...props }, ref) {
    const link = renderProps("a", { ...props, ref });

    if (link.props.target !== "_blank" || !externalLinkContent) {
      return link;
    }

    return cloneElement(
      link,
      undefined,
      <>
        {link.props.children}
        {externalLinkContent}
      </>,
    );
  },
);
