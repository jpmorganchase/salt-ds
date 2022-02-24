import { useState, SyntheticEvent, KeyboardEvent } from "react";

// Alt+Arrow Up/Down toggles list open/close
export const isToggleList = (event: KeyboardEvent) =>
  event.altKey && ["ArrowUp", "ArrowDown"].indexOf(event.key) !== -1;

export const usePopperStatus = (props: {
  initialOpen?: boolean;
  isMultiSelect?: boolean;
  onClose?: (event: SyntheticEvent) => void;
}) => {
  const { initialOpen, isMultiSelect = false, onClose } = props;
  const [isOpen, setOpen] = useState(initialOpen === true);

  const handleCloseList = (event: SyntheticEvent) => {
    setOpen(false);

    if (onClose) {
      onClose(event);
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent) => {
    if (isToggleList(event)) {
      setOpen((open) => !open);
    } else if (
      !isOpen &&
      ["Alt", "Tab", "Escape", "Control", "Shift", "Meta"].indexOf(
        event.key
      ) === -1
    ) {
      setOpen(true);
    } else if (isOpen && event.key === "Escape") {
      handleCloseList(event);
    } else if (isOpen && !isMultiSelect && event.key === "Enter") {
      handleCloseList(event);
    }
  };

  const notifyPopper = (event: SyntheticEvent) => {
    switch (event.type) {
      case "focus":
        setOpen(true);
        break;
      case "blur":
        handleCloseList(event);
        break;
      case "keydown":
        handleInputKeyDown(event as KeyboardEvent);
        break;
      case "click":
        handleCloseList(event);
        break;
      case "keyup":
        // ignore. Tokenized input invokes keyDown listener in response to keyup events
        break;
      default:
        throw Error(`usePopper: unexpected event type ${event.type}`);
    }
  };

  return {
    isOpen,
    notifyPopper,
  };
};
