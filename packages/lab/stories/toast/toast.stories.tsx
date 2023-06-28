import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Toast } from "@salt-ds/lab";

export default {
  title: "Lab/Toast",
  component: Toast,
} as ComponentMeta<typeof Toast>;

const Template: ComponentStory<typeof Toast> = ({ children, ...args }) => {
  return <Toast {...args}>{children}</Toast>;
};

export const DefaultInfo = Template.bind({});
DefaultInfo.args = {
  status: "info",
  children: <div>LEI Updated</div>,
};

export const Warning = Template.bind({});
Warning.args = {
  status: "warning",
  children: <div>Pre-Trade Transparency</div>,
};

export const Error = Template.bind({});
Error.args = {
  status: "error",
  children: <div>CIT Check Failed System Error - Bypass Check</div>,
};

export const Success = Template.bind({});
Success.args = {
  status: "success",
  children: <div>Clear Transact</div>,
};

export const SecondaryInfo = () => (
  <DefaultInfo variant="secondary">
    <div>LEI Updated</div>
  </DefaultInfo>
);
export const SecondaryWarning = () => (
  <Warning variant="secondary" status="warning">
    <div>Pre-Trade Transparency</div>
  </Warning>
);
export const SecondaryError = () => (
  <Error variant="secondary" status="error">
    <div>CIT Check Failed System Error - Bypass Check</div>
  </Error>
);
export const SecondarySuccess = () => (
  <Success variant="secondary" status="success">
    <div>Clear Transact</div>
  </Success>
);
