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
    // Resolve the final element before deciding whether to append external-link
    // content. A JSX `render` element can override `target`, so checking
    // `props.target` would make the icon and announcement disagree with the
    // rendered link.
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
