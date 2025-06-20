import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import type { ChangeEvent } from "react";
import { AlphaInput } from "./AlphaInputField";
import type { RGBAValue } from "./Color";
import rgbaInputCss from "./RGBAInput.css";
import { RGBInput } from "./RGBAInputField";

const withBaseName = makePrefixer("saltColorChooser");

interface RGBAInputProps {
  disableAlphaChooser: boolean;
  rgbaText: string;
  rgbaValue: RGBAValue;
  onSubmitRgb: (
    rgbaValue: RGBAValue,
    e?: ChangeEvent<Element> | undefined,
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
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-rgba-input",
    css: rgbaInputCss,
    window: targetWindow,
  });

  return (
    <>
      <span className={clsx(withBaseName("textDivOverrides"))}>{rgbaText}</span>
      {["r", "g", "b"].map((value) => (
        <div className={withBaseName("rgbaInputDiv")} key={value}>
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
        <div className={clsx(withBaseName("rgbaInputDiv"))}>
          <span className={clsx(withBaseName("rgbaText"))}>A</span>
          <AlphaInput
            alphaValue={Number.parseFloat(rgbaValue.a.toFixed(2))}
            onSubmit={onSubmitAlpha}
          />
        </div>
      ) : (
        <div className={clsx(withBaseName("alphaSpacerDiv"))} />
      )}
    </>
  );
};
