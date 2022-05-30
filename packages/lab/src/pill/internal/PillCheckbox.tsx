import { makePrefixer } from "@jpmorganchase/uitk-core";
import { CheckboxIcon } from "../../checkbox";
import { pillBaseName } from "../constants";

import "./PillCheckbox.css";

const withBaseName = makePrefixer(`${pillBaseName}-checkbox`);

export const PillCheckbox = (props: { checked?: boolean }): JSX.Element => {
  return <CheckboxIcon checked={props.checked} className={withBaseName()} />;
};
