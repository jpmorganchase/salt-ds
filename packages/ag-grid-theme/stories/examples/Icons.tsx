import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import saltStyles from "../../css/_export-salt-icons.module.scss";
import uitkStyles from "../../css/_export-uitk-icons.module.scss";

import iconCss from "./Icons.css";
import { CSSProperties } from "react";

const Icons = () => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-ag-grid-icons",
    css: iconCss,
    window: targetWindow,
  });
  const { switcher, themeName } = useAgGridThemeSwitcher();

  const { containerProps } = useAgGridHelpers({
    agThemeName: `ag-theme-${themeName}`,
  });
  const styles = themeName === "salt" ? saltStyles : uitkStyles;

  return (
    <>
      {switcher}
      {Object.keys(styles).map((key) => {
        if (styles[key].startsWith('"')) {
          return (
            <div
              {...containerProps}
              style={{ "--icon-content": styles[key] } as CSSProperties}
              key={key}
            >
              {key}
            </div>
          );
        }
      })}
    </>
  );
};

Icons.parameters = {
  chromatic: { disableSnapshot: false },
};

export default Icons;
