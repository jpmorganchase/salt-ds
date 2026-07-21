import { Button, Dropdown, Option, Toolbar, Tooltray } from "@salt-ds/core";
import { FilterIcon, NotificationIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";
import { ResizableExample } from "../components/ResizableExample";
import { sortOptions } from "./toolbarExampleData";

const recordOptions = ["Record: Daily", "Record: Weekly", "Record: Monthly"];
const dateOptions = ["Date: January 2020", "Date: February 2020"];

export const NamedOverflows = (): ReactElement => (
  <ResizableExample>
    <Toolbar aria-label="Offer toolbar">
      <Tooltray overflowPriority={1}>
        <Dropdown
          bordered
          defaultSelected={[recordOptions[0]]}
          style={{ width: 180 }}
        >
          {recordOptions.map((option) => (
            <Option key={option} value={option} />
          ))}
        </Dropdown>
      </Tooltray>
      <Tooltray
        overflowGroup="Filters"
        overflowLabel="Filters"
        overflowMode="grouped"
        overflowPriority={6}
      >
        <Dropdown
          aria-label="Date filter"
          bordered
          defaultSelected={[dateOptions[0]]}
          startAdornment={<FilterIcon aria-hidden />}
          style={{ width: 180 }}
        >
          {dateOptions.map((option) => (
            <Option key={option} value={option} />
          ))}
        </Dropdown>
      </Tooltray>
      <Tooltray align="end" overflowPriority={2}>
        <Dropdown
          bordered
          defaultSelected={[sortOptions[0]]}
          style={{ width: 180 }}
        >
          {sortOptions.map((option) => (
            <Option key={option} value={option} />
          ))}
        </Dropdown>
      </Tooltray>
      <Tooltray
        align="end"
        overflowGroup="Actions"
        overflowLabel="Actions"
        overflowMode="grouped"
        overflowPriority={5}
      >
        <Button appearance="solid">
          <NotificationIcon aria-hidden />
          Propose amendment
        </Button>
        <Button appearance="bordered">Decline offer</Button>
      </Tooltray>
    </Toolbar>
  </ResizableExample>
);
