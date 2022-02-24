import { ChangeEvent } from "react";
import cn from "classnames";
import { makePrefixer } from "@brandname/core";
import { AlphaInput } from "./AlphaInputField";
import { RGBAValue } from "./Color";
import { RGBInput } from "./RGBAInputField";

import "./RGBAInput.css";

const withBaseName = makePrefixer("uitkColorChooser");

interface RGBAInputProps {
  disableAlphaChooser: boolean;
  rgbaText: string;
  rgbaValue: RGBAValue;
  onSubmitRgb: (
    rgbaValue: RGBAValue,
    e?: ChangeEvent<Element> | undefined
  ) => void;
  onSubmitAlpha: (alpha: number, e?: ChangeEvent<Element> | undefined) => void;
}

export const RGBAInput = ({
  disableAlphaChooser,
  rgbaText,
  rgbaValue,
  onSubmitAlpha,
  onSubmitRgb,
}: RGBAInputProps): JSX.Element => {
  return (
    <>
      <span className={cn(withBaseName("textDivOverrides"))}>{rgbaText}</span>
      {["r", "g", "b"].map((value) => (
        <div className={withBaseName("rgbaInputDiv")}>
          <span className={withBaseName("rgbaText")}>
            {value.toUpperCase()}
          </span>
          <RGBInput
            rgbaValue={rgbaValue}
            value={value as "r" | "g" | "b"}
            onSubmit={onSubmitRgb}
          />
        </div>
      ))}
      {!disableAlphaChooser ? (
        <div className={cn(withBaseName("rgbaInputDiv"))}>
          <span className={cn(withBaseName("rgbaText"))}>A</span>
          <AlphaInput
            alphaValue={parseFloat(rgbaValue.a.toFixed(2))}
            onSubmit={onSubmitAlpha}
          />
        </div>
      ) : (
        <div className={cn(withBaseName("alphaSpacerDiv"))}></div>
      )}
    </>
  );
};
