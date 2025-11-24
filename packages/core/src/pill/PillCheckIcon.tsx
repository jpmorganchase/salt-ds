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
  active?: boolean;
}

const withBaseName = makePrefixer("saltPillCheckIcon");

export const PillCheckIcon = ({
  className,
  checked = false,
  disabled = false,
  active = false,
}: PillCheckIconProps): JSX.Element => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-pill-check-icon",
    css: pillCheckIcon,
    window: targetWindow,
  });

  const icon = () => {
    if (checked) {
      if (active) {
        return <CheckmarkIcon className={withBaseName("solid-icon")} />;
      }
      return <CheckmarkSolidIcon className={withBaseName("icon")} />;
    }
    return null;
  };

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
      {icon()}
    </div>
  );
};
