
import { characteristic, getCharacteristicValue, useTheme } from "@salt-ds/core";
import { Tooltip, useTooltip } from "@salt-ds/lab";
import cx from "classnames";

import "./ColorBlock.css";

export const ColorBlock = ({
  colorVar,
  className
}: {
  colorVar: string;
  className?: string;
}) => {
  const { theme } = useTheme();
  const { getTriggerProps, getTooltipProps } = useTooltip({ placement: "left"});
  
  let whiteCell = false;
  let value;

  const name = colorVar.split("--salt-")[1].split('-')[0] as characteristic;
  const variant = colorVar.split("--salt-")[1].split('-').slice(1).join('-');

  if (document.querySelector(`.${theme}`)) {
    value = getCharacteristicValue(theme, name, variant, document.querySelector(`.${theme}`));
    
    if (value && value?.includes("rgb(255, 255, 255)")) {
      whiteCell = true;
    }
  }

  
  return (
    <>
      <div className={cx("ColorBlock-cell", {
       "ColorBlock-whiteCell": whiteCell
      })}>
        <div
          {...getTriggerProps({ 
            className: cx("ColorBlock-cellInner", className), 
          })}
          style={{ background: `var(${colorVar})` }}
        />
      </div>
      {value && <Tooltip {...getTooltipProps({ title: value })} />}
      <code className="DocGrid-code">{colorVar}</code>
    </>
  );
};