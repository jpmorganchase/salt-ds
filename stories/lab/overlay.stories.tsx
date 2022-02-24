import { useState, useCallback } from "react";
import { Button } from "@brandname/core";
import { Overlay } from "@brandname/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";

import "./overlay.stories.css";

export default {
  title: "Lab/Overlay",
  component: Overlay,
} as ComponentMeta<typeof Overlay>;

const OverlayTemplate: ComponentStory<typeof Overlay> = (props) => {
  const [open, setOpen] = useState(false);

  const [node, setNode] = useState();
  const setRef = useCallback((node) => {
    if (node) {
      setNode(node);
    }
  }, []);

  const toggleOverlay = () => setOpen((o) => !o);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Button ref={setRef} onClick={toggleOverlay}>
        Toggle Overlay
      </Button>

      <Overlay anchorEl={node} open={open} onClose={handleClose} {...props}>
        <div>
          <h3 className="content-heading">Title</h3>
          <div className="content-body">Content of Overlay</div>
        </div>
      </Overlay>
    </>
  );
};

export const FeatureOverlay: ComponentStory<typeof Overlay> = (props) => {
  const [node, setNode] = useState();
  const setRef = useCallback((node) => {
    if (node) {
      setNode(node);
    }
  }, []);

  return (
    <>
      <div ref={setRef}>Overlay Anchor</div>

      <Overlay anchorEl={node} {...props}>
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

FeatureOverlay.argTypes = {
  placement: {
    options: ["top", "right", "bottom", "left"],
    control: {
      type: "inline-radio",
    },
  },
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
