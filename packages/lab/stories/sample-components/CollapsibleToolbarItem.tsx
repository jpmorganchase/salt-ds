import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import "./CollapsibleToolbarItem.css";

const withBaseName = makePrefixer("CollapsibleToolbarItem");

interface CollapsibleToolbarItemProps {
  "data-collapsed"?: string;
  label: string;
}

export const CollapsibleToolbarItem = ({
  label = "Full Size",
}: CollapsibleToolbarItemProps) => {
  return <div className={clsx(withBaseName())}>{label}</div>;
};
