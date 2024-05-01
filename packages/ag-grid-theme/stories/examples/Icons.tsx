import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import saltStyles from "../../css/_export-salt-icons.module.scss";
import uitkStyles from "../../css/_export-uitk-icons.module.scss";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

import { CSSProperties } from "react";
import iconCss from "./Icons.css";

const Icons = () => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-ag-grid-icons",
    css: iconCss,
    window: targetWindow,
  });
  const { themeName } = useAgGridThemeSwitcher();

  const { containerProps } = useAgGridHelpers({
    agThemeName: `ag-theme-${themeName}`,
  });
  const styles = themeName === "salt" ? saltStyles : uitkStyles;

  return (
    <>
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
