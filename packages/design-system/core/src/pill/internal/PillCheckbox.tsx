import { CheckboxIcon } from "../../checkbox";
import { makePrefixer } from "../../utils";
import { pillBaseName } from "../constants";

import "./PillCheckbox.css";

const withBaseName = makePrefixer(`${pillBaseName}-checkbox`);

export const PillCheckbox = (props: { checked?: boolean }): JSX.Element => {
  return <CheckboxIcon checked={props.checked} className={withBaseName()} />;
};
