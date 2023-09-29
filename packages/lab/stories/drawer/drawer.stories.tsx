import { useState, MouseEvent } from "react";
import {
  Button,
  FlowLayout,
  StackLayout,
  FlexItem,
  FlexLayout,
  FormField,
  FormFieldLabel,
  FormFieldHelperText,
  Input,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import { Drawer, useDrawer } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";
import "./drawer.stories.css";

export default {
  title: "Lab/Drawer",
  component: Drawer,
} as Meta<typeof Drawer>;

type DrawerContentExampleProps = {
  onClick: (evt: MouseEvent) => void;
};

const DrawerContentExample = ({ onClick }: DrawerContentExampleProps) => (
  <>
    <Button
      onClick={onClick}
      variant="secondary"
      className="drawer-close-button"
    >
      <CloseIcon />
    </Button>
    <h2 id="drawer_label">Lorem ipsum</h2>
    <p id="drawer_description">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut nunc lacus,
      scelerisque ut elit nec, commodo blandit est. Duis mollis dui at nisl
      faucibus, id maximus urna pellentesque. Praesent consequat vulputate
      dolor, a mattis metus suscipit vitae. Donec ullamcorper, neque sit amet
      laoreet ornare, diam eros posuere metus, id consectetur tellus nisl id
      ipsum. Fusce sit amet cursus mauris, vel scelerisque enim. Quisque eu
      dolor tortor. Nulla facilisi. Vestibulum at neque sit amet neque facilisis
      porttitor a ac risus.Mauris consequat sollicitudin commodo. Vestibulum ac
      diam vulputate, condimentum purus non, eleifend erat. Nunc auctor iaculis
      mi eu hendrerit. Suspendisse potenti. Cras tristique vehicula iaculis.
      Morbi faucibus volutpat tellus, sit amet fringilla dui rhoncus a.
      Suspendisse nunc nulla, mattis sed commodo ac, cursus ut augue.
    </p>
  </>
);

const DefaultDrawerStory: StoryFn<typeof Drawer> = (args) => {
  const [open, setOpen] = useState(false);

  const hide = () => setOpen(false);

  const { getReferenceProps, getFloatingProps } = useDrawer({
    open,
    onOpenChange: setOpen,
  });

  return (
    <>
      <Button {...getReferenceProps()}>Open Drawer</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        aria-labelledby="drawer_label"
        aria-describedby="drawer_description"
        {...getFloatingProps()}
        {...args}
      >
        <DrawerContentExample onClick={hide} />
      </Drawer>
    </>
  );
};

export const Default = DefaultDrawerStory.bind({});
Default.args = {
  position: "left",
};

const TopTemplate: StoryFn<typeof Drawer> = (args) => {
  const [open, setOpen] = useState(false);

  const hide = () => setOpen(false);

  const { getReferenceProps, getFloatingProps } = useDrawer({
    open,
    onOpenChange: setOpen,
  });

  return (
    <>
      <Button {...getReferenceProps()}>Open Drawer</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        {...getFloatingProps()}
        {...args}
      >
        <DrawerContentExample onClick={hide} />
      </Drawer>
    </>
  );
};

export const Top = TopTemplate.bind({});
Top.args = {
  position: "top",
};

const RightTemplate: StoryFn<typeof Drawer> = (args) => {
  const [open, setOpen] = useState(false);

  const hide = () => setOpen(false);

  const { getReferenceProps, getFloatingProps } = useDrawer({
    open,
    onOpenChange: setOpen,
  });

  return (
    <>
      <Button {...getReferenceProps()}>Open Drawer</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        {...getFloatingProps()}
        {...args}
      >
        <DrawerContentExample onClick={hide} />
      </Drawer>
    </>
  );
};

export const Right = RightTemplate.bind({});
Right.args = {
  position: "right",
};

const BottomTemplate: StoryFn<typeof Drawer> = (args) => {
  const [open, setOpen] = useState(false);

  const hide = () => setOpen(false);

  const { getReferenceProps, getFloatingProps } = useDrawer({
    open,
    onOpenChange: setOpen,
  });

  return (
    <>
      <Button {...getReferenceProps()}>Open Drawer</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        {...getFloatingProps()}
        {...args}
      >
        <DrawerContentExample onClick={hide} />
      </Drawer>
    </>
  );
};

export const Bottom = BottomTemplate.bind({});
Bottom.args = {
  position: "bottom",
};

const ReducedMotionTemplate: StoryFn<typeof Drawer> = (args) => {
  const [open, setOpen] = useState(false);

  const hide = () => setOpen(false);

  const { getReferenceProps, getFloatingProps } = useDrawer({
    open,
    onOpenChange: setOpen,
  });

  return (
    <>
      <p>In order to test this on MacOS, follow these steps: </p>
      <p>
        Go to System Preferences, select the Accessibility category, select the
        Display tab, and enable the Reduce Motion option.
      </p>
      <Button {...getReferenceProps()}>Open Drawer</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        className="reduced-motion"
        {...getFloatingProps()}
        {...args}
      >
        <DrawerContentExample onClick={hide} />
      </Drawer>
    </>
  );
};

export const ReducedMotion = ReducedMotionTemplate.bind({});

const FormFieldExample = () => (
  <FormField>
    <FormFieldLabel>Label</FormFieldLabel>
    <Input />
    <FormFieldHelperText>Help text appears here</FormFieldHelperText>
  </FormField>
);

const DrawerLeftExample: StoryFn<typeof Drawer> = (args) => {
  const [open, setOpen] = useState(true);

  const hide = () => setOpen(false);

  const { getReferenceProps, getFloatingProps } = useDrawer({
    open,
    onOpenChange: setOpen,
  });

  return (
    <>
      <Button {...getReferenceProps()}>Open Drawer</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        aria-labelledby="drawer_label"
        aria-describedby="drawer_description"
        {...getFloatingProps()}
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
    </>
  );
};

export const LeftSimpleUsage = DrawerLeftExample.bind({});
LeftSimpleUsage.args = {
  position: "left",
};

const DrawerTopExample: StoryFn<typeof Drawer> = (args) => {
  const [open, setOpen] = useState(true);

  const hide = () => setOpen(false);

  const { getReferenceProps, getFloatingProps } = useDrawer({
    open,
    onOpenChange: setOpen,
  });

  return (
    <>
      <Button {...getReferenceProps()}>Open Drawer</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        {...getFloatingProps()}
        {...args}
      >
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
    </>
  );
};

export const TopSimpleUsage = DrawerTopExample.bind({});
TopSimpleUsage.args = {
  position: "top",
};

const DrawerRightExample: StoryFn<typeof Drawer> = (args) => {
  const [open, setOpen] = useState(true);

  const hide = () => setOpen(false);

  const { getReferenceProps, getFloatingProps } = useDrawer({
    open,
    onOpenChange: setOpen,
  });

  return (
    <>
      <Button {...getReferenceProps()}>Open Drawer</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        aria-labelledby="drawer_label"
        aria-describedby="drawer_description"
        {...getFloatingProps()}
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
    </>
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

const DrawerBottomExample: StoryFn<typeof Drawer> = (args) => {
  const [open, setOpen] = useState(true);

  const hide = () => setOpen(false);

  const { getReferenceProps, getFloatingProps } = useDrawer({
    open,
    onOpenChange: setOpen,
  });

  return (
    <>
      <Button {...getReferenceProps()}>Open Drawer</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        aria-labelledby="drawer_label"
        {...getFloatingProps()}
        {...args}
      >
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
    </>
  );
};

export const BottomSimpleUsage = DrawerBottomExample.bind({});
BottomSimpleUsage.args = {
  position: "bottom",
};
