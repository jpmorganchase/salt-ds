// TODO close button needs to be a button. Hence tab needs to include 2 buttons
import {
  Button,
  type ButtonProps,
  makePrefixer,
  useForkRef,
  useIcon,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type FocusEvent,
  type ForwardedRef,
  forwardRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  useCallback,
  useRef,
  useState,
} from "react";
import { EditableLabel, type EditableLabelProps } from "../editable-label";
import tabCss from "./Tab.css";
import type { TabProps } from "./TabsTypes";

const noop = () => undefined;

const withBaseName = makePrefixer("saltTab");

const CloseTabButton = (props: ButtonProps) => {
  const { CloseIcon } = useIcon();
  return (
    // FIXME: use polymorphic button
    <Button
      {...props}
      aria-label="Close Tab (Delete or Backspace)"
      className={withBaseName("closeButton")}
      tabIndex={undefined}
      title="Close Tab (Delete or Backspace)"
      variant="secondary"
    >
      <CloseIcon
        aria-label="Close Tab (Delete or Backspace)"
        className={withBaseName("close-icon")}
      />
    </Button>
  );
};

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
    onFocus: onFocusProp,
    onKeyDown,
    onKeyUp,
    onMouseDown,
    orientation,
    selected,
    tabChildIndex = 0,
    tabIndex,
    ...props
  }: TabProps,
  ref: ForwardedRef<HTMLDivElement>,
): ReactElement<TabProps> {
  if (index === undefined || onClick === undefined || onKeyDown === undefined) {
    throw Error(
      "index, onClick, onKeyUp, onKeyDown are required props, they would nornally be injected by Tabstrip, are you creating a Tab outside of a Tabstrip",
    );
  }
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-tab",
    css: tabCss,
    window: targetWindow,
  });

  const root = useRef<HTMLDivElement>(null);
  const editableRef = useRef<HTMLDivElement>(null);
  const setForkRef = useForkRef(ref, root);
  const [closeHover, setCloseHover] = useState(false);
  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!editing) {
        e.preventDefault();
        onClick(e, index);
      }
    },
    [editing, index, onClick],
  );
  const handleKeyDownMain = (e: KeyboardEvent<HTMLElement>) => {
    onKeyDown(e);
  };

  const handleOnExitEditMode: EditableLabelProps["onExitEditMode"] = (
    originalValue = "",
    editedValue = "",
    allowDeactivation = true,
  ) => onExitEditMode(originalValue, editedValue, allowDeactivation, index);

  const handleKeyUp = (e: KeyboardEvent) => {
    switch (e.key) {
      case "Backspace":
      case "Delete":
        if (closeable && !editing) {
          e.stopPropagation();
          onClose?.(index);
        }
        break;
      default:
        onKeyUp?.(e, index);
    }
  };

  const handleCloseButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onClose?.(index);
  };

  const handleCloseButtonEnter = () => {
    setCloseHover(true);
  };

  const handleCloseButtonLeave = () => {
    setCloseHover(false);
  };

  const handleMouseDown = (e: MouseEvent<HTMLElement>): void => {
    onMouseDown?.(e);
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
          ref={editableRef}
        />
      );
    }
    return label;
  };

  const handleFocus = (evt: FocusEvent<HTMLElement>) => {
    if (editableRef.current) {
      const editable = editableRef.current as HTMLElement;
      const input = editable.querySelector(
        ".saltEditableLabel-input",
      ) as HTMLInputElement;
      input?.focus();
    }
    onFocusProp?.(evt);
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
        [withBaseName("editing")]: editing,
        [withBaseName("vertical")]: orientation === "vertical",
        saltFocusVisible: focusVisible,
      })}
      data-editable={editable || undefined}
      onClick={handleClick}
      onFocus={handleFocus}
      onKeyDown={handleKeyDownMain}
      onKeyUp={handleKeyUp}
      onMouseDown={handleMouseDown}
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
          data-text={editable ? undefined : label}
        >
          {children ?? getLabel()}
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
