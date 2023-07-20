import clsx from "clsx";
import { makePrefixer, useButton, useDensity } from "@salt-ds/core";
import { CloseIcon, CloseSmallIcon } from "@salt-ds/icons";
import { PillClickEvent } from "./Pill";

const withBaseName = makePrefixer("saltPill");

export const PillCloseButton = ({
  onClick,
  disabled,
  onMouseEnter,
  onMouseLeave,
  tabIndex,
}: {
  disabled?: boolean;
  onClick: (e: PillClickEvent) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  tabIndex?: 0 | -1;
}) => {
  const density = useDensity();
  const { buttonProps, active } = useButton({
    disabled,
    onClick: (e) => {
      e.stopPropagation();
      onClick(e);
    },
  });

  return (
    <div
      {...buttonProps}
      aria-disabled={disabled ? true : undefined}
      role="button"
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
      onMouseUp={(e) => {
        e.stopPropagation();
      }}
      aria-label="Close Pill"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      tabIndex={tabIndex !== undefined ? tabIndex : 0}
      className={clsx(withBaseName(), withBaseName("closeButton"), {
        [withBaseName("closeButton-active")]: active,
      })}
    >
      {density === "high" ? (
        <CloseSmallIcon aria-hidden />
      ) : (
        <CloseIcon aria-hidden />
      )}
    </div>
  );
};
