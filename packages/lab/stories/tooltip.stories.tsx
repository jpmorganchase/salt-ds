import { Button } from "@brandname/core";
import { Tooltip } from "@brandname/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { useCallback } from "react";

export default {
  title: "Lab/Tooltip",
  component: Tooltip,
} as ComponentMeta<typeof Tooltip>;

const Template: ComponentStory<typeof Tooltip> = (props) => (
  <Tooltip {...props}>
    <Button>Hover</Button>
  </Tooltip>
);

export const Default = Template.bind({});
Default.args = {
  title: "I am a tooltip",
};

export const OpenTooltip = Template.bind({});
OpenTooltip.args = {
  title: "I am a tooltip",
  open: true,
};

export const ScrollTooltip: ComponentStory<typeof Tooltip> = (props) => {
  const handleScrollButton = useCallback((node) => {
    node?.scrollIntoView({ block: "center", inline: "center" });
  }, []);

  return (
    <div
      style={{
        maxHeight: "100%",
        height: "300vh",
        maxWidth: "100%",
        width: "300vw",
      }}
    >
      <Tooltip {...props}>
        <Button
          ref={handleScrollButton}
          style={{ marginTop: "100vh", marginLeft: "100vw" }}
        >
          Hover
        </Button>
      </Tooltip>
    </div>
  );
};
ScrollTooltip.args = {
  title: "I am a tooltip",
  open: true,
  placement: "top",
};

export const DefaultComposite: ComponentStory<typeof Tooltip> = () => {
  return (
    <span>
      <p>`Regular` Tooltips displayed on different sides:</p>

      <Tooltip placement="right" title="I am a tooltip">
        <Button>Hover</Button>
      </Tooltip>

      <Tooltip placement="top" title="I am a tooltip">
        <Button>Hover</Button>
      </Tooltip>

      <Tooltip placement="bottom" title="I am a tooltip">
        <Button>Hover</Button>
      </Tooltip>

      <Tooltip placement="left" title="I am a tooltip">
        <Button>Hover</Button>
      </Tooltip>

      <br />
      <p>`Error` Tooltips displayed on different sides:</p>
      <Tooltip state="error" title="We found an issue">
        <Button>Hover</Button>
      </Tooltip>

      <Tooltip placement="top" state="error" title="We found an issue">
        <Button>Hover</Button>
      </Tooltip>

      <Tooltip placement="bottom" state="error" title="We found an issue">
        <Button>Hover</Button>
      </Tooltip>

      <Tooltip placement="left" state="error" title="We found an issue">
        <Button>Hover</Button>
      </Tooltip>

      <br />
      <p>`Warning` Tooltips displayed on different sides:</p>

      <Tooltip state="warning" title="Are you sure?">
        <Button>Hover</Button>
      </Tooltip>

      <Tooltip placement="top" state="warning" title="Are you sure?">
        <Button>Hover</Button>
      </Tooltip>

      <Tooltip placement="bottom" state="warning" title="Are you sure?">
        <Button>Hover</Button>
      </Tooltip>

      <Tooltip placement="left" state="warning" title="Are you sure?">
        <Button>Hover</Button>
      </Tooltip>

      <br />
      <p>`Success` Tooltips displayed on different sides:</p>

      <Tooltip state="success" title="Well done">
        <Button>Hover</Button>
      </Tooltip>

      <Tooltip placement="top" state="success" title="Well done">
        <Button>Hover</Button>
      </Tooltip>

      <Tooltip placement="bottom" state="success" title="Well done">
        <Button>Hover</Button>
      </Tooltip>

      <Tooltip placement="left" state="success" title="Well done">
        <Button>Hover</Button>
      </Tooltip>

      <br />
      <p>Tooltips with titles displayed on different sides:</p>

      <Tooltip
        render={({ getTitleProps }) => (
          <div>
            <div {...getTitleProps()}>Hello, world</div>
            This is a custom tooltip
          </div>
        )}
      >
        <Button>Hover</Button>
      </Tooltip>
      <Tooltip
        placement="top"
        render={({ getTitleProps }) => (
          <div>
            <div {...getTitleProps()}>Hello, world</div>
            This is a custom tooltip
          </div>
        )}
      >
        <Button>Hover</Button>
      </Tooltip>
      <Tooltip
        placement="bottom"
        render={({ getTitleProps }) => (
          <div>
            <div {...getTitleProps()}>Hello, world</div>
            This is a custom tooltip
          </div>
        )}
      >
        <Button>Hover</Button>
      </Tooltip>
      <Tooltip
        placement="left"
        render={({ getTitleProps }) => (
          <div>
            <div {...getTitleProps()}>Hello, world</div>
            This is a custom tooltip
          </div>
        )}
      >
        <Button>Hover</Button>
      </Tooltip>

      <br />
      <p>Tooltips with titles &amp; states displayed on different sides:</p>

      <Tooltip
        render={({ getTitleProps, getIconProps, Icon }) => (
          <>
            <Icon {...getIconProps()} />
            <div>
              <div {...getTitleProps()}>Hello, world</div>
              This is a custom tooltip
            </div>
          </>
        )}
      >
        <Button>Hover</Button>
      </Tooltip>
      <Tooltip
        placement="top"
        render={({ getTitleProps, getIconProps, Icon }) => (
          <>
            <Icon {...getIconProps()} />
            <div>
              <div {...getTitleProps()}>Hello, world</div>
              This is a custom tooltip
            </div>
          </>
        )}
        state="error"
      >
        <Button>Hover</Button>
      </Tooltip>
      <Tooltip
        placement="bottom"
        render={({ getTitleProps, getIconProps, Icon }) => (
          <>
            <Icon {...getIconProps()} />
            <div>
              <div {...getTitleProps()}>Hello, world</div>
              This is a custom tooltip
            </div>
          </>
        )}
        state="success"
      >
        <Button>Hover</Button>
      </Tooltip>
      <Tooltip
        placement="left"
        render={({ getTitleProps, getIconProps, Icon }) => (
          <>
            <Icon {...getIconProps()} />
            <div>
              <div {...getTitleProps()}>Hello, world</div>
              This is a custom tooltip
            </div>
          </>
        )}
        state="warning"
      >
        <Button>Hover</Button>
      </Tooltip>
    </span>
  );
};
