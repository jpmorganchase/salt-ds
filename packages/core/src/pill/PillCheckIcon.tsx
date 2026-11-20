import { CheckmarkIcon, CheckmarkSolidIcon } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import type { ReactElement } from "react";
import { makePrefixer } from "../utils";
import pillCheckIcon from "./PillCheckIcon.css";

export interface PillCheckIconProps {
  /**
   * If `true`, the icon shows a checkmark.
   */
  checked?: boolean;
  /**
   * Class name applied to the icon's root element.
   */
  className?: string;
  /**
   * If `true`, the icon has the disabled class name.
   */
  disabled?: boolean;
  /**
   * If `true`, the icon shows its active state, for example while the `Pill` is
   * pressed. When `checked` is `true`, it shows a plain checkmark instead of a
   * solid one.
   */
  active?: boolean;
}

const withBaseName = makePrefixer("saltPillCheckIcon");

export const PillCheckIcon = ({
  className,
  checked = false,
  disabled = false,
  active = false,
}: PillCheckIconProps): ReactElement => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-pill-check-icon",
    css: pillCheckIcon,
    window: targetWindow,
  });

  return (
    <div
      aria-hidden="true"
      className={clsx(
        withBaseName(),
        {
          [withBaseName("checked")]: checked,
          [withBaseName("disabled")]: disabled,
          [withBaseName("active")]: active,
        },
        className,
      )}
    >
      {checked &&
        (active ? (
          <CheckmarkIcon className={withBaseName("icon")} />
        ) : (
          <CheckmarkSolidIcon className={withBaseName("solidIcon")} />
        ))}
    </div>
  );
};
