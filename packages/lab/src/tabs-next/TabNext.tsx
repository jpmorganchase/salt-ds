// TODO close button needs to be a button. Hence tab needs to include 2 buttons
import { Button, ButtonProps, makePrefixer, useForkRef } from "@salt-ds/core";
import { CloseIcon, CloseSmallIcon } from "@salt-ds/icons";
import { clsx } from "clsx";
import {
  forwardRef,
  ForwardedRef,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  useRef,
  useState,
} from "react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { TabProps } from "./TabsNextTypes";

import tabCss from "./TabNext.css";

const withBaseName = makePrefixer("saltTabNext");

//TODO not ideal - duplicating the Icon then hiding one in css based on density - is there a nicer way ?
const CloseTabButton = (props: ButtonProps) => (
  // FIXME: use polymorphic button
  <Button
    {...props}
    aria-label="Close Tab (Delete or Backspace)"
    className={withBaseName("closeButton")}
    tabIndex={-1}
    title="Close Tab (Delete or Backspace)"
    variant="secondary"
  >
    <CloseIcon
      aria-label="Close Tab (Delete or Backspace)"
      className={withBaseName("close-icon")}
    />
    <CloseSmallIcon
      aria-label="Close Tab (Delete or Backspace)"
      className={withBaseName("close-icon-small")}
    />
  </Button>
);

export const TabNext = forwardRef(function Tab(
  {
    ariaControls,
    children,
    className,
    closeable,
    dragging,
    label,
    onClick,
    onClose,
    onFocus: onFocusProp,
    onKeyDown,
    onKeyUp,
    onMouseDown,
    selected,
    tabChildIndex = 0,
    tabIndex,
    id,
    ...props
  }: TabProps,
  ref: ForwardedRef<HTMLDivElement>
): ReactElement<TabProps> {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-tab-next",
    css: tabCss,
    window: targetWindow,
  });
  // if (index === undefined || onClick === undefined || onKeyDown === undefined) {
  //   throw Error(
  //     "index, onClick, onKeyUp, onKeyDown are required props, they would nornally be injected by Tabstrip, are you creating a Tab outside of a Tabstrip"
  //   );
  // }
  const root = useRef<HTMLDivElement>(null);
  const setForkRef = useForkRef(ref, root);
  const [closeHover, setCloseHover] = useState(false);

  const handleKeyUp = (e: KeyboardEvent<HTMLElement>) => {
    switch (e.key) {
      case "Backspace":
      case "Delete":
        if (closeable) {
          e.stopPropagation();
          onClose && onClose(id);
        }
        break;
      default:
        onKeyUp && onKeyUp(e);
    }
  };

  const handleCloseButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onClose && onClose(id);
  };

  const handleCloseButtonEnter = () => {
    setCloseHover(true);
  };

  const handleCloseButtonLeave = () => {
    setCloseHover(false);
  };

  return (
    <div
      {...props}
      aria-controls={ariaControls}
      aria-selected={selected}
      className={clsx(withBaseName(), {
        [withBaseName("closeable")]: closeable,
        [withBaseName("closeHover")]: closeHover,
        [withBaseName("dragAway")]: dragging,
      })}
      onClick={onClick}
      onFocus={onFocusProp}
      onKeyDown={onKeyDown}
      onKeyUp={handleKeyUp}
      onMouseDown={onMouseDown}
      ref={setForkRef}
      role="tab"
      tabIndex={tabIndex}
    >
      <div className={withBaseName("main")}>
        <span
          className={withBaseName("text")}
          // data-text is important, it determines the width of the tab. A pseudo
          // element assigns data-text as content. This is styled as selected tab
          // text. That means width of tab always corresponds to its selected state,
          // so tabs do not change size when selected (ie when the text is bolded).
          // Do not include if we have editable content, EditableLabel will determine
          // the width
          data-text={label}
        >
          {children}
        </span>
      </div>
      {closeable ? (
        <CloseTabButton
          onClick={handleCloseButtonClick}
          onMouseEnter={handleCloseButtonEnter}
          onMouseLeave={handleCloseButtonLeave}
        />
      ) : null}
    </div>
  );
});
