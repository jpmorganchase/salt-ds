import { Dropdown, Option } from "@salt-ds/core";
import {
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleGridPanel,
  DatePickerSingleInput,
  DatePickerTrigger,
} from "@salt-ds/date-components";
import { ToolbarNext, TooltrayNext } from "@salt-ds/lab";
import type { ReactElement } from "react";
import { ResizableExample } from "../components/ResizableExample";
import { sortOptions, typeOptions } from "./toolbarExampleData";

export const IndependentCollapse = (): ReactElement => (
  <ResizableExample minWidth={25}>
    <ToolbarNext aria-label="Payment toolbar">
      <TooltrayNext overflowPriority={1}>
        <Dropdown
          bordered
          defaultSelected={[typeOptions[1]]}
          style={{ width: 125 }}
        >
          {typeOptions.map((option) => (
            <Option key={option} value={option} />
          ))}
        </Dropdown>
      </TooltrayNext>
      <TooltrayNext align="end" overflowPriority={5}>
        <Dropdown
          bordered
          defaultSelected={[sortOptions[1]]}
          style={{ width: 180 }}
        >
          {sortOptions.map((option) => (
            <Option key={option} value={option} />
          ))}
        </Dropdown>
      </TooltrayNext>
      <TooltrayNext align="end" overflowPriority={4}>
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
      </TooltrayNext>
    </ToolbarNext>
  </ResizableExample>
);
