import {
  makePrefixer,
  ToolkitProvider,
  Tooltip,
  useTooltip,
} from "@jpmorganchase/uitk-core";
import {
  capitalize,
  Color,
  ColorChooser,
  getColorNameByHexValue,
} from "@jpmorganchase/uitk-lab";
import cn from "classnames";
import { useEffect, useMemo, useState } from "react";

import { ActiveIcon } from "../../../icons/components/ActiveIcon";
import { DisabledIcon } from "../../../icons/components/DisabledIcon";
import { ErrorIcon } from "../../../icons/components/ErrorIcon";
import { HoverIcon } from "../../../icons/components/HoverIcon";
import { RegularIcon } from "../../../icons/components/RegularIcon";
import { WarningIcon } from "../../../icons/components/WarningIcon";
import { UITK_FOUNDATIONS } from "../../../utils/uitkValues";
import { JumpToTokenButton } from "../../toggles/JumpToTokenButton";

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

const StateIcon = (iconInitial: string) => {
  switch (iconInitial) {
    case "A":
      return <ActiveIcon />;
    case "D":
      return <DisabledIcon />;
    case "H":
      return <HoverIcon />;
    case "R":
      return <RegularIcon />;
    case "E":
      return <ErrorIcon />;
    case "W":
      return <WarningIcon />;
    default:
      return iconInitial;
  }
};

export const ColorValueEditor = (props: ColorValueEditorProps): JSX.Element => {
  const [selectedColor, setSelectedColor] = useState<Color | undefined>(
    undefined
  );

  const formFieldLabel: string = useMemo(() => {
    return props.pathToUpdate.includes("fade")
      ? `${capitalize(props.pathToUpdate.split("-")[0])} ${props.label}`
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
  }, [props.extractValue, props.value]);

  const onSelect = (color: Color | undefined, finalSelection: boolean) => {
    finalSelection ? onColorClose(color) : setSelectedColor(color);
    setSelectedColor(color);
  };

  const onColorClose = (chosenColor: Color | undefined) => {
    if (chosenColor) {
      const colorName = getColorNameByHexValue(chosenColor.hex);
      if (
        colorName &&
        !colorName?.startsWith("#") &&
        chosenColor.rgba.a === 1 // Only use token if no alpha value set
      ) {
        const colorParts = colorName.match(/[a-z]+|[^a-z]+/gi);
        if (colorParts?.length === 2) {
          const token = `uitk-${colorParts[0].toLowerCase()}-${colorParts[1]}`;
          props.onUpdateJSON(token, props.pathToUpdate, props.scope);
        }
      } else {
        const { r, g, b, a } = { ...chosenColor.rgba };
        const newColor =
          `rgb` +
          (a !== null ? `a` : ``) +
          `(${r}, ${g}, ${b}` +
          (a !== null ? `, ${a}` : ``) +
          `)`;

        props.onUpdateJSON(newColor, props.pathToUpdate, props.scope);
      }
      setSelectedColor(chosenColor);
    }
  };

  const onClear = () => {
    const defaultColor = props.extractValue(props.value);
    setSelectedColor(Color.makeColorFromHex(defaultColor));
  };

  const { getTriggerProps, getTooltipProps } = useTooltip({
    placement: "top-start",
  });

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
              [withBaseName("colorStates")]: props.isStateValue,
            })}
          >
            {!props.isStateValue && (
              <div className={cn(withBaseName("field"), "uitkFormLabel")}>
                {formFieldLabel}
              </div>
            )}
            {props.isStateValue && (
              <>
                <Tooltip
                  {...getTooltipProps({
                    title:
                      formFieldLabel === "Color" ||
                      formFieldLabel === "Background"
                        ? "Regular"
                        : formFieldLabel,
                  })}
                />
                <div
                  {...getTriggerProps({
                    className: cn(
                      "uitkFormLabel",
                      withBaseName("colorStatesField")
                    ),
                  })}
                >
                  {formFieldLabel.split(" ").slice(-1)[0].toLowerCase() !==
                    "background" &&
                  formFieldLabel.split(" ").slice(-1)[0].toLowerCase() !==
                    "color" ? (
                    StateIcon(
                      formFieldLabel.split(" ").slice(-1)[0][0].toUpperCase()
                    )
                  ) : (
                    <RegularIcon />
                  )}
                </div>
              </>
            )}
            <div
              className={cn({
                [withBaseName("backgroundColorInput")]:
                  formFieldLabel.includes("Background"),
              })}
            >
              <ToolkitProvider density="high">
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
              </ToolkitProvider>
            </div>
          </div>
          {props.characteristicsView && !props.isStateValue && (
            <JumpToTokenButton
              disabled={props.value.split("-").length < 2}
              value={props.value.split("-").slice(1)[0]}
              sectionToJumpTo={UITK_FOUNDATIONS}
              pathname={"/foundations/color"}
              search={`?open=${props.value.split("-").slice(1)[0]}`}
            />
          )}
        </div>
      )}
    </div>
  );
};
