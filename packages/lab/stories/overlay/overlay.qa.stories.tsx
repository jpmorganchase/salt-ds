import { Button } from "@salt-ds/core";
import {
  Overlay,
  OverlayPanel,
  OverlayTrigger,
  OverlayProps,
} from "@salt-ds/lab";
import { StoryFn, Meta } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";

import "./overlay.stories.css";

export default {
  title: "Lab/Overlay/Overlay QA",
  component: Overlay,
} as Meta<typeof Overlay>;

const OverlayTemplate = ({ id, placement }: OverlayProps) => {
  return (
    <Overlay id={id} placement={placement} open>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel>
        <>
          <h3 id={`${id}-header`} className="content-heading">
            Title
          </h3>
          <div id={`${id}-content`}>Content of Overlay</div>
        </>
      </OverlayPanel>
    </Overlay>
  );
};

export const Default: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer
      height={800}
      cols={5}
      itemPadding={50}
      itemWidthAuto
      width={1200}
      {...props}
    >
      <OverlayTemplate />
    </QAContainer>
  );
};

Default.parameters = {
  chromatic: { disableSnapshot: false },
};
