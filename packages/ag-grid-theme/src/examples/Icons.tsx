import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

import iconCss from "./Icons.css";

const Icons = () => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-ag-grid-icons",
    css: iconCss,
    window: targetWindow,
  });
  const { switcher, themeName } = useAgGridThemeSwitcher();

  const {
    containerProps: { className },
  } = useAgGridHelpers({
    agThemeName: `ag-theme-${themeName}`,
  });

  return (
    <>
      {switcher}
      <div className={className}>
        <div className="ag-icon-aggregation">aggregation</div>
        <div className="ag-icon-arrows">arrows</div>
        <div className="ag-icon-asc">asc</div>
        <div className="ag-icon-cancel">cancel</div>
        <div className="ag-icon-chart">chart</div>
        <div className="ag-icon-columns">columns</div>
        <div className="ag-icon-contracted">contracted</div>
        <div className="ag-icon-copy">copy</div>
        <div className="ag-icon-cross">cross</div>
        <div className="ag-icon-cut">cut</div>
        <div className="ag-icon-csv">csv</div>
        <div className="ag-icon-desc">desc</div>
        <div className="ag-icon-excel">excel</div>
        <div className="ag-icon-expanded">expanded</div>
        <div className="ag-icon-eye-slash">eye-slash</div>
        <div className="ag-icon-eye">eye</div>
        <div className="ag-icon-filter">filter</div>
        <div className="ag-icon-filter-clear">filter-clear</div>
        <div className="ag-icon-first">first</div>
        <div className="ag-icon-group">group</div>
        <div className="ag-icon-last">last</div>
        <div className="ag-icon-left">left</div>
        <div className="ag-icon-linked">linked</div>
        <div className="ag-icon-loading">loading</div>
        <div className="ag-icon-menu">menu</div>
        <div className="ag-icon-next">next</div>
        <div className="ag-icon-none">none</div>
        <div className="ag-icon-not-allowed">not-allowed</div>
        <div className="ag-icon-paste">paste</div>
        <div className="ag-icon-pin">pin</div>
        <div className="ag-icon-pivot">pivot</div>
        <div className="ag-icon-previous">previous</div>
        <div className="ag-icon-right">right</div>
        <div className="ag-icon-save">save</div>
        <div className="ag-icon-small-down">small-down</div>
        <div className="ag-icon-small-left">small-left</div>
        <div className="ag-icon-small-right">small-right</div>
        <div className="ag-icon-small-up">small-up</div>
        <div className="ag-icon-tick">tick</div>
        <div className="ag-icon-tree-closed">tree-closed</div>
        <div className="ag-icon-tree-open">tree-open</div>
        <div className="ag-icon-unlinked">unlinked</div>
      </div>
    </>
  );
};

Icons.parameters = {
  chromatic: { disableSnapshot: false, delay: 1000 },
};

export default Icons;
