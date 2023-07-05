import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Button } from "@salt-ds/core";
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

export const HideClose = Template.bind({});
HideClose.args = {
  children: <div>LEI Updated</div>,
  hideClose: true,
};

export const CustomContent = Template.bind({});
CustomContent.args = {
  children: (
    <div>
      <div>
        <strong>Lorem ipsum</strong>
      </div>
      <div>Lorem ipsum dolor sit amet consectetur adipiscing elit.</div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          width: "100%",
          gap: "var(--salt-spacing-100)",
          marginTop: "var(--salt-spacing-100)",
        }}
      >
        <Button>Dismiss</Button>
        <Button variant="cta">Yes</Button>
      </div>
    </div>
  ),
  hideClose: true,
};
