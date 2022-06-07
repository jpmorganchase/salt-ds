import { makePrefixer, Tooltip, useTooltip } from "@jpmorganchase/uitk-core";
import { capitalize } from "@jpmorganchase/uitk-lab";
import { ReactElement } from "react";

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

  const { getTriggerProps, getTooltipProps } = useTooltip({
    placement: "top-start",
  });

  return (
    <>
      <Tooltip
        {...getTooltipProps({
          title:
            label === "All modes"
              ? "The below tokens apply to light and dark mode."
              : `The below tokens apply to ${props.scope.toLowerCase()} mode only.`,
        })}
      />
      <div {...getTriggerProps({ className: withBaseName() })}>
        {capitalize(label)}
      </div>
    </>
  );
};
