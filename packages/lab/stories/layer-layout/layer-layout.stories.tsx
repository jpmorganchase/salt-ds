import {
  Button,
  FlexItem,
  FlexLayout,
  FlowLayout,
  StackLayout,
  StatusIndicator,
  Text,
} from "@salt-ds/core";
import { FormField, Input, LAYER_POSITIONS, LayerLayout } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { type MouseEvent, useState } from "react";
import "../layout/layout.stories.css";

export default {
  title: "Lab/Layout/Layer Layout",
  component: LayerLayout,
  argTypes: {
    position: {
      options: Array.from(LAYER_POSITIONS),
      control: { type: "select" },
    },
  },
  args: {
    disableScrim: false,
    disableAnimations: false,
    fullScreenAtBreakpoint: "sm",
  },
} as Meta<typeof LayerLayout>;

type LayerContentExampleProps = {
  onClick: (evt: MouseEvent) => void;
};

const LayerContentExample = ({ onClick }: LayerContentExampleProps) => (
  <StackLayout className="layer-example">
    <FlexItem grow={1}>
      <h2 id="layer_label">Lorem ipsum</h2>
      <p id="layer_description">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut nunc lacus,
        scelerisque ut elit nec, commodo blandit est. Duis mollis dui at nisl
        faucibus, id maximus urna pellentesque. Praesent consequat vulputate
        dolor, a mattis metus suscipit vitae. Donec ullamcorper, neque sit amet
        laoreet ornare, diam eros posuere metus, id consectetur tellus nisl id
        ipsum. Fusce sit amet cursus mauris, vel scelerisque enim. Quisque eu
        dolor tortor. Nulla facilisi. Vestibulum at neque sit amet neque
        facilisis porttitor a ac risus.Mauris consequat sollicitudin commodo.
        Vestibulum ac diam vulputate, condimentum purus non, eleifend erat. Nunc
        auctor iaculis mi eu hendrerit. Suspendisse potenti. Cras tristique
        vehicula iaculis. Morbi faucibus volutpat tellus, sit amet fringilla dui
        rhoncus a. Suspendisse nunc nulla, mattis sed commodo ac, cursus ut
        augue.
      </p>
    </FlexItem>
    <FlowLayout justify="end">
      <Button onClick={onClick}>Close layer</Button>
    </FlowLayout>
  </StackLayout>
);

const DefaultLayerLayoutStory: StoryFn<typeof LayerLayout> = (args) => {
  const [open, setOpen] = useState(false);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <div className="layer-container">
      <Button onClick={show}>Open Layer</Button>
      <LayerLayout
        isOpen={open}
        aria-labelledby="layer_label"
        aria-describedby="layer_description"
        {...args}
      >
        <LayerContentExample onClick={hide} />
      </LayerLayout>
    </div>
  );
};

export const Default = DefaultLayerLayoutStory.bind({});
Default.args = {
  position: "center",
};

const TopTemplate: StoryFn<typeof LayerLayout> = (args) => {
  const [open, setOpen] = useState(false);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <div className="layer-container">
      <Button onClick={show}>Open Layer</Button>
      <LayerLayout isOpen={open} {...args}>
        <LayerContentExample onClick={hide} />
      </LayerLayout>
    </div>
  );
};

export const Top = TopTemplate.bind({});
Top.args = {
  position: "top",
};

const RightTemplate: StoryFn<typeof LayerLayout> = (args) => {
  const [open, setOpen] = useState(false);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <div className="layer-container">
      <Button onClick={show}>Open Layer</Button>
      <LayerLayout isOpen={open} {...args}>
        <LayerContentExample onClick={hide} />
      </LayerLayout>
    </div>
  );
};

export const Right = RightTemplate.bind({});
Right.args = {
  position: "right",
};

const LeftTemplate: StoryFn<typeof LayerLayout> = (args) => {
  const [open, setOpen] = useState(false);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <div className="layer-container">
      <Button onClick={show}>Open Layer</Button>
      <LayerLayout isOpen={open} {...args}>
        <LayerContentExample onClick={hide} />
      </LayerLayout>
    </div>
  );
};

export const Left = LeftTemplate.bind({});
Left.args = {
  position: "left",
};

const BottomTemplate: StoryFn<typeof LayerLayout> = (args) => {
  const [open, setOpen] = useState(false);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <div className="layer-container">
      <Button onClick={show}>Open Layer</Button>
      <LayerLayout isOpen={open} {...args}>
        <LayerContentExample onClick={hide} />
      </LayerLayout>
    </div>
  );
};

export const Bottom = BottomTemplate.bind({});
Bottom.args = {
  position: "bottom",
};

const CustomFullScreenAnimationTemplate: StoryFn<typeof LayerLayout> = (
  args,
) => {
  const [open, setOpen] = useState(false);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <div className="custom-layer-container">
      <Button onClick={show}>Open Layer</Button>
      <LayerLayout isOpen={open} className="custom-animation" {...args}>
        <StackLayout className="layer-example">
          <FlexItem grow={1}>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut nunc
              lacus, scelerisque ut elit nec, commodo blandit est. Duis mollis
              dui at nisl faucibus, id maximus urna pellentesque. Praesent
              consequat vulputate dolor, a mattis metus suscipit vitae. Donec
              ullamcorper, neque sit amet laoreet ornare, diam eros posuere
              metus, id consectetur tellus nisl id ipsum. Fusce sit amet cursus
              mauris, vel scelerisque enim. Quisque eu dolor tortor. Nulla
              facilisi. Vestibulum at neque sit amet neque facilisis porttitor a
              ac risus.
            </p>
            <p>
              Mauris consequat sollicitudin commodo. Vestibulum ac diam
              vulputate, condimentum purus non, eleifend erat. Nunc auctor
              iaculis mi eu hendrerit. Suspendisse potenti. Cras tristique
              vehicula iaculis. Morbi faucibus volutpat tellus, sit amet
              fringilla dui rhoncus a. Suspendisse nunc nulla, mattis sed
              commodo ac, cursus ut augue.
            </p>
          </FlexItem>
          <FlowLayout justify="end">
            <Button onClick={hide}>Close layer</Button>
          </FlowLayout>
        </StackLayout>
      </LayerLayout>
    </div>
  );
};

export const CustomFullScreenAnimation = CustomFullScreenAnimationTemplate.bind(
  {},
);

CustomFullScreenAnimation.args = {
  position: "bottom",
};

CustomFullScreenAnimation.parameters = {
  viewport: {
    defaultViewport: "mobile1",
  },
};

const ReducedMotionTemplate: StoryFn<typeof LayerLayout> = (args) => {
  const [open, setOpen] = useState(false);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <>
      <p>In order to test this on MacOS, follow these steps: </p>
      <p>
        Go to System Preferences, select the Accessibility category, select the
        Display tab, and enable the Reduce Motion option.
      </p>
      <div className="layer-container reduced-motion">
        <Button onClick={show}>Open Layer</Button>
        <LayerLayout isOpen={open} {...args}>
          <LayerContentExample onClick={hide} />
        </LayerLayout>
      </div>
    </>
  );
};

export const ReducedMotion = ReducedMotionTemplate.bind({});

const LayerLayoutCenterExample: StoryFn<typeof LayerLayout> = (args) => {
  const [open, setOpen] = useState(true);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <>
      <Button onClick={show}>Open Layer</Button>
      <LayerLayout
        isOpen={open}
        className="layer-simple-usage-center"
        scrimProps={{ role: "alertdialog" }}
        {...args}
      >
        <FlowLayout justify="center">
          <StackLayout gap={1} align="center">
            <StatusIndicator status="error" size={2} />
            <Text>
              <strong>There's been a system error</strong>
            </Text>
            <Text>It should be temporary, so please try again.</Text>
            <Button
              style={{ marginTop: "var(--salt-spacing-100)" }}
              onClick={hide}
            >
              Close Layer
            </Button>
          </StackLayout>
        </FlowLayout>
      </LayerLayout>
    </>
  );
};

export const CenterSimpleUsage = LayerLayoutCenterExample.bind({});
CenterSimpleUsage.args = {
  position: "center",
};

const FormFieldExample = () => (
  <FormField label="Label" helperText="Help text appears here">
    <Input />
  </FormField>
);

const LayerLayoutLeftExample: StoryFn<typeof LayerLayout> = (args) => {
  const [open, setOpen] = useState(true);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <div className="layer-container layer-simple-usage">
      <Button onClick={show}>Open Layer</Button>
      <LayerLayout
        isOpen={open}
        aria-labelledby="layer_label"
        aria-describedby="layer_description"
        {...args}
      >
        <StackLayout>
          <h2 id="layer_label">Section title</h2>
          <p id="layer_description">
            Incididunt adipisicing deserunt nostrud ullamco consequat
            consectetur magna id do irure labore fugiat. Eiusmod pariatur
            officia elit ad. Ullamco adipisicing Lorem amet velit in do
            reprehenderit nostrud eu aute voluptate quis quis.
          </p>
          {Array.from({ length: 7 }, (_, index) => (
            <FormFieldExample key={index} />
          ))}
          <FlexItem align="end">
            <Button onClick={hide}>Close layer</Button>
          </FlexItem>
        </StackLayout>
      </LayerLayout>
    </div>
  );
};

export const LeftSimpleUsage = LayerLayoutLeftExample.bind({});
LeftSimpleUsage.args = {
  position: "left",
};

const LayerLayoutTopExample: StoryFn<typeof LayerLayout> = (args) => {
  const [open, setOpen] = useState(true);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <div className="layer-container layer-simple-usage">
      <Button onClick={show}>Open Layer</Button>
      <LayerLayout isOpen={open} {...args}>
        <StackLayout>
          <h2>Section title</h2>
          <p>
            Incididunt adipisicing deserunt nostrud ullamco consequat
            consectetur magna id do irure labore fugiat. Eiusmod pariatur
            officia elit ad. Ullamco adipisicing Lorem amet velit in do
            reprehenderit nostrud eu aute voluptate quis quis.
          </p>
          <FlexLayout>
            {Array.from({ length: 4 }, (_, index) => (
              <FormFieldExample key={index} />
            ))}
          </FlexLayout>
          <FlexItem align="end">
            <Button onClick={hide}>Close layer</Button>
          </FlexItem>
        </StackLayout>
      </LayerLayout>
    </div>
  );
};

export const TopSimpleUsage = LayerLayoutTopExample.bind({});
TopSimpleUsage.args = {
  position: "top",
};

const LayerLayoutRightExample: StoryFn<typeof LayerLayout> = (args) => {
  const [open, setOpen] = useState(true);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <div className="layer-container layer-simple-usage">
      <Button onClick={show}>Open Layer</Button>
      <LayerLayout
        isOpen={open}
        aria-labelledby="layer_label"
        aria-describedby="layer_description"
        {...args}
      >
        <StackLayout>
          <h2 id="layer_label">Section title</h2>
          <p id="layer_description">
            Incididunt adipisicing deserunt nostrud ullamco consequat
            consectetur magna id do irure labore fugiat. Eiusmod pariatur
            officia elit ad. Ullamco adipisicing Lorem amet velit in do
            reprehenderit nostrud eu aute voluptate quis quis.
          </p>
          {Array.from({ length: 7 }, (_, index) => (
            <FormFieldExample key={index} />
          ))}
          <FlexItem align="end">
            <Button onClick={hide}>Close layer</Button>
          </FlexItem>
        </StackLayout>
      </LayerLayout>
    </div>
  );
};

export const RightSimpleUsage = LayerLayoutRightExample.bind({});
RightSimpleUsage.args = {
  position: "right",
};

const ArticleExample = () => (
  <StackLayout className="layer-article-container">
    <div className="layer-article-image" />
    <h3>Laborum in sit officia consecte</h3>
    <p>
      Do excepteur id ipsum qui dolor irure dolore commodo labore. Minim sunt
      aliquip eiusmod excepteur qui sunt commodo ex cillum ullamco. Quis magna
      deserunt reprehenderit anim elit laboris laboris fugiat Lorem est culpa
      quis.
    </p>
  </StackLayout>
);

const LayerLayoutBottomExample: StoryFn<typeof LayerLayout> = (args) => {
  const [open, setOpen] = useState(true);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <div className="layer-container layer-simple-usage">
      <Button onClick={show}>Open Layer</Button>
      <LayerLayout isOpen={open} aria-labelledby="layer_label" {...args}>
        <StackLayout>
          <h2 id="layer_label" tabIndex={-1}>
            Section title
          </h2>
          <FlowLayout>
            {Array.from({ length: 4 }, (_, index) => (
              <ArticleExample key={index} />
            ))}
          </FlowLayout>
          <FlexItem align="end">
            <Button onClick={hide}>Close layer</Button>
          </FlexItem>
        </StackLayout>
      </LayerLayout>
    </div>
  );
};

export const BottomSimpleUsage = LayerLayoutBottomExample.bind({});
BottomSimpleUsage.args = {
  position: "bottom",
};
