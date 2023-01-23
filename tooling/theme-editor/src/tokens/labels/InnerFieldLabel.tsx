import { ReactElement } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import { capitalize } from "@salt-ds/lab";
import { JSONObj } from "../../helpers/parseToJson";
import "./InnerFieldLabel.css";
import { SECTIONED_BY_COLOR_STATE } from "../ChildrenValues";

const withBaseName = makePrefixer("saltInnerFieldLabel");

interface InnerFieldLabelProps {
  fieldName: string;
  isEmphasis?: boolean;
  patternName: string;
  remainingJSON: JSONObj;
  size?: string;
}

const getLabel = (fieldName: string, isEmphasis?: boolean) => {
  let label = fieldName.split("-").slice(-1)[0];

  if (isEmphasis) {
    if (label === "med") label = "Medium";
    label += " emphasis";
  }

  return label;
};

export const InnerFieldLabel = ({
  fieldName,
  patternName,
  remainingJSON,
  size,
  isEmphasis = false,
}: InnerFieldLabelProps): ReactElement => {
  const tokenPositionInPath = fieldName.split("-").length;
  let label = getLabel(fieldName, isEmphasis);

  if (
    (Object.keys(remainingJSON).length === 1 &&
      Object.keys(remainingJSON)[0] === "value" &&
      label !== "background" &&
      label !== "color" &&
      !SECTIONED_BY_COLOR_STATE.includes(label)) ||
    label === "emphasis"
  ) {
    return <></>; // no need to return, will be shown next to value
  }

  const variantClassName = size ? withBaseName(`${size}`) : undefined;

  return (
    <div
      className={clsx(withBaseName(), variantClassName, {
        [withBaseName("large")]: !size && tokenPositionInPath === 1,
        [withBaseName("medium")]: !size && tokenPositionInPath === 2,
        [withBaseName("small")]: !size && tokenPositionInPath > 2,
      })}
    >
      {label === "cta" ? "CTA" : (capitalize(label) as string)}
    </div>
  );
};
