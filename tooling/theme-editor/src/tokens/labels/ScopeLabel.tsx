import { ReactElement } from "react";
import cn from "classnames";
import { capitalize, Tooltip } from "@jpmorganchase/lab";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import "./ScopeLabel.css";

const withBaseName = makePrefixer("uitkThemeScopeLabel");

interface ScopeLabelProps {
  scope: string;
}

export const ScopeLabel = (props: ScopeLabelProps): ReactElement => {
  let label = "";
  if (props.scope === "mode-all") {
    label = "All modes";
  } else {
    label = props.scope + " mode";
  }
  return (
    <Tooltip
      title={
        label === "All modes"
          ? "The below tokens apply to light and dark mode."
          : `The below tokens apply to ${props.scope.toLowerCase()} mode only.`
      }
      placement="top-start"
    >
      <div className={cn(withBaseName())}>{capitalize(label) as string}</div>
    </Tooltip>
  );
};
