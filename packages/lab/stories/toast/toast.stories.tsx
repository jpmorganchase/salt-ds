import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Toast } from "@salt-ds/lab";
import { BannerContent } from "@salt-ds/core";

export default {
    title: "Lab/Toast",
    component: Toast,
} as ComponentMeta<typeof Toast>;

const Template: ComponentStory<typeof Toast> = (args) => {
    return <Toast {...args}>
        <BannerContent>
            <div>
                <div>Info title</div>
                <div>LEI Updated</div>
            </div>
        </BannerContent>
    </Toast>
};

export const Default = Template.bind({});
