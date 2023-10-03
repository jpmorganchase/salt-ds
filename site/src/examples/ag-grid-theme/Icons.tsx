import { CSSProperties } from "react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { useAgGridHelpers } from "./useAgGridHelpers";

import styles from "../../css/_export-salt-icons.module.scss";
import iconCss from "./Icons.css";

export const Icons = () => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-ag-grid-icons",
    css: iconCss,
    window: targetWindow,
  });

  const { containerProps } = useAgGridHelpers();

  return (
    <>
      {Object.keys(styles).map((key) => {
        if (styles[key].startsWith('"')) {
          return (
            <div
              {...containerProps}
              style={{ "--icon-content": styles[key] } as CSSProperties}
            >
              {key}
            </div>
          );
        }
      })}
    </>
  );
};