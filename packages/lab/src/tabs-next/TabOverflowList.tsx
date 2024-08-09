import { Button, makePrefixer } from "@salt-ds/core";
import { OverflowMenuIcon } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import {
  Children,
  type ComponentPropsWithoutRef,
  type ReactNode,
  useState,
} from "react";
import tabOverflowListCss from "./TabOverflowList.css";

interface TabOverflowListProps extends ComponentPropsWithoutRef<"button"> {
  children?: ReactNode;
}

const withBaseName = makePrefixer("saltTabOverflow");

export function TabOverflowList(props: TabOverflowListProps) {
  const { children, ...rest } = props;
  const [hidden, setHidden] = useState(true);

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-tabstrip-next-overflow",
    css: tabOverflowListCss,
    window: targetWindow,
  });

  const handleClick = () => {
    setHidden((old) => !old);
  };

  const handleFocus = () => {
    setHidden(false);
  };

  const handleBlur = () => {
    setHidden(true);
  };

  const handleListClick = () => {
    setHidden(true);
  };

  if (Children.count(children) === 0) return null;

  return (
    <div className={withBaseName()}>
      <Button tabIndex={-1} variant="secondary" onClick={handleClick} {...rest}>
        <OverflowMenuIcon aria-hidden />
      </Button>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <div
        className={withBaseName("list")}
        data-hidden={hidden}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleListClick}
      >
        <div className={withBaseName("listContainer")}>{children}</div>
      </div>
    </div>
  );
}
