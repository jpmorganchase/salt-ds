import { Tab, Tabstrip } from "@jpmorganchase/uitk-lab";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useTabsWithRouting } from "../utils/useTabsWithRouting";

import "./ScopeSelector.css";

export enum FoundationView {
  COLOR,
  SHADOW,
  SIZE,
  SPACING,
  TYPOGRAPHY,
  ZINDEX,
}

export enum ThemeMode {
  LIGHT,
  DARK,
}

export const ScopeSelector = (): JSX.Element => {
  const [selectedTabIndex, handleTabSelection] = useTabsWithRouting(
    ["/foundations", "/characteristics"],
    true
  );
  const prevFoundation = useRef("color");
  const location = useLocation();

  useEffect(() => {
    if (
      location.pathname.includes("foundations") &&
      location.pathname.split("/").length > 2
    ) {
      prevFoundation.current = location.pathname
        .split("/")
        .slice(-1)[0]
        .split("?")[0];
    }
  }, [location.pathname]);

  const onChange = (tabIndex: number) => {
    handleTabSelection?.(
      tabIndex,
      selectedTabIndex === 1 ? prevFoundation.current : undefined
    );
  };

  return (
    <div className="uitkScopeSelector">
      <Tabstrip
        centered
        onActiveChange={onChange}
        overflowMenu={false}
        activeTabIndex={selectedTabIndex}
      >
        {["Foundations", "Characteristics"].map((label, i) => (
          <Tab aria-label={label} label={label} key={i} />
        ))}
      </Tabstrip>
    </div>
  );
};
