import { allIcons } from "@jpmorganchase/uitk-icons/stories/icon.all";
import { createElement } from "react";

export const AllIcons = () => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(15, auto)",
        gap: 8,
        padding: "6px 0",
      }}
    >
      {allIcons.map((iconComponent, i) =>
        createElement(iconComponent, { key: i })
      )}
    </div>
  );
};
