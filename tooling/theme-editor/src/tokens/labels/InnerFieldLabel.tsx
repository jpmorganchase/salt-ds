import { ReactElement } from "react";
import cn from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { capitalize } from "@jpmorganchase/lab";
import { JSONObj } from "../../helpers/parseToJson";
import { UITK_COLOURS } from "../../utils/uitkValues";
import "./InnerFieldLabel.css";

const withBaseName = makePrefixer("uitkInnerFieldLabel");

interface InnerFieldLabelProps {
  fieldName: string;
  patternName: string;
  remainingJSON: JSONObj;
}

export const InnerFieldLabel = (props: InnerFieldLabelProps): ReactElement => {
  const tokenPositionInPath = props.fieldName.split("-").length;

  if (
    UITK_COLOURS.indexOf(props.patternName) !== -1 ||
    (Object.keys(props.remainingJSON).length === 1 &&
      Object.keys(props.remainingJSON)[0] === "value")
  ) {
    return <></>; // no need to return, will be shown next to value
  }

  const label = props.fieldName.split("-").slice(-1)[0];

  return (
    <div
      className={cn(withBaseName(), {
        [withBaseName("Large")]: tokenPositionInPath === 1,
        [withBaseName("Medium")]: tokenPositionInPath === 2,
        [withBaseName("Small")]: tokenPositionInPath > 2,
      })}
    >
      {label === "cta" ? "CTA" : (capitalize(label) as string)}
    </div>
  );
};
