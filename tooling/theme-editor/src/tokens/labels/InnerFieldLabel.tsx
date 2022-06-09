import { ReactElement } from "react";
import cn from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { capitalize } from "@jpmorganchase/uitk-lab";
import { JSONObj } from "../../helpers/parseToJson";
import "./InnerFieldLabel.css";
import { SECTIONED_BY_COLOR_STATE } from "../ChildrenValues";

const withBaseName = makePrefixer("uitkInnerFieldLabel");

interface InnerFieldLabelProps {
  fieldName: string;
  patternName: string;
  remainingJSON: JSONObj;
  size?: string;
}

export const InnerFieldLabel = ({
  fieldName,
  patternName,
  remainingJSON,
  size,
}: InnerFieldLabelProps): ReactElement => {
  const tokenPositionInPath = fieldName.split("-").length;
  const label = fieldName.split("-").slice(-1)[0];

  if (
    Object.keys(remainingJSON).length === 1 &&
    Object.keys(remainingJSON)[0] === "value" &&
    label !== "background" &&
    label !== "color" &&
    !SECTIONED_BY_COLOR_STATE.includes(label)
  ) {
    return <></>; // no need to return, will be shown next to value
  }

  const variantClassName = size ? withBaseName(`${size}`) : undefined;
  const isVariant = ["cta", "primary", "secondary", "tertiary"].includes(label);

  return (
    <div
      className={cn(withBaseName(), variantClassName, {
        [withBaseName("variant")]: isVariant,
        [withBaseName("large")]: !size && tokenPositionInPath < 2 && !isVariant,
        [withBaseName("medium")]: !size && tokenPositionInPath === 2,
        [withBaseName("small")]: !size && tokenPositionInPath > 2,
      })}
    >
      {label === "cta" ? "CTA" : capitalize(label)}
    </div>
  );
};
