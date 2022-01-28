import { ReactElement } from "react";
import cn from "classnames";
import { makePrefixer } from "@brandname/core";
import { capitalize } from "@brandname/lab";
import { JSONObj } from "../../helpers/parseToJson";
import { UITK_COLOURS } from "../../utils/uitkValues";
import "./InnerFieldLabel.css";

const withBaseName = makePrefixer("uitkInnerFieldLabel");

interface InnerFieldLabelProps {
  fieldName: string;
  patternName: string;
  size?: string;
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
  const variantClassName = props.size
    ? withBaseName(`${props.size}`)
    : undefined;
  return (
    <div
      className={cn(withBaseName(), variantClassName, {
        [withBaseName("large")]: !props.size && tokenPositionInPath === 1,
        [withBaseName("medium")]: !props.size && tokenPositionInPath === 2,
        [withBaseName("small")]: !props.size && tokenPositionInPath > 2,
      })}
    >
      {label === "cta" ? "CTA" : (capitalize(label) as string)}
    </div>
  );
};
