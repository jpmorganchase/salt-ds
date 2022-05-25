import { useState, MouseEvent } from "react";
import { LayerLayout, LAYER_POSITION } from "@jpmorganchase/uitk-lab";
import {
  Button,
  FlowLayout,
  StackLayout,
  FlexItem,
} from "@jpmorganchase/uitk-core";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import "./styles.css";

export default {
  title: "Layout/LayerLayout",
  component: LayerLayout,
  argTypes: {
    position: {
      options: LAYER_POSITION,
      control: { type: "select" },
    },
  },
} as ComponentMeta<typeof LayerLayout>;

type LayerContentExampleProps = {
  onClick: (evt: MouseEvent) => void;
};

const LayerContentExample = ({ onClick }: LayerContentExampleProps) => (
  <StackLayout className="layer-example">
    <FlexItem grow={1}>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut nunc lacus,
        scelerisque ut elit nec, commodo blandit est. Duis mollis dui at nisl
        faucibus, id maximus urna pellentesque. Praesent consequat vulputate
        dolor, a mattis metus suscipit vitae. Donec ullamcorper, neque sit amet
        laoreet ornare, diam eros posuere metus, id consectetur tellus nisl id
        ipsum. Fusce sit amet cursus mauris, vel scelerisque enim. Quisque eu
        dolor tortor. Nulla facilisi. Vestibulum at neque sit amet neque
        facilisis porttitor a ac risus.
      </p>
      <p>
        Mauris consequat sollicitudin commodo. Vestibulum ac diam vulputate,
        condimentum purus non, eleifend erat. Nunc auctor iaculis mi eu
        hendrerit. Suspendisse potenti. Cras tristique vehicula iaculis. Morbi
        faucibus volutpat tellus, sit amet fringilla dui rhoncus a. Suspendisse
        nunc nulla, mattis sed commodo ac, cursus ut augue. Quisque libero
        magna, rutrum sit amet elementum eget, pulvinar vel metus. Nam id est id
        odio rutrum venenatis. Donec sodales est lacinia eros pharetra tempor.
        Phasellus sodales venenatis tellus, eget tempor ipsum efficitur
        imperdiet. Sed volutpat porta lorem a fermentum. Curabitur fringilla,
        justo in vestibulum egestas, lacus felis feugiat orci, a congue tortor
        lacus sed mi. Quisque quis ante finibus, posuere urna eget, finibus
        tellus.
      </p>
    </FlexItem>
    <FlowLayout justify="end">
      <Button variant="cta" onClick={onClick}>
        Close layer
      </Button>
    </FlowLayout>
  </StackLayout>
);

const DefaultLayerLayoutStory: ComponentStory<typeof LayerLayout> = (args) => {
  const [open, setOpen] = useState(false);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <div className="layer-container">
      <Button onClick={show}>Open Layer</Button>
      <LayerLayout open={open} {...args}>
        <LayerContentExample onClick={hide} />
      </LayerLayout>
    </div>
  );
};

export const DefaultLayerLayout = DefaultLayerLayoutStory.bind({});
DefaultLayerLayout.args = {
  displayScrim: true,
  position: "center",
  disableAnimations: false,
  fullScreenAtBreakpoint: "sm",
};

const Top: ComponentStory<typeof LayerLayout> = (args) => {
  const [open, setOpen] = useState(false);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <div className="layer-container">
      <Button onClick={show}>Open Layer</Button>
      <LayerLayout open={open} {...args}>
        <LayerContentExample onClick={hide} />
      </LayerLayout>
    </div>
  );
};

export const ToolkitLayerLayoutTop = Top.bind({});
ToolkitLayerLayoutTop.args = {
  displayScrim: true,
  position: "top",
  disableAnimations: false,
};

const Right: ComponentStory<typeof LayerLayout> = (args) => {
  const [open, setOpen] = useState(false);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <div className="layer-container">
      <Button onClick={show}>Open Layer</Button>
      <LayerLayout open={open} {...args}>
        <LayerContentExample onClick={hide} />
      </LayerLayout>
    </div>
  );
};

export const ToolkitLayerLayoutRight = Right.bind({});
ToolkitLayerLayoutRight.args = {
  displayScrim: true,
  position: "right",
  disableAnimations: false,
};

const Left: ComponentStory<typeof LayerLayout> = (args) => {
  const [open, setOpen] = useState(false);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <div className="layer-container">
      <Button onClick={show}>Open Layer</Button>
      <LayerLayout open={open} {...args}>
        <LayerContentExample onClick={hide} />
      </LayerLayout>
    </div>
  );
};

export const ToolkitLayerLayoutLeft = Left.bind({});
ToolkitLayerLayoutLeft.args = {
  displayScrim: true,
  position: "left",
  disableAnimations: false,
};

const Bottom: ComponentStory<typeof LayerLayout> = (args) => {
  const [open, setOpen] = useState(false);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <div className="layer-container">
      <Button onClick={show}>Open Layer</Button>
      <LayerLayout open={open} {...args}>
        <LayerContentExample onClick={hide} />
      </LayerLayout>
    </div>
  );
};

export const ToolkitLayerLayoutBottom = Bottom.bind({});
ToolkitLayerLayoutBottom.args = {
  displayScrim: true,
  position: "bottom",
  disableAnimations: false,
};
