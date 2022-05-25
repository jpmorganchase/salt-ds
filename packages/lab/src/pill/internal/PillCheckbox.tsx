import { makePrefixer } from "@jpmorganchase/uitk-core";
import {
  CheckboxIcon as CheckboxUncheckedIcon,
  CheckboxCheckedIcon,
} from "../../checkbox";
import { pillBaseName } from "../constants";

import "./PillCheckbox.css";

const withBaseName = makePrefixer(`${pillBaseName}-checkbox`);

export const PillCheckbox = (props: { checked?: boolean }) => {
  const { checked } = props;
  return (
    <span className={withBaseName()}>
      {checked ? (
        <CheckboxCheckedIcon className={withBaseName("icon-checked")} />
      ) : (
        <CheckboxUncheckedIcon className={withBaseName("icon")} />
      )}
    </span>
  );
};
