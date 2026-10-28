import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

import iconCss from "./Icons.css";

// Icon name comes from https://ag-grid.com/javascript-data-grid/custom-icons/
// Array.from($0.childNodes).map(x => x.querySelector("._iconName_4em5v_50").innerText)
const providedIcons = [
  "aggregation",
  "arrows",
  "aasc",
  "asc",
  "cancel",
  "chart",
  "checkbox-checked",
  "checkbox-indeterminate",
  "checkbox-unchecked",
  "chevron-down",
  "chevron-left",
  "chevron-right",
  "chevron-up",
  "color-picker",
  "columns",
  "contracted",
  "copy",
  "cut",
  "cross",
  "csv",
  "adesc",
  "desc",
  "document",
  "down",
  "edit",
  "excel",
  "expanded",
  "eye-slash",
  "eye",
  "filter",
  "first",
  "grip",
  "group",
  "last",
  "left",
  "linked",
  "loading",
  "maximize",
  "menu",
  "menu-alt",
  "minimize",
  "minus",
  "next",
  "none",
  "not-allowed",
  "paste",
  "pdf",
  "pin",
  "pivot",
  "plus",
  "previous",
  "radio-button-off",
  "radio-button-on",
  "right",
  "save",
  "search",
  "settings",
  "small-down",
  "small-left",
  "small-right",
  "small-up",
  "tick",
  "tree-closed",
  "tree-indeterminate",
  "tree-open",
  "unlinked",
  "up",
];

const Icons = () => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-ag-grid-icons",
    css: iconCss,
    window: targetWindow,
  });

  const {
    containerProps: { className },
  } = useAgGridHelpers();

  return (
    <div className={className}>
      {providedIcons.map((x) => (
        <div key={x} className={`ag-icon-${x}`}>
          {x}
        </div>
      ))}
    </div>
  );
};

export default Icons;
