import { type KeyboardEvent, useState } from "react";

export interface UsePopperStatusProps {
  initialOpen?: boolean;
  autoClose?: boolean;
}

export function usePopperStatus(props: UsePopperStatusProps) {
  const { initialOpen, autoClose } = props;
  const [isOpen, setIsOpen] = useState<boolean>(!!initialOpen);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.altKey && ["ArrowUp", "ArrowDown"].includes(event.key)) {
      setIsOpen((x) => !x);
    } else if (
      !isOpen &&
      ["Alt", "Tab", "Escape", "Control", "Shift", "Meta"].includes(event.key)
    ) {
      setIsOpen(true);
    } else if (isOpen && event.key === "Escape") {
      setIsOpen(false);
    } else if (isOpen && autoClose && event.key === "Enter") {
      setIsOpen(false);
    }
  };

  const onFocus = () => {
    setIsOpen(true);
  };

  const onBlur = () => {
    setIsOpen(false);
  };

  const onChange = () => {
    if (autoClose) {
      setIsOpen(false);
    }
  };

  const onClick = () => {
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  return {
    isOpen,
    onKeyDown,
    onFocus,
    onBlur,
    onChange,
    onClick,
  };
}
