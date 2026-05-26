import {
  Button,
  Dropdown,
  Option,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/core";
import { AddIcon, ExportIcon, FilterIcon } from "@salt-ds/icons";
import { ToolbarNext, TooltrayNext } from "@salt-ds/lab";
import type { ReactElement } from "react";
import styles from "./index.module.css";
import { accountOptions } from "./toolbarExampleData";

export const ContentSections = (): ReactElement => (
  <div className={styles.example}>
    <ToolbarNext aria-label="Domain toolbar">
      <TooltrayNext overflowMode="none">
        <Dropdown
          bordered
          defaultSelected={[accountOptions[0]]}
          style={{ width: 120 }}
        >
          {accountOptions.map((option) => (
            <Option key={option} value={option} />
          ))}
        </Dropdown>
      </TooltrayNext>
      <TooltrayNext
        align="center"
        overflowPriority={5}
        role="group"
        aria-label="Report view"
      >
        <ToggleButtonGroup defaultValue="reports">
          <ToggleButton value="reports">Reports</ToggleButton>
          <ToggleButton value="schedules">Schedules</ToggleButton>
        </ToggleButtonGroup>
      </TooltrayNext>
      <TooltrayNext
        align="end"
        overflowPriority={6}
        role="group"
        aria-label="Domain actions"
      >
        <Button appearance="transparent" aria-label="Filter">
          <FilterIcon aria-hidden />
        </Button>
        <Button appearance="transparent" aria-label="Export">
          <ExportIcon aria-hidden />
        </Button>
        <Button appearance="solid">
          <AddIcon aria-hidden />
          Add domain
        </Button>
      </TooltrayNext>
    </ToolbarNext>
  </div>
);
