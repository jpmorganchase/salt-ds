import { Button, Dropdown, Option } from "@salt-ds/core";
import { FilterIcon, NotificationIcon } from "@salt-ds/icons";
import { ToolbarNext, TooltrayNext } from "@salt-ds/lab";
import type { ReactElement } from "react";
import styles from "./index.module.css";
import { sortOptions } from "./toolbarExampleData";

const recordOptions = ["Record: Daily", "Record: Weekly", "Record: Monthly"];
const dateOptions = ["Date: January 2020", "Date: February 2020"];

export const DynamicCollapse = (): ReactElement => (
  <div className={styles.dynamic}>
    <ToolbarNext aria-label="Offer toolbar">
      <TooltrayNext overflowPriority={1}>
        <Dropdown
          bordered
          defaultSelected={[recordOptions[0]]}
          style={{ width: 180 }}
        >
          {recordOptions.map((option) => (
            <Option key={option} value={option} />
          ))}
        </Dropdown>
      </TooltrayNext>
      <TooltrayNext
        overflowGroup="Filters"
        overflowLabel="Filters"
        overflowMode="grouped"
        overflowPriority={6}
        role="group"
        aria-label="Filters"
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
      </TooltrayNext>
      <TooltrayNext align="end" overflowPriority={2}>
        <Dropdown
          bordered
          defaultSelected={[sortOptions[0]]}
          style={{ width: 180 }}
        >
          {sortOptions.map((option) => (
            <Option key={option} value={option} />
          ))}
        </Dropdown>
      </TooltrayNext>
      <TooltrayNext
        align="end"
        overflowGroup="Actions"
        overflowLabel="Actions"
        overflowMode="grouped"
        overflowPriority={5}
        role="group"
        aria-label="Actions"
      >
        <Button appearance="solid">
          <NotificationIcon aria-hidden />
          Propose amendment
        </Button>
        <Button appearance="bordered">Decline offer</Button>
      </TooltrayNext>
    </ToolbarNext>
  </div>
);
