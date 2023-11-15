import { Button, Tooltip } from "@salt-ds/core";
import { CheckboxGroupExample } from "@salt-ds/core/stories/checkbox/checkbox.qa.stories";
import { Overlay } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";

import "./overlay.stories.css";

export default {
  title: "Lab/Overlay",
  component: Overlay,
} as Meta<typeof Overlay>;

const OverlayTemplate: StoryFn<typeof Overlay> = (props) => {
  const OverlayContent = () => (
    <>
      <h3 className="content-heading">Title</h3>
      <div className="content-body">Content of Overlay</div>
      {/* <CheckboxGroupExample /> */}
      <br />
      <Tooltip content={"im a tooltip"}>
        <Button>button w/ tooltip</Button>
      </Tooltip>
    </>
  );

  return (
    <Overlay {...props} content={<OverlayContent />}>
      <Button>open overlay</Button>
    </Overlay>
  );
};

export const OverlayTop = OverlayTemplate.bind({});
OverlayTop.args = {
  placement: "top",
};

export const OverlayRight = OverlayTemplate.bind({});
OverlayRight.args = {
  placement: "right",
};

export const OverlayBottom = OverlayTemplate.bind({});
OverlayBottom.args = {
  placement: "bottom",
};

export const OverlayLeft = OverlayTemplate.bind({});
OverlayLeft.args = {
  placement: "left",
};
