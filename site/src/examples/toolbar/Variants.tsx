import { Button, Dropdown, Option, Switch } from "@salt-ds/core";
import { AddIcon } from "@salt-ds/icons";
import { ToolbarNext, type ToolbarNextProps, TooltrayNext } from "@salt-ds/lab";
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
      <ToolbarNext
        aria-label={`${variant} toolbar`}
        key={variant}
        variant={variant}
      >
        <TooltrayNext overflowPriority={1}>
          <Switch label="Show total" />
        </TooltrayNext>
        <TooltrayNext align="end" overflowPriority={5}>
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
        </TooltrayNext>
      </ToolbarNext>
    ))}
  </div>
);
