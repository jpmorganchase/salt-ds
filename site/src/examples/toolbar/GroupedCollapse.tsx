import { Button, Dropdown, Option } from "@salt-ds/core";
import { AddIcon } from "@salt-ds/icons";
import {
  ToolbarNext as Toolbar,
  ToolbarContent,
  TooltrayNext as Tooltray,
} from "@salt-ds/lab";
import type { ReactElement } from "react";
import styles from "./index.module.css";
import { accountOptions, typeOptions } from "./toolbarExampleData";

export const GroupedCollapse = (): ReactElement => (
  <div className={styles.constrained}>
    <Toolbar aria-label="Account toolbar" variant="tertiary">
      <ToolbarContent position="start">
        <Tooltray overflowPriority={1}>
          <Dropdown
            bordered
            defaultSelected={[typeOptions[1]]}
            style={{ width: 140 }}
          >
            {typeOptions.map((option) => (
              <Option key={option} value={option} />
            ))}
          </Dropdown>
        </Tooltray>
      </ToolbarContent>
      <ToolbarContent position="end">
        <Tooltray
          overflowGroup="Account"
          overflowLabel="Select account"
          overflowMode="grouped"
          overflowPriority={5}
          role="group"
          aria-label="Account actions"
        >
          <Dropdown
            bordered
            defaultSelected={[accountOptions[1]]}
            style={{ width: 220 }}
          >
            {accountOptions.map((option) => (
              <Option key={option} value={option} />
            ))}
          </Dropdown>
          <Button appearance="transparent" aria-label="Add account">
            <AddIcon aria-hidden />
          </Button>
        </Tooltray>
      </ToolbarContent>
    </Toolbar>
  </div>
);
