import {
  forwardRef,
  MouseEvent,
  useLayoutEffect,
  useRef,
  useState
} from "react";
import {PillNext} from "../pill-next";
import {Tooltip, useForkRef} from "@salt-ds/core";

interface InputPillProps {
  content: string,
  focusVisible: boolean,
  highlighted: boolean,
  onClose?: (event: MouseEvent<HTMLButtonElement>) => void;
}

export const InputPillNext = forwardRef<HTMLButtonElement, InputPillProps>(
  function InputPillNext(
    {
      content,
      focusVisible, // TODO: move to context?
      highlighted,
      onClose,
      ...rest
    },
    ref
  ) {
    const pillRef = useRef<HTMLButtonElement | null>(null);
    const [isEllipsisActive, setEllipsisActive] = useState(false);

    useLayoutEffect(() => {
      const text = pillRef?.current?.firstElementChild as HTMLElement;
      setEllipsisActive(text?.offsetWidth < text?.scrollWidth);
    }, []);

    return <Tooltip content={content} disabled={!isEllipsisActive}>
      <PillNext
        ref={useForkRef(ref, pillRef)}
        role="option"
        onClose={focusVisible ? onClose : undefined}
        {...rest}>
        {content}
      </PillNext>
    </Tooltip>

  })
