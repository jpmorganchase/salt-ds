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
  } else if (props.scope.includes("emphasis")) {
    label = `${capitalize(props.scope.split("-")[2])} mode: ${capitalize(
      props.scope.split("-")[1]
    )} emphasis`;
  } else {
    label = props.scope + " mode";
  }
  return (
    <Tooltip
      title={
        label === "All modes"
          ? "The below tokens apply to light and dark mode."
          : label.includes("emphasis")
          ? `The below tokens apply to ${props.scope.split("-")[2]} mode in ${
              props.scope.split("-")[1]
            } emphasis only.`
          : `The below tokens apply to ${props.scope.toLowerCase()} mode only.`
      }
      placement="top-start"
    >
      <div className={cn(withBaseName())}>{capitalize(label) as string}</div>
    </Tooltip>
  );
};
