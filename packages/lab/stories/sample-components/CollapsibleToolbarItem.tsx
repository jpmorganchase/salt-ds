import cx from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import "./CollapsibleToolbarItem.css";

const withBaseName = makePrefixer("CollapsibleToolbarItem");

interface CollapsibleToolbarItemProps {
  "data-collapsed"?: string;
  label: string;
}

export const CollapsibleToolbarItem = ({
  label = "Full Size",
}: CollapsibleToolbarItemProps) => {
  return <div className={cx(withBaseName())}>{label}</div>;
};
