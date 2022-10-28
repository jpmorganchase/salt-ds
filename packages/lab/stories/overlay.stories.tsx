import { Button } from "@jpmorganchase/uitk-core";
import {
  Overlay,
  OverlayProps,
  useOverlay,
  UseOverlayProps,
} from "@jpmorganchase/uitk-lab";
import { ComponentMeta, Story } from "@storybook/react";

import "./overlay.stories.css";

export default {
  title: "Lab/Overlay",
  component: Overlay,
} as ComponentMeta<typeof Overlay>;

const OverlayTemplate: Story<OverlayProps & UseOverlayProps> = (props) => {
  const { placement, open, ...rest } = props;
  const { getTriggerProps, getOverlayProps } = useOverlay({ placement, open });

  return (
    <>
      <Button {...getTriggerProps<typeof Button>()}>Toggle Overlay</Button>

      <Overlay {...getOverlayProps(rest)}>
        <div>
          <h3 className="content-heading">Title</h3>
          <div className="content-body">Content of Overlay</div>
        </div>
      </Overlay>
    </>
  );
};

export const FeatureOverlay: Story<OverlayProps & UseOverlayProps> = (
  props
) => {
  const { placement, open, ...rest } = props;
  const { getTriggerProps, getOverlayProps } = useOverlay({ placement, open });

  return (
    <>
      <div {...getTriggerProps()}>Overlay Anchor</div>

      <Overlay {...getOverlayProps(rest)}>
        <div>
          <h3 className="content-heading">Title</h3>
          <div className="content-body">Content of Overlay</div>
        </div>
      </Overlay>
    </>
  );
};
FeatureOverlay.args = {
  placement: "top",
  open: true,
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
