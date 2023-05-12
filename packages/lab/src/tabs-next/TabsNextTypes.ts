import {
  AriaAttributes,
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
} from "react";

export type TabProps = Omit<
  HTMLAttributes<HTMLElement>,
  "onClick" | "onKeyUp"
> & {
  /* Value prop is mandatory and must be unique in order for overflow to work. */
  value: string;
  /* Label prop is mandatory for accessibility. */
  label: string;
  id?: string;
  disabled?: boolean;
  "aria-controls"?: AriaAttributes["aria-controls"];
  selected?: boolean;
  index?: number;
  onClick?: (e: MouseEvent<HTMLElement>, index: number) => void;
  onKeyUp?: (e: KeyboardEvent<HTMLElement>, index: number) => void;
};

export type TabElement = ReactElement<TabProps>;
