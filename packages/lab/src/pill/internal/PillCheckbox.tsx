import { CheckboxIcon, makePrefixer } from "@salt-ds/core";
import { pillBaseName } from "../constants";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import pillCheckboxCss from "./PillCheckbox.css";

const withBaseName = makePrefixer(`${pillBaseName}-checkbox`);

export const PillCheckbox = (props: { checked?: boolean }): JSX.Element => {
  const { window: targetWindow } = useWindow();
  useComponentCssInjection({
    id: "salt-pill-checkbox",
    css: pillCheckboxCss,
    window: targetWindow,
  });
  return <CheckboxIcon checked={props.checked} className={withBaseName()} />;
};
