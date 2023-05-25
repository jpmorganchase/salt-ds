import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import { AlphaInput } from "./AlphaInputField";
import { Color } from "./Color";
import { SwatchesPicker } from "./SwatchesPicker";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import swatchesCss from "./Swatches.css";

const withBaseName = makePrefixer("saltColorChooserSwatches");

export interface SwatchesTabProps {
  allColors: string[][];
  color: Color | undefined;
  alpha: number;
  handleColorChange: (
    color: Color | undefined,
    finalSelection: boolean,
    e?: React.ChangeEvent
  ) => void;
  displayColorName: string | undefined;
  placeholder: string | undefined;
  onDialogClosed: () => void;
}

export const Swatches = ({
  allColors,
  color,
  alpha,
  handleColorChange,
  displayColorName,
  placeholder,
  onDialogClosed,
}: SwatchesTabProps): JSX.Element => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-swatches",
    css: swatchesCss,
    window: targetWindow,
  });
  return (
    <div data-testid="swatches" className={clsx(withBaseName("pickerDiv"))}>
      <SwatchesPicker
        allColors={allColors}
        color={color}
        onChange={handleColorChange}
        alpha={alpha}
        onDialogClosed={onDialogClosed}
      />
      <div className={clsx(withBaseName("textDiv"))}>
        <div>
          <span className={clsx(withBaseName("colorTextDiv"))}>Color:</span>
          <span className={clsx(withBaseName("colorNameTextDiv"))}>
            {displayColorName ?? placeholder}
          </span>
        </div>
        <div>
          <span className={clsx(withBaseName("alphaTextDiv"))}>Opacity:</span>
          <AlphaInput
            alphaValue={color?.rgba.a === 0 ? 0 : alpha}
            showAsOpacity={true}
            onSubmit={(alpha: number, e?: React.ChangeEvent): void => {
              const newColor = color?.setAlpha(alpha);
              handleColorChange(newColor, false, e);
            }}
          />
        </div>
      </div>
    </div>
  );
};
