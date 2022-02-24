import { useRef, useState } from "react";
import { Button, ToolkitProvider } from "@brandname/core";
import { Popper } from "@brandname/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Lab/Popper",
  component: Popper,
} as ComponentMeta<typeof Popper>;

export const FeaturePopper: ComponentStory<typeof Popper> = (props) => {
  const [open, setOpen] = useState(false);
  const anchorEl = useRef(null);

  return (
    <>
      <Button ref={anchorEl} onClick={() => setOpen(!open)}>
        Toggle Popper
      </Button>
      <Popper anchorEl={anchorEl.current} open={open} {...props}>
        <div>The content of the popper.</div>
      </Popper>
    </>
  );
};

export const TopPlacement: ComponentStory<typeof Popper> = (props) => {
  const [open, setOpen] = useState(false);
  const anchorEl = useRef(null);

  return (
    <>
      <Button ref={anchorEl} onClick={() => setOpen(!open)}>
        Toggle Popper
      </Button>
      <Popper
        anchorEl={anchorEl.current}
        open={open}
        placement="top"
        {...props}
      >
        <div>The content of the popper.</div>
      </Popper>
    </>
  );
};

export const TouchDensity: ComponentStory<typeof Popper> = (props) => {
  const [open, setOpen] = useState(false);
  const anchorEl = useRef(null);

  return (
    <ToolkitProvider density="touch">
      <Button ref={anchorEl} onClick={() => setOpen(!open)}>
        Toggle Popper
      </Button>
      <Popper anchorEl={anchorEl.current} open={open} {...props}>
        <div>The content of the popper.</div>
      </Popper>
    </ToolkitProvider>
  );
};

export const LowDensity: ComponentStory<typeof Popper> = (props) => {
  const [open, setOpen] = useState(false);
  const anchorEl = useRef(null);

  return (
    <ToolkitProvider density="low">
      <Button ref={anchorEl} onClick={() => setOpen(!open)}>
        Toggle Popper
      </Button>
      <Popper anchorEl={anchorEl.current} open={open} {...props}>
        <div>The content of the popper.</div>
      </Popper>
    </ToolkitProvider>
  );
};

export const HighDensity: ComponentStory<typeof Popper> = (props) => {
  const [open, setOpen] = useState(false);
  const anchorEl = useRef(null);

  return (
    <ToolkitProvider density="high">
      <Button ref={anchorEl} onClick={() => setOpen(!open)}>
        Toggle Popper
      </Button>
      <Popper anchorEl={anchorEl.current} open={open} {...props}>
        <div>The content of the popper.</div>
      </Popper>
    </ToolkitProvider>
  );
};

export const DynamicHeightAnchor: ComponentStory<typeof Popper> = (props) => {
  const [open, setOpen] = useState(false);
  const anchorEl = useRef(null);
  const [height, setHeight] = useState(28);
  return (
    <div>
      <Button style={{ height }} ref={anchorEl} onClick={() => setOpen(!open)}>
        Toggle Popper
      </Button>
      <Popper anchorEl={anchorEl.current} open={open} {...props}>
        <div>The content of the popper.</div>
        <ToolkitProvider density="high">
          <Button
            onClick={() => {
              setHeight((old) => old + 28);
            }}
          >
            Increase Height
          </Button>
        </ToolkitProvider>
      </Popper>
    </div>
  );
};
