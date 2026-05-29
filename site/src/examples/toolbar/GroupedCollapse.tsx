import { Button, Dropdown, Option } from "@salt-ds/core";
import { AddIcon } from "@salt-ds/icons";
import { ToolbarContentNext, ToolbarNext, TooltrayNext } from "@salt-ds/lab";
import type { ReactElement } from "react";
import { ResizableExample } from "../components/ResizableExample";
import { accountOptions, typeOptions } from "./toolbarExampleData";

export const GroupedCollapse = (): ReactElement => (
  <ResizableExample>
    <ToolbarNext aria-label="Account toolbar">
      <ToolbarContentNext position="start">
        <TooltrayNext overflowPriority={1}>
          <Dropdown
            bordered
            defaultSelected={[typeOptions[1]]}
            style={{ width: 140 }}
          >
            {typeOptions.map((option) => (
              <Option key={option} value={option} />
            ))}
          </Dropdown>
        </TooltrayNext>
      </ToolbarContentNext>
      <ToolbarContentNext position="end">
        <TooltrayNext
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
        </TooltrayNext>
        <TooltrayNext
          overflowGroup="Account"
          overflowLabel="Select account"
          overflowMode="grouped"
          overflowPriority={5}
        >
          <Button appearance="transparent" aria-label="Add account">
            <AddIcon aria-hidden />
          </Button>
        </TooltrayNext>
      </ToolbarContentNext>
    </ToolbarNext>
  </ResizableExample>
);
