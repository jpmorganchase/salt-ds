import { makePrefixer } from "@salt-ds/core";
import { capitalize, FormField, Input } from "@salt-ds/lab";
import { clsx } from "clsx";
import { ReactElement, useCallback, useEffect, useMemo, useState } from "react";
import { validateTokenInput } from "../../helpers/validateTokenInput";
import { SALT_FOUNDATIONS } from "../../utils/saltValues";
import {
  ColorValueEditor,
  isColor,
} from "../foundations/color/ColorValueEditor";
import { JumpToTokenButton } from "../toggles/JumpToTokenButton";

import "./ValueEditor.css";

const withBaseName = makePrefixer("saltValueEditor");

interface ValueEditorProps {
  characteristicsView?: boolean;
  extractValue: (value: string) => string;
  isStateValue?: boolean;
  onUpdateJSON: (value: string, pathToUpdate: string, scope: string) => void;
  patternName: string;
  scope: string;
  saltColorOverrides?: Record<string, string>;
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

  let valueName = props.valueName.split("-").join(" ");

  const pathToUpdate = useMemo(() => {
    return `${props.patternName}-${props.valueName}`;
  }, [props.valueName, props.patternName]);

  const originalValue = useMemo(() => {
    return props.value;
  }, [props.value]);

  const onChange = useCallback((value: string) => {
    setValue(value);
  }, []);

  const onCommit = () => {
    let validateInput = value;
    if (value.startsWith("salt")) {
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
    <div className={clsx(withBaseName())}>
      {props.isStateValue || isColor(props.extractValue(value)).length ? (
        <div className={clsx(withBaseName("colorInput"))}>
          <ColorValueEditor
            saltColorOverrides={props.saltColorOverrides}
            characteristicsView={props.characteristicsView}
            extractValue={props.extractValue}
            isStateValue={props.isStateValue}
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
          className={clsx(withBaseName("input"), {
            [withBaseName("inputWithColumns")]: displayValue.length < 7,
            [withBaseName("jumpToFoundationNotColor")]:
              props.characteristicsView && props.value.startsWith("salt"),
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
          {props.characteristicsView && props.value.startsWith("salt") && (
            <JumpToTokenButton
              disabled={false}
              pathname={`/foundations/${props.value.split("-").slice(1)[0]}`}
              search={
                props.value.split("-").slice(1)[0] === "shadow"
                  ? `?open=${props.value.split("-").slice(-2).join("")}`
                  : ``
              }
              sectionToJumpTo={SALT_FOUNDATIONS}
              value={props.value.split("-").slice(1)[0]}
            />
          )}
        </div>
      )}
    </div>
  );
};
