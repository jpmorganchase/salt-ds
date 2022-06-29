import { FormField, makePrefixer } from "@jpmorganchase/uitk-core";
import cn from "classnames";
import { ReactElement } from "react";
import {
  UITK_CHARACTERISTICS,
  UITK_FOUNDATIONS,
} from "../../../utils/uitkValues";
import { JumpToTokenButton } from "../../toggles/JumpToTokenButton";
import { OpacityInput } from "./OpacityInput";

import "./OpacityField.css";

const withBaseName = makePrefixer("uitkOpacityField");

interface OpacityFieldProps {
  alphaValue: string | undefined;
  alphaValuePattern: string;
  formFieldLabel: string;
  onAlphaClose: () => void;
  onAlphaChange: (alpha: string) => void;
}

export const OpacityField = (props: OpacityFieldProps): ReactElement => {
  return (
    <div className={cn(withBaseName("jumpToFoundationNotColor"))}>
      <FormField label={`Opacity`}>
        <OpacityInput
          alphaValue={props.alphaValue ?? ""}
          onAlphaChange={props.onAlphaChange}
          onClose={props.onAlphaClose}
        />
      </FormField>
      {props.alphaValue?.startsWith("uitk") && (
        <JumpToTokenButton
          disabled={
            !props.alphaValuePattern.length ||
            !(
              UITK_FOUNDATIONS.includes(props.alphaValuePattern) ||
              UITK_CHARACTERISTICS.includes(props.alphaValuePattern)
            )
          }
          sectionToJumpTo={
            props.alphaValuePattern &&
            UITK_FOUNDATIONS.includes(props.alphaValuePattern)
              ? UITK_FOUNDATIONS
              : UITK_CHARACTERISTICS
          }
          value={props.alphaValuePattern}
          search={
            props.alphaValuePattern &&
            UITK_FOUNDATIONS.includes(props.alphaValuePattern)
              ? ``
              : `?open=${props.alphaValuePattern}`
          }
          pathname={
            props.alphaValuePattern &&
            UITK_FOUNDATIONS.includes(props.alphaValuePattern)
              ? `/foundations/${props.alphaValuePattern}`
              : `/characteristics`
          }
        />
      )}
    </div>
  );
};
