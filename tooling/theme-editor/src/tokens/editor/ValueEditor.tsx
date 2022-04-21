import { useState, ReactElement, useCallback, useMemo, useEffect } from "react";
import cn from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { capitalize, FormField, Input } from "@jpmorganchase/lab";
import {
  ColorValueEditor,
  isColor,
} from "../foundations/color/ColorValueEditor";
import { UITK_COLOURS, UITK_FOUNDATIONS } from "../../utils/uitkValues";
import { validateTokenInput } from "../../helpers/validateTokenInput";
import { JumpToTokenButton } from "../toggles/JumpToTokenButton";
import "./ValueEditor.css";

const withBaseName = makePrefixer("uitkValueEditor");

interface ValueEditorProps {
  characteristicsView?: boolean;
  extractValue: (value: string) => string;
  onUpdateJSON: (value: string, pathToUpdate: string, scope: string) => void;
  patternName: string;
  scope: string;
  uitkColorOverrides?: Record<string, string>;
  value: string;
  valueName: string;
}

export const ValueEditor = (props: ValueEditorProps): ReactElement => {
  const [value, setValue] = useState<string>(props.value);

  const displayValue = props.characteristicsView
    ? value
    : props.extractValue(value);

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  let valueName;

  if (UITK_COLOURS.indexOf(props.patternName) === -1) {
    valueName = props.valueName.split("-").slice(-1)[0];
  } else {
    valueName = props.valueName.split("-").join(" ");
  }

  const pathToUpdate = useMemo(() => {
    return UITK_COLOURS.includes(props.valueName)
      ? props.valueName
      : `${props.patternName}-${props.valueName}`;
  }, [props.valueName, props.patternName]);

  const originalValue = useMemo(() => {
    return props.value;
  }, [props.value]);

  const onChange = useCallback((value: string) => {
    setValue(value);
  }, []);

  const onCommit = () => {
    let validateInput = value;
    if (value.startsWith("uitk")) {
      validateInput = props.extractValue(value);
    }
    if (!validateTokenInput(pathToUpdate, validateInput)) {
      setValue(originalValue);
    } else {
      if (value !== originalValue) {
        props.onUpdateJSON(value, pathToUpdate, props.scope);
      }
    }
  };

  return (
    <div className={cn(withBaseName())}>
      {isColor(props.extractValue(value)).length ? (
        <div className={cn(withBaseName("colorInput"))}>
          <ColorValueEditor
            uitkColorOverrides={props.uitkColorOverrides}
            characteristicsView={props.characteristicsView}
            extractValue={props.extractValue}
            key={`colorswatch-${valueName}`}
            label={valueName}
            onUpdateJSON={props.onUpdateJSON}
            originalValue={originalValue}
            pathToUpdate={pathToUpdate}
            scope={props.scope}
            setValue={setValue}
            value={value}
          />
        </div>
      ) : (
        <div
          className={cn(withBaseName("input"), {
            [withBaseName("inputWithColumns")]:
              displayValue.length < 7 &&
              !UITK_COLOURS.includes(props.patternName),
            [withBaseName("jumpToFoundationNotColor")]:
              props.characteristicsView && props.value.startsWith("uitk"),
          })}
        >
          <FormField label={capitalize(valueName) as string}>
            <Input
              onChange={(e) => {
                onChange(e.target.value);
              }}
              onBlur={(e) => {
                onCommit();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.currentTarget.blur();
                }
              }}
              value={displayValue}
            />
          </FormField>
          {props.characteristicsView && props.value.startsWith("uitk") && (
            <JumpToTokenButton
              disabled={false}
              pathname={`/foundations/${props.value.split("-").slice(1)[0]}`}
              search={
                props.value.split("-").slice(1)[0] === "shadow"
                  ? `?open=${props.value.split("-").slice(-2).join("")}`
                  : ``
              }
              sectionToJumpTo={UITK_FOUNDATIONS}
              value={props.value.split("-").slice(1)[0]}
            />
          )}
        </div>
      )}
    </div>
  );
};
