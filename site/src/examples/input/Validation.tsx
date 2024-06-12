import { ReactElement } from "react";
import { FlowLayout, Input } from "@salt-ds/core";

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
