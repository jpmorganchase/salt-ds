import cn from "classnames";
import { makePrefixer } from "@brandname/core";
import { Color } from "./Color";
import { SwatchesPicker } from "./SwatchesPicker";
import "./Swatches.css";

const withBaseName = makePrefixer("uitkColorChooserSwatches");

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
}: SwatchesTabProps): JSX.Element => (
  <div data-testid="swatches" className={cn(withBaseName("pickerDiv"))}>
    <SwatchesPicker
      allColors={allColors}
      color={color}
      onChange={handleColorChange}
      alpha={alpha}
      onDialogClosed={onDialogClosed}
    />
    <div className={cn(withBaseName("textDiv"))}>
      <span className={cn(withBaseName("colorTextDiv"))}>Color:</span>
      <span className={cn(withBaseName("colorNameTextDiv"))}>
        {displayColorName ?? placeholder}
      </span>
    </div>
  </div>
);
