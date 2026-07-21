import {
  Button,
  Dropdown,
  Option,
  Switch,
  Toolbar,
  type ToolbarProps,
  Tooltray,
} from "@salt-ds/core";
import { AddIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";
import { ResizableExample } from "../components/ResizableExample";
import styles from "./index.module.css";
import { sortOptions } from "./toolbarExampleData";

const variants: NonNullable<ToolbarProps["variant"]>[] = [
  "primary",
  "secondary",
  "tertiary",
];

export const Variants = (): ReactElement => (
  <ResizableExample>
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
          <Tooltray align="end" overflowPriority={5}>
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
  </ResizableExample>
);
