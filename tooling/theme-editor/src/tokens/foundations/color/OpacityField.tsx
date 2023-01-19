import { makePrefixer } from "@salt-ds/core";
import { FormField } from "@salt-ds/lab";
import { clsx } from "clsx";
import { ReactElement } from "react";
import {
  SALT_CHARACTERISTICS,
  SALT_FOUNDATIONS,
} from "../../../utils/saltValues";
import { JumpToTokenButton } from "../../toggles/JumpToTokenButton";
import { OpacityInput } from "./OpacityInput";

import "./OpacityField.css";

const withBaseName = makePrefixer("saltOpacityField");

interface OpacityFieldProps {
  alphaValue: string | undefined;
  alphaValuePattern: string;
  formFieldLabel: string;
  onAlphaClose: () => void;
  onAlphaChange: (alpha: string) => void;
}

export const OpacityField = (props: OpacityFieldProps): ReactElement => {
  return (
    <div className={clsx(withBaseName("jumpToFoundationNotColor"))}>
      <FormField label={`Opacity`}>
        <OpacityInput
          alphaValue={props.alphaValue ?? ""}
          onAlphaChange={props.onAlphaChange}
          onClose={props.onAlphaClose}
        />
      </FormField>
      {props.alphaValue?.startsWith("salt") && (
        <JumpToTokenButton
          disabled={
            !props.alphaValuePattern.length ||
            !(
              SALT_FOUNDATIONS.includes(props.alphaValuePattern) ||
              SALT_CHARACTERISTICS.includes(props.alphaValuePattern)
            )
          }
          sectionToJumpTo={
            props.alphaValuePattern &&
            SALT_FOUNDATIONS.includes(props.alphaValuePattern)
              ? SALT_FOUNDATIONS
              : SALT_CHARACTERISTICS
          }
          value={props.alphaValuePattern}
          search={
            props.alphaValuePattern &&
            SALT_FOUNDATIONS.includes(props.alphaValuePattern)
              ? ``
              : `?open=${props.alphaValuePattern}`
          }
          pathname={
            props.alphaValuePattern &&
            SALT_FOUNDATIONS.includes(props.alphaValuePattern)
              ? `/foundations/${props.alphaValuePattern}`
              : `/characteristics`
          }
        />
      )}
    </div>
  );
};
