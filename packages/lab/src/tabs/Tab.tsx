// TODO close button needs to be a button. Hence tab needs to include 2 buttons
import {
  Button,
  ButtonProps,
  makePrefixer,
  useForkRef,
} from "@jpmorganchase/uitk-core";
import { CloseIcon, CloseSmallIcon } from "@jpmorganchase/uitk-icons";
import cx from "classnames";
import React, {
  ForwardedRef,
  forwardRef,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  SyntheticEvent,
  useCallback,
  useRef,
  useState,
} from "react";
import { EditableLabel, EditableLabelProps } from "../editable-label";
import { TabProps } from "./TabstripProps";

import "./Tab.css";

const noop = () => undefined;

const withBaseName = makePrefixer("uitkTab");

//TODO not ideal - duplicating the Icon then hiding one in css based on density - is there a nicer way ?
const CloseTabButton: React.FC<ButtonProps> = (props) => (
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

export const Tab = forwardRef(function Tab(
  {
    ariaControls,
    children,
    className,
    closeable,
    dragging,
    editable,
    editing,
    focusVisible,
    index,
    label,
    onClick,
    onClose,
    onEnterEditMode = noop,
    onExitEditMode = noop,
    onKeyDown,
    onKeyUp,
    onMouseDown,
    orientation,
    selected,
    tabChildIndex = 0,
    tabIndex,
    ...props
  }: TabProps,
  ref: ForwardedRef<HTMLDivElement>
): ReactElement<TabProps> {
  if (index === undefined || onClick === undefined || onKeyDown === undefined) {
    throw Error(
      "index, onClick, onKeyUp, onKeyDown are required props, they would nornally be injected by Tabstrip, are you creating a Tab outside of a Tabstrip"
    );
  }

  const root = useRef<HTMLDivElement>(null);
  const setForkRef = useForkRef(ref, root);
  const [closeHover, setCloseHover] = useState(false);
  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!editing) {
        e.preventDefault();
        onClick(e, index);
      }
    },
    [editing, index, onClick]
  );
  const handleKeyDownMain = (e: KeyboardEvent) => {
    onKeyDown(e, index);
  };

  const handleOnExitEditMode: EditableLabelProps["onExitEditMode"] = (
    originalValue = "",
    editedValue = "",
    allowDeactivation = true
  ) => onExitEditMode(originalValue, editedValue, allowDeactivation, index);

  const handleKeyUp = (e: KeyboardEvent) => {
    switch (e.key) {
      case "Backspace":
      case "Delete":
        if (closeable) {
          e.stopPropagation();
          onClose && onClose(index);
        }
        break;
      default:
        onKeyUp && onKeyUp(e, index);
    }
  };

  const handleCloseButtonClick = (e: SyntheticEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onClose && onClose(index);
  };

  const handleCloseButtonEnter = () => {
    setCloseHover(true);
  };

  const handleCloseButtonLeave = () => {
    setCloseHover(false);
  };

  const handleMouseDown = (e: MouseEvent<HTMLElement>): void => {
    onMouseDown && onMouseDown(e, index);
  };

  const getLabel = () => {
    if (editable) {
      return (
        <EditableLabel
          editing={editing}
          defaultValue={label}
          // Create a fresh instance after each edit, so it can be uncontrolled ...
          key={label}
          onEnterEditMode={onEnterEditMode}
          onExitEditMode={handleOnExitEditMode}
        />
      );
    } else {
      return label;
    }
  };

  return (
    <div
      {...props}
      aria-controls={ariaControls}
      aria-selected={selected}
      className={cx(withBaseName(), {
        [withBaseName("closeable")]: closeable,
        [withBaseName("closeHover")]: closeHover,
        [withBaseName("dragAway")]: dragging,
        [withBaseName("editing")]: editing,
        [withBaseName("vertical")]: orientation === "vertical",
        [`uitkFocusVisible`]: focusVisible,
      })}
      data-editable={editable || undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDownMain}
      onKeyUp={handleKeyUp}
      onMouseDown={handleMouseDown}
      ref={setForkRef}
      role="tab"
      tabIndex={tabIndex}
    >
      <button className={withBaseName("main")} tabIndex={-1}>
        <span className={withBaseName("text")} data-text={label}>
          {children ?? getLabel()}
        </span>
      </button>
      {closeable ? (
        <CloseTabButton
          onClick={handleCloseButtonClick}
          onMouseEnter={handleCloseButtonEnter}
          onMouseLeave={handleCloseButtonLeave}
          tabIndex={-1}
        />
      ) : null}
    </div>
  );
});
