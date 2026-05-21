import { Button, Divider, Dropdown, Option, Text } from "@salt-ds/core";
import {
  ToolbarNext as Toolbar,
  ToolbarContent,
  TooltrayNext as Tooltray,
} from "@salt-ds/lab";
import type { ReactElement } from "react";
import styles from "./index.module.css";

const paymentOptions = ["Cash", "Card", "Wire transfer"];
const typeOptions = ["Type", "Date", "Status"];

export const Dividers = (): ReactElement => {
  return (
    <div className={styles.example}>
      <Toolbar aria-label="Payment toolbar with divider">
        <ToolbarContent position="start">
          <Tooltray overflowMode="none">
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
          <Tooltray overflowMode="none">
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
          <Tooltray
            overflowMode="none"
            role="group"
            aria-label="Payment actions"
          >
            <Button appearance="bordered">Reject</Button>
            <Button appearance="solid">Publish</Button>
          </Tooltray>
        </ToolbarContent>
      </Toolbar>
      <Toolbar aria-label="Payment toolbar with spacing">
        <ToolbarContent position="start">
          <Tooltray overflowMode="none">
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
          <Tooltray overflowMode="none">
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
          <Tooltray
            overflowMode="none"
            role="group"
            aria-label="Payment actions"
            style={{ marginInlineStart: "var(--salt-spacing-300)" }}
          >
            <Button appearance="bordered">Reject</Button>
            <Button appearance="solid">Publish</Button>
          </Tooltray>
        </ToolbarContent>
      </Toolbar>
    </div>
  );
};
