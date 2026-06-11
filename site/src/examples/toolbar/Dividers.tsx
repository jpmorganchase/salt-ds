import {
  Button,
  Divider,
  Dropdown,
  Option,
  Text,
  Toolbar,
  ToolbarContent,
  Tooltray,
} from "@salt-ds/core";
import type { ReactElement } from "react";
import { ResizableExample } from "../components/ResizableExample";
import styles from "./index.module.css";

const paymentOptions = ["Cash", "Card", "Wire transfer"];
const typeOptions = ["Type", "Date", "Status"];

export const Dividers = (): ReactElement => {
  return (
    <ResizableExample minWidth={30}>
      <div className={styles.example}>
        <Toolbar aria-label="Payment toolbar with divider">
          <ToolbarContent position="start">
            <Tooltray overflowPriority={1}>
              <Text styleAs="label">Payment</Text>
              <Dropdown
                aria-label="Payment"
                bordered
                defaultSelected={[paymentOptions[0]]}
                style={{ width: 100 }}
              >
                {paymentOptions.map((option) => (
                  <Option key={option} value={option}>
                    {option}
                  </Option>
                ))}
              </Dropdown>
            </Tooltray>
          </ToolbarContent>
          <ToolbarContent position="end">
            <Tooltray overflowPriority={2}>
              <Text styleAs="label">Sort</Text>
              <Dropdown
                aria-label="Sort"
                bordered
                defaultSelected={[typeOptions[0]]}
                style={{ width: 120 }}
              >
                {typeOptions.map((option) => (
                  <Option key={option} value={option}>
                    {option}
                  </Option>
                ))}
              </Dropdown>
            </Tooltray>
            <Divider orientation="vertical" variant="secondary" />
            <Tooltray overflowPriority={3}>
              <Button appearance="bordered">Reject</Button>
              <Button appearance="solid">Publish</Button>
            </Tooltray>
          </ToolbarContent>
        </Toolbar>
      </div>
    </ResizableExample>
  );
};
