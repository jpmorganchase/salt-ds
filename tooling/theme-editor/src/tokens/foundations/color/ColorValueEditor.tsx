import React, { useState, useEffect, useMemo } from "react";
import cn from "classnames";
import { makePrefixer } from "@brandname/core";
import {
  capitalize,
  Color,
  ColorChooser,
  getColorNameByHexValue,
} from "@brandname/lab";

import { JumpToTokenButton } from "../../toggles/JumpToTokenButton";
import { UITK_COLOURS } from "../../../utils/uitkValues";
import { OpacityField } from "./OpacityField";
import "./ColorValueEditor.css";

const withBaseName = makePrefixer("uitkColorValueEditor");

const rgbRegex = new RegExp(
  "^rgb\\((25[0-5]|2[0-4][0-9]|1[0-9]?[0-9]?|[1-9][0-9]?|[0-9]), ?(25[0-5]|2[0-4][0-9]|1[0-9]?[0-9]?|[1-9][0-9]?|[0-9]), ?(25[0-5]|2[0-4][0-9]|1[0-9]?[0-9]?|[1-9][0-9]?|[0-9])\\)$"
);
const rgbaRegex = new RegExp(
  "^rgba\\((25[0-5]|2[0-4][0-9]|1[0-9]?[0-9]?|[1-9][0-9]?|[0-9]), ?(25[0-5]|2[0-4][0-9]|1[0-9]?[0-9]?|[1-9][0-9]?|[0-9]), ?(25[0-5]|2[0-4][0-9]|1[0-9]?[0-9]?|[1-9][0-9]?|[0-9]), ?(1|0|0.[0-9]+)\\)$"
);
const hexRegex = new RegExp("^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$");
const hslRegex = new RegExp(
  "^hsl\\(\\s*(0|[1-9]\\d?|[12]\\d\\d|3[0-5]\\d)\\s*,\\s*((0|[1-9]\\d?|100)%)\\s*,\\s*((0|[1-9]\\d?|100)%)\\s*\\)$"
);
const hslaRegex = new RegExp(
  "^hsla\\(\\s*(0|[1-9]\\d?|[12]\\d\\d|3[0-5]\\d)\\s*,\\s*((0|[1-9]\\d?|100)%)\\s*,\\s*((0|[1-9]\\d?|100)%)\\s*,?(1|0|0.[0-9]+)\\)$"
);

type ColorValueEditorProps = {
  characteristicsView?: boolean;
  extractValue: (value: string) => string;
  isStateValue?: boolean;
  label: string;
  onUpdateJSON: (value: string, pathToUpdate: string, scope: string) => void;
  originalValue: string;
  pathToUpdate: string;
  scope: string;
  setValue: (value: string) => void;
  uitkColorOverrides?: Record<string, string>;
  value: string;
};

export function isLinearGradient(value: string): boolean {
  if (value.startsWith("linear-gradient")) {
    return true;
  }
  return false;
}

export function isRGBAColor(value: string): boolean {
  // separated for now so we can find uitk alpha value
  if (value.startsWith("rgba")) {
    return true;
  }
  return false;
}

export function isColor(value: string): string {
  if (rgbaRegex.exec(value) || rgbRegex.exec(value)) {
    return value;
  }
  if (hexRegex.exec(value)) {
    return value;
  }
  if (hslRegex.exec(value) || hslaRegex.exec(value)) {
    return value;
  }

  return "";
}

const getAlphaValueToken = (value: string) => {
  return value.split("*")[1].replace(")", "");
};

export const ColorValueEditor = (
  props: ColorValueEditorProps
): React.ReactElement => {
  const [selectedColor, setSelectedColor] = useState<Color | undefined>(
    undefined
  );
  const [alphaValue, setAlpha] = useState<string | undefined>(undefined);
  const alphaValuePattern = useMemo(() => {
    return alphaValue ? alphaValue.split("-").slice(1)[0] : undefined;
  }, [alphaValue]);

  const formFieldLabel = useMemo(() => {
    return props.pathToUpdate.includes("fade")
      ? `${capitalize(props.pathToUpdate.split("-")[0]) as string} ${
          props.label
        }`
      : `${capitalize(props.label)}` ?? "Color";
  }, [props.pathToUpdate, props.label]);

  useEffect(() => {
    const updatedColor = Color.makeColorFromHex(
      props.extractValue(
        props.value.includes("fade")
          ? props.value.split("-fade")[0]
          : props.value
      )
    );
    setSelectedColor(updatedColor);
    if (isRGBAColor(props.value) && props.value.split("*").length > 1) {
      setAlpha(getAlphaValueToken(props.value));
    } else {
      setAlpha(updatedColor?.rgba.a.toString());
    }
  }, [props.extractValue, props.value]);

  const onSelect = (color: Color | undefined, finalSelection: boolean) => {
    finalSelection ? onColorClose(color) : setSelectedColor(color);
    setSelectedColor(color);
  };

  const onColorClose = (chosenColor: Color | undefined) => {
    if (chosenColor) {
      const colorName = getColorNameByHexValue(chosenColor.hex);
      if (colorName && !colorName?.startsWith("#")) {
        const colorParts = colorName.match(/[a-z]+|[^a-z]+/gi);
        if (colorParts?.length === 2) {
          const token = `uitk-${colorParts[0].toLowerCase()}-${colorParts[1]}`;
          props.onUpdateJSON(token, props.pathToUpdate, props.scope);
        }
      } else {
        const { r, g, b, a } = { ...chosenColor.rgba };
        const newColor =
          `rgb` +
          (a ? `a` : ``) +
          `(${r}, ${g}, ${b}` +
          (a
            ? `, ${
                alphaValue
                  ? parseFloat(alphaValue)
                    ? alphaValue
                    : parseFloat(props.extractValue(alphaValue))
                    ? `*${alphaValue}*`
                    : a
                  : a
              }`
            : ``) +
          `)`;
        props.onUpdateJSON(newColor, props.pathToUpdate, props.scope);
      }
      setSelectedColor(chosenColor);
    }
  };

  const onAlphaClose = () => {
    if (selectedColor) {
      const { r, g, b, a } = { ...selectedColor?.rgba };
      if (
        alphaValue &&
        (parseFloat(props.extractValue(alphaValue)) || parseFloat(alphaValue))
      ) {
        const newColor =
          `rgb` +
          (a ? `a` : ``) +
          `(${r}, ${g}, ${b}` +
          (a
            ? `, ${
                parseFloat(props.extractValue(alphaValue))
                  ? `*${alphaValue}*`
                  : parseFloat(alphaValue)
              }`
            : ``) +
          `)`;

        props.onUpdateJSON(newColor, props.pathToUpdate, props.scope);
      } else {
        setAlpha(getAlphaValueToken(props.originalValue));
      }
    }
  };

  const onClear = () => {
    const defaultColor = props.extractValue(props.value);
    setSelectedColor(Color.makeColorFromHex(defaultColor));
  };

  const onAlphaChange = (alpha: string) => {
    if (selectedColor) {
      const { r, g, b, a } = { ...selectedColor.rgba };
      if (parseFloat(alpha)) {
        const updatedColor = Color.makeColorFromRGB(r, g, b, parseFloat(alpha));
        setSelectedColor(updatedColor);
      } else {
        const tokenValue = props.extractValue(alpha);
        if (parseFloat(tokenValue)) {
          const updatedColor = Color.makeColorFromRGB(
            r,
            g,
            b,
            parseFloat(tokenValue)
          );
          setSelectedColor(updatedColor);
        }
      }
    }
    setAlpha(alpha ?? "");
  };

  return (
    <div
      className={cn(withBaseName("input"), {
        [withBaseName("foundationColor")]: !props.characteristicsView,
        [withBaseName("colorByState")]: props.isStateValue,
      })}
    >
      {!props.pathToUpdate.includes("fade") && (
        <div
          className={cn({
            [withBaseName("jumpToFoundation")]:
              props.characteristicsView &&
              !props.pathToUpdate.includes("fade") &&
              !props.isStateValue,
            [withBaseName("jumpToFoundationNotColor")]:
              props.characteristicsView && props.pathToUpdate.includes("fade"),
          })}
        >
          <div
            className={cn(withBaseName("colorInput"), {
              [withBaseName("backgroundState")]: props.isStateValue,
            })}
          >
            {!props.isStateValue && (
              <div className={cn(withBaseName("field"), "uitkFormLabel")}>
                {formFieldLabel}
              </div>
            )}
            {props.isStateValue && (
              <div
                className={cn(
                  "uitkFormLabel",
                  withBaseName("backgroundStateField")
                )}
              >
                {["H", "A", "D"].includes(formFieldLabel[0])
                  ? formFieldLabel[0]
                  : "R"}
              </div>
            )}
            <div
              className={cn({
                [withBaseName("backgroundColorInput")]:
                  formFieldLabel.includes("Background"),
              })}
            >
              <ColorChooser
                color={selectedColor}
                displayHexOnly={!props.characteristicsView}
                hideLabel={props.isStateValue}
                showSwatches={props.characteristicsView ? true : false}
                showColorPicker={props.characteristicsView ? false : true}
                onSelect={onSelect}
                onClear={onClear}
                UITKColorOverrides={props.uitkColorOverrides}
              />
            </div>
          </div>
          {props.characteristicsView && !props.isStateValue && (
            <JumpToTokenButton
              disabled={
                props.value.split("-").length < 2 ||
                !UITK_COLOURS.includes(props.value.split("-").slice(1)[0])
              }
              value={props.value.split("-").slice(1)[0]}
              sectionToJumpTo={UITK_COLOURS}
              pathname={"/foundations/color"}
              search={`?open=${props.value.split("-").slice(1)[0]}`}
            />
          )}
        </div>
      )}

      {props.characteristicsView &&
        isRGBAColor(props.value) &&
        props.value.split("*").length > 1 &&
        !props.isStateValue && (
          <OpacityField
            alphaValue={alphaValue}
            formFieldLabel={formFieldLabel}
            alphaValuePattern={alphaValuePattern ?? ""}
            onAlphaChange={onAlphaChange}
            onAlphaClose={onAlphaClose}
          />
        )}
    </div>
  );
};
