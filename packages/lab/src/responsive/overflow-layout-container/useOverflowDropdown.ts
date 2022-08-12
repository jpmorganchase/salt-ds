import {
  MouseEventHandler,
  RefObject,
  SyntheticEvent,
  useCallback,
  useState,
} from "react";

interface DropdownHookProps {
  disabled?: boolean;
  dropdownRef: RefObject<HTMLDivElement>;
  onButtonClick?: MouseEventHandler;
}

const isKeyboardTriggered = (evt: SyntheticEvent<HTMLElement>) => {
  const { key } = evt as unknown as KeyboardEvent;
  return ["Enter", " "].indexOf(key) !== -1;
};

export const useOverflowDropdown = ({
  disabled,
  dropdownRef,
  onButtonClick,
}: DropdownHookProps) => {
  const [open, setOpen] = useState(false);

  const handleButtonBlur = useCallback(
    (evt) => {
      if (!dropdownRef.current?.contains(evt.relatedTarget)) {
        setOpen(false);
      }
    },
    [setOpen]
  );

  const handleButtonClick = useCallback(
    (evt) => {
      // Do not trigger menu open for 'Enter' and 'SPACE' key as they're handled in `handleButtonKeyDown`
      if (isKeyboardTriggered(evt)) {
        console.log("click triggetred by keyboard");
      } else {
        setOpen((value?: boolean) => !value);
        // syncListFocus(event);
      }

      onButtonClick?.(evt);
    },
    [setOpen]
  );

  const triggerProps = {
    "aria-expanded": open,
    onBlur: handleButtonBlur,
    onClick: disabled ? undefined : handleButtonClick,
  };

  return {
    isOpen: open,
    setOpen,
    triggerProps,
  };
};
