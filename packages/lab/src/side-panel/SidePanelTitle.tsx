import {
  makePrefixer,
  Text,
  type TextProps,
  useId,
  useIsomorphicLayoutEffect,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef } from "react";
import { useSidePanelContext } from "./internal";
import sidePanelTitleCss from "./SidePanelTitle.css";

const withBaseName = makePrefixer("saltSidePanelTitle");

export interface SidePanelTitleProps extends TextProps<"div"> {}

export const SidePanelTitle = forwardRef<HTMLDivElement, SidePanelTitleProps>(
  function SidePanelTitle(props, ref) {
    const { children, className, id, styleAs = "h2", ...rest } = props;

    const { setTitleId } = useSidePanelContext();
    const targetWindow = useWindow();

    useComponentCssInjection({
      testId: "salt-side-panel-title",
      css: sidePanelTitleCss,
      window: targetWindow,
    });

    const titleId = useId(id);

    useIsomorphicLayoutEffect(() => {
      if (titleId) {
        setTitleId(titleId);
      }

      return () => {
        setTitleId(undefined);
      };
    }, [titleId, setTitleId]);

    return (
      <Text
        ref={ref}
        id={titleId}
        styleAs={styleAs}
        className={clsx(withBaseName(), className)}
        {...rest}
      >
        {children}
      </Text>
    );
  },
);
