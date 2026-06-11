import {
  Button,
  Dropdown,
  Option,
  Toolbar,
  ToolbarContent,
  Tooltray,
} from "@salt-ds/core";
import { AddIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";
import { ResizableExample } from "../components/ResizableExample";
import { accountOptions, typeOptions } from "./toolbarExampleData";

export const GroupedCollapse = (): ReactElement => (
  <ResizableExample>
    <Toolbar aria-label="Account toolbar">
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
        </Tooltray>
        <Tooltray
          overflowGroup="Account"
          overflowLabel="Select account"
          overflowMode="grouped"
          overflowPriority={5}
        >
          <Button appearance="transparent" aria-label="Add account">
            <AddIcon aria-hidden />
          </Button>
        </Tooltray>
      </ToolbarContent>
    </Toolbar>
  </ResizableExample>
);
