import { useState } from "react";
import cn from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { Color } from "./Color";

const withBaseName = makePrefixer("uitkColorChooserSwatch");

interface SwatchProps {
  color: string;
  onClick: (
    color: Color | undefined,
    finalSelection: boolean,
    e?: React.ChangeEvent
  ) => void;
  active: boolean;
  alpha: number;
  onDialogClosed: () => void;
}

export const withHandleFocus =
  <P extends Record<string, unknown>>(
    Component: React.ComponentType<P>
  ): React.FC<P> =>
  (props): JSX.Element => {
    const [focus, setFocus] = useState(false);
    const handleFocus = (): void => setFocus(true);
    const handleBlur = (): void => setFocus(false);
    return (
      <span onFocus={handleFocus} onBlur={handleBlur}>
        <Component focus={focus} {...props} />
      </span>
    );
  };

export const Swatch = ({
  color,
  onClick,
  active,
  alpha,
  onDialogClosed,
}: SwatchProps): JSX.Element => {
  const handleClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ): void => {
    const newColor = Color.makeColorFromHex(color)?.setAlpha(alpha);
    onClick(newColor, true);
    onDialogClosed();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    const newColor = Color.makeColorFromHex(color)?.setAlpha(alpha);
    e.key === "ENTER" && onClick(newColor, true);
    onDialogClosed();
  };

  // If it's black/grey/white
  const isBlackOrGrey = (color: string): boolean => {
    return (
      color.toLowerCase() === "black" ||
      color.toUpperCase().startsWith("#2F3136") ||
      color.toUpperCase().startsWith("#2A2C2F") ||
      color.toUpperCase().startsWith("#242526") ||
      color.toUpperCase().startsWith("#161616")
    );
  };
  const isWhite = (color: string): boolean => color === "white";

  return (
    <div
      data-testid={`swatch-${color}`}
      style={{
        background: Color.makeColorFromHex(color)?.setAlpha(alpha).hex,
      }}
      className={cn({
        [withBaseName("active")]: active,
        [withBaseName("greySwatch")]: isBlackOrGrey(color),
        [withBaseName("whiteSwatch")]: isWhite(color),
        [withBaseName("swatch")]: !isWhite(color) && !isBlackOrGrey(color),
      })}
      onClick={handleClick}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    />
  );
};

// export default withHandleFocus(Swatch);
export default Swatch;
