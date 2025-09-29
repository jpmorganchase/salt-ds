import { Dropdown, Option } from "@salt-ds/core";
import type { ReactElement } from "react";
import { shortColorData } from "./exampleData";

export const OverlayProps = (): ReactElement => {
  return (
    <Dropdown
      OverlayProps={{
        style: {
          maxHeight:
            // Show 5 items
            "calc((var(--salt-size-base) + var(--salt-spacing-100)) * 5)",
        },
      }}
      style={{ width: "266px" }}
    >
      {shortColorData.map((color) => (
        <Option value={color} key={color} />
      ))}
    </Dropdown>
  );
};
