import { PropsWithChildren, useState } from "react";
import { Button, FlexLayout, StackLayout } from "@salt-ds/core";
import {
  DialogNext,
  DialogNextTitle,
  DialogNextActions,
  DialogNextContent,
  NavItem,
  DialogNextBody,
} from "@salt-ds/lab";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import "./dialog-next.stories.css";

export default {
  title: "Lab/Dialog Next",
  component: DialogNext,
  args: {
    title: "Congratulations! You have created a Dialog.",
    content: "This is the content of the dialog.",
  },
} as ComponentMeta<typeof DialogNext>;

const DialogTemplate: ComponentStory<typeof DialogNext> = ({
  title,
  // @ts-ignore
  content,
  open: openProp = true,
  ...args
}) => {
  const [open, setOpen] = useState(openProp);

  const handleRequestOpen = () => {
    setOpen(true);
  };

  const onOpenChange = (value: boolean) => {
    setOpen(value);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button data-testid="dialog-button" onClick={handleRequestOpen}>
        Click to open dialog
      </Button>
      <DialogNext {...args} open={open} onOpenChange={onOpenChange}>
        <DialogNextTitle>{title}</DialogNextTitle>
        <DialogNextContent>{content}</DialogNextContent>
        <DialogNextActions>
          <Button variant="cta" onClick={handleClose}>
            CTA BUTTON
          </Button>
          <Button onClick={handleClose}>REGULAR BUTTON</Button>
          <Button variant="secondary" onClick={handleClose}>
            SECONDARY BUTTON
          </Button>
        </DialogNextActions>
      </DialogNext>
    </>
  );
};

export const Default = DialogTemplate.bind({});

export const LongContent = DialogTemplate.bind({});

LongContent.args = {
  title: "Congratulations! You have created a Dialog.",
  // @ts-ignore
  content: (
    <StackLayout>
      <div>
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industry's standard dummy text ever
        since the 1500s, when an unknown printer took a galley of type and
        scrambled it to make a type specimen book.
      </div>
      <div>
        It has survived not only five centuries, but also the leap into
        electronic typesetting, remaining essentially unchanged. It was
        popularised in the 1960s with the release of Letraset sheets containing
        Lorem Ipsum passages, and more recently with desktop publishing software
        like Aldus PageMaker including versions of Lorem Ipsum.
      </div>
      <div>
        It is a long established fact that a reader will be distracted by the
        readable content of a page when looking at its layout. The point of
        using Lorem Ipsum is that it has a more-or-less normal distribution of
        letters, as opposed to using 'Content here, content here', making it
        look like readable English.
      </div>
      <div>
        Many desktop publishing packages and web page editors now use Lorem
        Ipsum as their default model text, and a search for 'lorem ipsum' will
        uncover many web sites still in their infancy. Various versions have
        evolved over the years, sometimes by accident, sometimes on purpose
        (injected humour and the like).
      </div>
      <div>
        Contrary to popular belief, Lorem Ipsum is not simply random text. It
        has roots in a piece of classical Latin literature from 45 BC, making it
        over 2000 years old. Richard McClintock, a Latin professor at
        Hampden-Sydney College in Virginia, looked up one of the more obscure
        Latin words, consectetur, from a Lorem Ipsum passage, and going through
        the cites of the word in classical literature, discovered the
        undoubtable source.
      </div>
      <div>
        Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus
        Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written
        in 45 BC. This book is a treatise on the theory of ethics, very popular
        during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum
        dolor sit amet..", comes from a line in section 1.10.32.
      </div>
    </StackLayout>
  ),
};

export const InfoStatus = DialogTemplate.bind({});
InfoStatus.args = {
  status: "info",
};

export const SuccessStatus = DialogTemplate.bind({});
SuccessStatus.args = {
  status: "success",
};

export const WarningStatus = DialogTemplate.bind({});
WarningStatus.args = {
  status: "warning",
};

export const ErrorStatus = DialogTemplate.bind({});
ErrorStatus.args = {
  status: "error",
};

const itemsWithSubNav = [
  {
    name: "Nav Item 1",
  },
  {
    name: "Nav Item 2",
    subNav: ["Sub Nav Item 1", "Sub Nav Item 2", "Sub Nav Item 3"],
  },
  {
    name: "Nav Item 3",
    subNav: ["Sub Nav Item 1", "Sub Nav Item 2", "Sub Nav Item 3"],
  },
];

const items = itemsWithSubNav.map((item) => item.name);

export const PreferencesDialog: ComponentStory<typeof DialogNext> = (args) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(items[0]);

  const handleRequestOpen = () => {
    setOpen(true);
  };

  const onOpenChange = (value: boolean) => {
    setOpen(value);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button data-testid="dialog-button" onClick={handleRequestOpen}>
        Click to open dialog
      </Button>
      <DialogNext
        {...args}
        open={open}
        onOpenChange={onOpenChange}
        style={{
          width: "calc(20 * var(--salt-size-base))",
        }}
      >
        <DialogNextTitle>Preferences</DialogNextTitle>
        <FlexLayout gap={0}>
          <nav>
            <ul className="verticalDialogNav">
              {items.map((item) => (
                <li key={item}>
                  <NavItem
                    active={active === item}
                    href="#"
                    orientation="vertical"
                    onClick={(event) => {
                      // Prevent default to avoid navigation
                      event.preventDefault();
                      setActive(item);
                    }}
                  >
                    {item}
                  </NavItem>
                </li>
              ))}
            </ul>
          </nav>
          <DialogNextContent>Hello</DialogNextContent>
        </FlexLayout>
        <DialogNextActions>
          <Button onClick={handleClose}>Save</Button>
        </DialogNextActions>
      </DialogNext>
    </>
  );
};

function FakeWindow({ children }: PropsWithChildren) {
  return (
    <div
      style={{
        border: "1px solid black",
        width: "calc(20 * var(--salt-size-base))",
      }}
    >
      <div
        style={{
          borderBottom: "1px solid black",
          paddingBlock: "var(--salt-spacing-200)",
        }}
      ></div>
      {children}
    </div>
  );
}

export const DesktopDialog = () => {
  return (
    <StackLayout>
      <FakeWindow>
        <DialogNextBody>
          <DialogNextTitle>Window Dialog</DialogNextTitle>
          <DialogNextContent>Hello world!</DialogNextContent>
          <DialogNextActions>
            <Button variant="secondary">Cancel</Button>
            <Button>Save</Button>
          </DialogNextActions>
        </DialogNextBody>
      </FakeWindow>

      <FakeWindow>
        <DialogNextBody status="warning">
          <DialogNextTitle>Warning Dialog</DialogNextTitle>
          <DialogNextContent>Potential issues abound!</DialogNextContent>
          <DialogNextActions>
            <Button variant="secondary">Cancel</Button>
            <Button>Ok</Button>
          </DialogNextActions>
        </DialogNextBody>
      </FakeWindow>
    </StackLayout>
  );
};
