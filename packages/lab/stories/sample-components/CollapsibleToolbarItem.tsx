import cx from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import "./CollapsibleToolbarItem.css";

const withBaseName = makePrefixer("CollapsibleToolbarItem");

interface CollapsibleToolbarItemProps {
  "data-collapsed"?: string;
  label: string;
  labelCompact?: string;
}

export const CollapsibleToolbarItem = ({
  "data-collapsed": collapsed,
  label = "Full Size",
  labelCompact = "Compact",
}: CollapsibleToolbarItemProps) => {
  console.log({ collapsed });
  return (
    <div
      className={cx(withBaseName(), {
        [withBaseName("compact")]: collapsed === "true",
      })}
    >
      {label}
    </div>
  );
};
