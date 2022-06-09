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

export function isColor(value: string): string | undefined {
  if (rgbaRegex.exec(value) || rgbRegex.exec(value)) {
    return value;
  }
  if (hexRegex.exec(value)) {
    return value;
  }
  if (hslRegex.exec(value) || hslaRegex.exec(value)) {
    return value;
  }

  return undefined;
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

const StateLabel = (props: { label: string }): JSX.Element => {
  return <div className={"uitkFormLabel"}>{props.label}</div>;
};

export const ColorValueEditor = (props: ColorValueEditorProps): JSX.Element => {
  const {
    characteristicsView,
    extractValue,
    isStateValue,
    label,
    onUpdateJSON,
    pathToUpdate,
    scope,
    uitkColorOverrides,
    value,
  } = props;

  const [selectedColor, setSelectedColor] = useState<Color | undefined>(
    undefined
  );

  const formFieldLabel: string = useMemo(() => {
    return `${capitalize(label)}`;
  }, [label]);

  useEffect(() => {
    if (value.includes("fade")) {
      const color = value.split("-fade")[0];
      const opacity = `uitk-opacity-${value.split("fade-")[1]}`;
      const rgba = `${extractValue(color)
        .replace("rgb(", "")
        .replace(")", "")}, ${extractValue(opacity)}`;
      setSelectedColor(
        Color.makeColorFromRGB(
          ...rgba.split(",").map((n) => parseFloat(n.replace(" ", "")))
        )
      );
    } else {
      setSelectedColor(Color.makeColorFromHex(extractValue(value)));
    }
  }, [extractValue, value]);

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
          onUpdateJSON(token, pathToUpdate, scope);
        }
      } else {
        const { r, g, b, a } = { ...chosenColor.rgba };
        const newColor =
          `rgb` +
          (a !== null ? `a` : ``) +
          `(${r}, ${g}, ${b}` +
          (a !== null ? `, ${a}` : ``) +
          `)`;

        onUpdateJSON(newColor, pathToUpdate, scope);
      }
      setSelectedColor(chosenColor);
    }
  };

  const onClear = () => {
    const defaultColor = extractValue(value);
    setSelectedColor(Color.makeColorFromHex(defaultColor));
  };

  const { getTriggerProps, getTooltipProps } = useTooltip({
    placement: "top-start",
  });

  return (
    <div
      className={cn(withBaseName("input"), {
        [withBaseName("foundationColor")]: !characteristicsView,
        [withBaseName("colorByState")]: isStateValue,
      })}
    >
      {!pathToUpdate.includes("fade") && (
        <div
          className={cn({
            [withBaseName("jumpToFoundation")]:
              characteristicsView &&
              !pathToUpdate.includes("fade") &&
              !isStateValue,
            [withBaseName("jumpToFoundationNotColor")]:
              characteristicsView && pathToUpdate.includes("fade"),
          })}
        >
          <div
            className={cn(withBaseName("colorInput"), {
              [withBaseName("colorStates")]: isStateValue,
            })}
          >
            {!isStateValue && <StateLabel label={formFieldLabel} />}
            {isStateValue && (
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
            <ColorChooser
              color={selectedColor}
              displayHexOnly={!characteristicsView}
              hideLabel={isStateValue}
              showSwatches={characteristicsView ? true : false}
              showColorPicker={characteristicsView ? false : true}
              onSelect={onSelect}
              onClear={onClear}
              UITKColorOverrides={uitkColorOverrides}
            />
          </div>
          {characteristicsView && !isStateValue && (
            <JumpToTokenButton
              disabled={value.split("-").length < 2}
              value={value.split("-").slice(1)[0]}
              sectionToJumpTo={UITK_FOUNDATIONS}
              pathname={"/foundations/color"}
              search={`?open=${value.split("-").slice(1)[0]}`}
            />
          )}
        </div>
      )}
    </div>
  );
};
