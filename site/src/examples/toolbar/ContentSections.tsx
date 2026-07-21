import {
  Button,
  Dropdown,
  Option,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  ToolbarContent,
  Tooltray,
} from "@salt-ds/core";
import { AddIcon, ExportIcon, FilterIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";
import { ResizableExample } from "../components/ResizableExample";
import styles from "./index.module.css";
import { accountOptions } from "./toolbarExampleData";

export const ContentSections = (): ReactElement => (
  <ResizableExample>
    <div className={styles.example}>
      <Toolbar aria-label="Domain toolbar">
        <ToolbarContent position="start">
          <Tooltray overflowMode="none">
            <Dropdown
              bordered
              defaultSelected={[accountOptions[0]]}
              style={{ width: 120 }}
            >
              {accountOptions.map((option) => (
                <Option key={option} value={option} />
              ))}
            </Dropdown>
          </Tooltray>
        </ToolbarContent>
        <ToolbarContent position="center">
          <Tooltray overflowPriority={5}>
            <ToggleButtonGroup defaultValue="reports">
              <ToggleButton value="reports">Reports</ToggleButton>
              <ToggleButton value="schedules">Schedules</ToggleButton>
            </ToggleButtonGroup>
          </Tooltray>
        </ToolbarContent>
        <ToolbarContent position="end">
          <Tooltray overflowPriority={6}>
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
          </Tooltray>
        </ToolbarContent>
      </Toolbar>
    </div>
  </ResizableExample>
);
