import { Tooltip, useTooltip } from "@salt-ds/lab";
import { clsx } from "clsx";

import "./OpacityBlock.css";

export const OpacityBlock = ({
  opacity,
  cssVariable,
  className,
}: {
  opacity: string;
  className?: string;
  cssVariable: string;
}) => {
  const { getTriggerProps, getTooltipProps } = useTooltip({
    placement: "left",
  });

  return (
    <>
      <div className={clsx("OpacityBlock-cell")}>
        <div
          {...getTriggerProps({
            className: clsx("OpacityBlock-cellInner", className),
          })}
          style={{ background: `rgba(36, 37, 38, var(${opacity}))` }}
        />
        <Tooltip {...getTooltipProps({ title: opacity })} />
      </div>
      <code className="DocGrid-code">{cssVariable}</code>
    </>
  );
};
