import { ChangeEvent, KeyboardEvent } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import { Color } from "./Color";
import { isTransparent } from "./color-utils";

import swatchCss from "./Swatch.css";

const withBaseName = makePrefixer("saltColorChooserSwatch");

interface SwatchProps {
  active: boolean;
  alpha: number;
  color: string;
  onClick: (
    color: Color | undefined,
    finalSelection: boolean,
    e?: ChangeEvent
  ) => void;
  onDialogClosed: () => void;
  transparent?: boolean;
}

export const Swatch = ({
  color,
  onClick,
  active,
  alpha,
  onDialogClosed,
  transparent = false,
}: SwatchProps): JSX.Element => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-swatch",
    css: swatchCss,
    window: targetWindow,
  });

  const handleClick = () => {
    const newColor = Color.makeColorFromHex(color);
    isTransparent(color) ? newColor?.setAlpha(0) : newColor?.setAlpha(alpha);

    onClick(newColor, true);
    onDialogClosed();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    const newColor = Color.makeColorFromHex(color)?.setAlpha(alpha);
    e.key === "ENTER" && onClick(newColor, true);
    onDialogClosed();
  };

  // If it's black/gray/white
  const isBlackOrgray = (color: string): boolean => {
    return (
      color.toLowerCase() === "black" ||
      color.toUpperCase().startsWith("#2F3136") ||
      color.toUpperCase().startsWith("#2A2C2F") ||
      color.toUpperCase().startsWith("#242526") ||
      color.toUpperCase().startsWith("#161616")
    );
  };
  const isWhite = (color: string): boolean => color === "white";

  const getBackgroundColor = () => {
    const backgroundColor = Color.makeColorFromHex(color);
    return backgroundColor?.setAlpha(alpha).hex;
  };

  return (
    <div
      data-testid={`swatch-${color}`}
      style={{
        background: getBackgroundColor(),
      }}
      className={clsx({
        [withBaseName("active")]: active,
        [withBaseName("transparent")]: transparent,
        [withBaseName("graySwatch")]: isBlackOrgray(color),
        [withBaseName("whiteSwatch")]: isWhite(color),
        [withBaseName("swatch")]: !isWhite(color) && !isBlackOrgray(color),
      })}
      onClick={handleClick}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    />
  );
};
