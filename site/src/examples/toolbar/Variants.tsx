import { Button, Dropdown, Option, Switch } from "@salt-ds/core";
import { AddIcon } from "@salt-ds/icons";
import {
  ToolbarNext as Toolbar,
  type ToolbarNextProps,
  TooltrayNext as Tooltray,
} from "@salt-ds/lab";
import type { ReactElement } from "react";
import styles from "./index.module.css";
import { sortOptions } from "./toolbarExampleData";

const variants: NonNullable<ToolbarNextProps["variant"]>[] = [
  "primary",
  "secondary",
  "tertiary",
];

export const Variants = (): ReactElement => (
  <div className={styles.example}>
    {variants.map((variant) => (
      <Toolbar
        aria-label={`${variant} toolbar`}
        key={variant}
        variant={variant}
      >
        <Tooltray overflowPriority={1}>
          <Switch label="Show total" />
        </Tooltray>
        <Tooltray
          align="end"
          overflowPriority={5}
          role="group"
          aria-label="View settings"
        >
          <Dropdown
            bordered
            defaultSelected={[sortOptions[0]]}
            style={{ width: 140 }}
          >
            {sortOptions.map((option) => (
              <Option key={option} value={option} />
            ))}
          </Dropdown>
          <Button appearance="bordered">
            <AddIcon aria-hidden />
            Add view
          </Button>
        </Tooltray>
      </Toolbar>
    ))}
  </div>
);
