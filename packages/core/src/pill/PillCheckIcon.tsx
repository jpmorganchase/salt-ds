import { CheckmarkIcon, CheckmarkSolidIcon } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { makePrefixer } from "../utils";
import pillCheckIcon from "./PillCheckIcon.css";

export interface PillCheckIconProps {
  checked?: boolean;
  className?: string;
  disabled?: boolean;
}

const withBaseName = makePrefixer("saltPillCheckIcon");

export const PillCheckIcon = ({
  checked = false,
  className,
  disabled,
}: PillCheckIconProps): JSX.Element => {
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
        },
        className,
      )}
    >
      {/* {checked && !indeterminate && !readOnly && (
        <CheckmarkSolidIcon className={withBaseName("icon")} />
      )} */}
      {checked && <CheckmarkIcon className={withBaseName("icon")} />}
    </div>
  );
};
