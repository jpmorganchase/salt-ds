import { FlowLayout, Input } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Validation = (): ReactElement => (
  <FlowLayout style={{ maxWidth: "256px" }}>
    <Input defaultValue="Error value" validationStatus="error" />
    <Input bordered defaultValue="Error value" validationStatus="error" />
    <Input defaultValue="Warning value" validationStatus="warning" />
    <Input bordered defaultValue="Warning value" validationStatus="warning" />
    <Input defaultValue="Success value" validationStatus="success" />
    <Input bordered defaultValue="Success value" validationStatus="success" />
  </FlowLayout>
);
