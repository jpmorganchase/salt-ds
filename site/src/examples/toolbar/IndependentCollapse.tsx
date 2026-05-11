import { Dropdown, Option } from "@salt-ds/core";
import { DateInputSingle } from "@salt-ds/date-components";
import { ToolbarNext as Toolbar, TooltrayNext as Tooltray } from "@salt-ds/lab";
import type { ReactElement } from "react";
import styles from "./index.module.css";
import { sortOptions, typeOptions } from "./toolbarExampleData";

export const IndependentCollapse = (): ReactElement => (
  <div className={styles.narrow}>
    <Toolbar aria-label="Payment toolbar" variant="secondary">
      <Tooltray overflowMode="none">
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
      <Tooltray align="end" overflowPriority={5}>
        <Dropdown
          bordered
          defaultSelected={[sortOptions[1]]}
          style={{ width: 180 }}
        >
          {sortOptions.map((option) => (
            <Option key={option} value={option} />
          ))}
        </Dropdown>
      </Tooltray>
      <Tooltray align="end" overflowPriority={4}>
        <DateInputSingle
          bordered
          aria-label="Settlement date"
          style={{ width: 180 }}
        />
      </Tooltray>
    </Toolbar>
  </div>
);
