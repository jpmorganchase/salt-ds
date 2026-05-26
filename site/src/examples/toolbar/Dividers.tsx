import { Button, Divider, Dropdown, Option, Text } from "@salt-ds/core";
import {
  ToolbarContentNext,
  ToolbarNext,
  TooltrayNext,
} from "@salt-ds/lab";
import type { ReactElement } from "react";
import styles from "./index.module.css";

const paymentOptions = ["Cash", "Card", "Wire transfer"];
const typeOptions = ["Type", "Date", "Status"];

export const Dividers = (): ReactElement => {
  return (
    <div className={styles.example}>
      <ToolbarNext aria-label="Payment toolbar with divider">
        <ToolbarContentNext position="start">
          <TooltrayNext overflowPriority={1}>
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
          </TooltrayNext>
        </ToolbarContentNext>
        <ToolbarContentNext position="end">
          <TooltrayNext overflowPriority={2}>
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
          </TooltrayNext>
          <Divider orientation="vertical" variant="secondary" />
          <TooltrayNext
            overflowPriority={3}
            role="group"
            aria-label="Payment actions"
          >
            <Button appearance="bordered">Reject</Button>
            <Button appearance="solid">Publish</Button>
          </TooltrayNext>
        </ToolbarContentNext>
      </ToolbarNext>
      <ToolbarNext aria-label="Payment toolbar with spacing">
        <ToolbarContentNext position="start">
          <TooltrayNext overflowPriority={1}>
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
          </TooltrayNext>
        </ToolbarContentNext>
        <ToolbarContentNext
          position="end"
          style={{ gap: "var(--salt-spacing-300)" }}
        >
          <TooltrayNext overflowPriority={2}>
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
          </TooltrayNext>
          <TooltrayNext
            overflowPriority={3}
            role="group"
            aria-label="Payment actions"
          >
            <Button appearance="bordered">Reject</Button>
            <Button appearance="solid">Publish</Button>
          </TooltrayNext>
        </ToolbarContentNext>
      </ToolbarNext>
    </div>
  );
};
