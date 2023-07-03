import { useState, MouseEvent } from "react";
import { ContentStatus, ContentStatusProps } from "@salt-ds/lab";
import {
  Button,
  FlowLayout,
  StackLayout,
  FlexItem,
  FlexLayout,
} from "@salt-ds/core";
import { FormField, Input, Drawer, DRAWER_POSITIONS } from "@salt-ds/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import "./drawer.stories.css";

export default {
  title: "Lab/Drawer",
  component: Drawer,
  argTypes: {
    position: {
      options: DRAWER_POSITIONS,
      control: { type: "select" },
    },
  },
  args: {
    disableScrim: false,
    disableAnimations: false,
    fullScreenAtBreakpoint: "sm",
  },
} as ComponentMeta<typeof Drawer>;

type DrawerContentExampleProps = {
  onClick: (evt: MouseEvent) => void;
};

const DrawerContentExample = ({ onClick }: DrawerContentExampleProps) => (
  <StackLayout className="drawer-example">
    <FlexItem grow={1}>
      <h2 id="drawer_label">Lorem ipsum</h2>
      <p id="drawer_description">
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
      <Button onClick={onClick}>Close Drawer</Button>
    </FlowLayout>
  </StackLayout>
);

const DefaultDrawerStory: ComponentStory<typeof Drawer> = (args) => {
  const [open, setOpen] = useState(false);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <div className="drawer-container">
      <Button onClick={show}>Open Drawer</Button>
      <Drawer
        isOpen={open}
        aria-labelledby="drawer_label"
        aria-describedby="drawer_description"
        {...args}
      >
        <DrawerContentExample onClick={hide} />
      </Drawer>
    </div>
  );
};

export const Default = DefaultDrawerStory.bind({});
Default.args = {
  position: "center",
};

const TopTemplate: ComponentStory<typeof Drawer> = (args) => {
  const [open, setOpen] = useState(false);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <div className="drawer-container">
      <Button onClick={show}>Open Drawer</Button>
      <Drawer isOpen={open} {...args}>
        <DrawerContentExample onClick={hide} />
      </Drawer>
    </div>
  );
};

export const Top = TopTemplate.bind({});
Top.args = {
  position: "top",
};

const RightTemplate: ComponentStory<typeof Drawer> = (args) => {
  const [open, setOpen] = useState(false);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <div className="drawer-container">
      <Button onClick={show}>Open Drawer</Button>
      <Drawer isOpen={open} {...args}>
        <DrawerContentExample onClick={hide} />
      </Drawer>
    </div>
  );
};

export const Right = RightTemplate.bind({});
Right.args = {
  position: "right",
};

const LeftTemplate: ComponentStory<typeof Drawer> = (args) => {
  const [open, setOpen] = useState(false);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <div className="drawer-container">
      <Button onClick={show}>Open Drawer</Button>
      <Drawer isOpen={open} {...args}>
        <DrawerContentExample onClick={hide} />
      </Drawer>
    </div>
  );
};

export const Left = LeftTemplate.bind({});
Left.args = {
  position: "left",
};

const BottomTemplate: ComponentStory<typeof Drawer> = (args) => {
  const [open, setOpen] = useState(false);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <div className="drawer-container">
      <Button onClick={show}>Open Drawer</Button>
      <Drawer isOpen={open} {...args}>
        <DrawerContentExample onClick={hide} />
      </Drawer>
    </div>
  );
};

export const Bottom = BottomTemplate.bind({});
Bottom.args = {
  position: "bottom",
};

const CustomFullScreenAnimationTemplate: ComponentStory<typeof Drawer> = (
  args
) => {
  const [open, setOpen] = useState(false);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <div className="custom-drawer-container">
      <Button onClick={show}>Open Drawer</Button>
      <Drawer isOpen={open} className="custom-animation" {...args}>
        <StackLayout className="drawer-example">
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
            <Button onClick={hide}>Close Drawer</Button>
          </FlowLayout>
        </StackLayout>
      </Drawer>
    </div>
  );
};

export const CustomFullScreenAnimation = CustomFullScreenAnimationTemplate.bind(
  {}
);

CustomFullScreenAnimation.args = {
  position: "bottom",
};

CustomFullScreenAnimation.parameters = {
  viewport: {
    defaultViewport: "mobile1",
  },
};

const ReducedMotionTemplate: ComponentStory<typeof Drawer> = (args) => {
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
      <div className="drawer-container reduced-motion">
        <Button onClick={show}>Open Drawer</Button>
        <Drawer isOpen={open} {...args}>
          <DrawerContentExample onClick={hide} />
        </Drawer>
      </div>
    </>
  );
};

export const ReducedMotion = ReducedMotionTemplate.bind({});

const DrawerCenterExample: ComponentStory<typeof Drawer> = (args) => {
  const [open, setOpen] = useState(true);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  const errorProps: ContentStatusProps = {
    status: "error",
    title: "There's been a system error",
    message: "It should be temporary, so please try again.",
    actionLabel: "Close Drawer",
    onActionClick: hide,
  };

  return (
    <>
      <Button onClick={show}>Open Drawer</Button>
      <Drawer
        isOpen={open}
        className="drawer-simple-usage-center"
        scrimProps={{ role: "alertdialog" }}
        {...args}
      >
        <FlowLayout justify="center">
          <ContentStatus {...errorProps} />
        </FlowLayout>
      </Drawer>
    </>
  );
};

export const CenterSimpleUsage = DrawerCenterExample.bind({});
CenterSimpleUsage.args = {
  position: "center",
};

const FormFieldExample = () => (
  <FormField label="Label" helperText="Help text appears here">
    <Input />
  </FormField>
);

const DrawerLeftExample: ComponentStory<typeof Drawer> = (args) => {
  const [open, setOpen] = useState(true);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <div className="drawer-container drawer-simple-usage">
      <Button onClick={show}>Open Drawer</Button>
      <Drawer
        isOpen={open}
        aria-labelledby="drawer_label"
        aria-describedby="drawer_description"
        {...args}
      >
        <StackLayout>
          <h2 id="drawer_label">Section title</h2>
          <p id="drawer_description">
            Incididunt adipisicing deserunt nostrud ullamco consequat
            consectetur magna id do irure labore fugiat. Eiusmod pariatur
            officia elit ad. Ullamco adipisicing Lorem amet velit in do
            reprehenderit nostrud eu aute voluptate quis quis.
          </p>
          {Array.from({ length: 7 }, (_, index) => (
            <FormFieldExample key={index} />
          ))}
          <FlexItem align="end">
            <Button onClick={hide}>Close Drawer</Button>
          </FlexItem>
        </StackLayout>
      </Drawer>
    </div>
  );
};

export const LeftSimpleUsage = DrawerLeftExample.bind({});
LeftSimpleUsage.args = {
  position: "left",
};

const DrawerTopExample: ComponentStory<typeof Drawer> = (args) => {
  const [open, setOpen] = useState(true);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <div className="drawer-container drawer-simple-usage">
      <Button onClick={show}>Open Drawer</Button>
      <Drawer isOpen={open} {...args}>
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
            <Button onClick={hide}>Close Drawer</Button>
          </FlexItem>
        </StackLayout>
      </Drawer>
    </div>
  );
};

export const TopSimpleUsage = DrawerTopExample.bind({});
TopSimpleUsage.args = {
  position: "top",
};

const DrawerRightExample: ComponentStory<typeof Drawer> = (args) => {
  const [open, setOpen] = useState(true);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <div className="drawer-container drawer-simple-usage">
      <Button onClick={show}>Open Drawer</Button>
      <Drawer
        isOpen={open}
        aria-labelledby="drawer_label"
        aria-describedby="drawer_description"
        {...args}
      >
        <StackLayout>
          <h2 id="drawer_label">Section title</h2>
          <p id="drawer_description">
            Incididunt adipisicing deserunt nostrud ullamco consequat
            consectetur magna id do irure labore fugiat. Eiusmod pariatur
            officia elit ad. Ullamco adipisicing Lorem amet velit in do
            reprehenderit nostrud eu aute voluptate quis quis.
          </p>
          {Array.from({ length: 7 }, (_, index) => (
            <FormFieldExample key={index} />
          ))}
          <FlexItem align="end">
            <Button onClick={hide}>Close Drawer</Button>
          </FlexItem>
        </StackLayout>
      </Drawer>
    </div>
  );
};

export const RightSimpleUsage = DrawerRightExample.bind({});
RightSimpleUsage.args = {
  position: "right",
};

const ArticleExample = () => (
  <StackLayout className="drawer-article-container">
    <div className="drawer-article-image"></div>
    <h3>Laborum in sit officia consecte</h3>
    <p>
      Do excepteur id ipsum qui dolor irure dolore commodo labore. Minim sunt
      aliquip eiusmod excepteur qui sunt commodo ex cillum ullamco. Quis magna
      deserunt reprehenderit anim elit laboris laboris fugiat Lorem est culpa
      quis.
    </p>
  </StackLayout>
);

const DrawerBottomExample: ComponentStory<typeof Drawer> = (args) => {
  const [open, setOpen] = useState(true);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <div className="drawer-container drawer-simple-usage">
      <Button onClick={show}>Open Drawer</Button>
      <Drawer isOpen={open} aria-labelledby="drawer_label" {...args}>
        <StackLayout>
          <h2 id="drawer_label" tabIndex={-1}>
            Section title
          </h2>
          <FlowLayout>
            {Array.from({ length: 4 }, (_, index) => (
              <ArticleExample key={index} />
            ))}
          </FlowLayout>
          <FlexItem align="end">
            <Button onClick={hide}>Close Drawer</Button>
          </FlexItem>
        </StackLayout>
      </Drawer>
    </div>
  );
};

export const BottomSimpleUsage = DrawerBottomExample.bind({});
BottomSimpleUsage.args = {
  position: "bottom",
};
