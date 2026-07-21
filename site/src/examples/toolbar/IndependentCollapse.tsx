import { Dropdown, Option, Toolbar, Tooltray } from "@salt-ds/core";
import {
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleGridPanel,
  DatePickerSingleInput,
  DatePickerTrigger,
} from "@salt-ds/date-components";
import type { ReactElement } from "react";
import { ResizableExample } from "../components/ResizableExample";
import { sortOptions, typeOptions } from "./toolbarExampleData";

export const IndependentCollapse = (): ReactElement => (
  <ResizableExample minWidth={25}>
    <Toolbar aria-label="Payment toolbar">
      <Tooltray overflowPriority={1}>
        <Dropdown
          bordered
          defaultSelected={[typeOptions[1]]}
          style={{ width: 125 }}
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
        <DatePicker selectionVariant="single">
          <DatePickerTrigger>
            <DatePickerSingleInput
              bordered
              aria-label="Settlement date"
              style={{ width: 180 }}
            />
          </DatePickerTrigger>
          <DatePickerOverlay>
            <DatePickerSingleGridPanel />
          </DatePickerOverlay>
        </DatePicker>
      </Tooltray>
    </Toolbar>
  </ResizableExample>
);
