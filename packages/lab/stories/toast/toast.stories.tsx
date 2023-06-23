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
    children: (
        <>
            <div>Info title</div>
            <div>LEI Updated</div>
        </>
    ),
};

export const Warning = Template.bind({});
Warning.args = {
    status: "warning",
    children: (
        <>
            <div>Warning title</div>
            <div>Pre-Trade Transparency</div>

        </>
    ),
};

export const Error = Template.bind({});
Error.args = {
    status: "error",
    children: (
        <>
            <div>Error title</div>
            <div>CIT Check Failed System Error - Bypass Check</div>
        </>
    ),
};

export const Success = Template.bind({});
Success.args = {
    status: "success",
    children: (
        <>
            <div>Success title</div>
            <div>Clear Transact</div>
        </>
    ),
};
