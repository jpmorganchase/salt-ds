import {
  Avatar,
  Button,
  Checkbox,
  CheckboxGroup,
  Divider,
  FormField,
  FormFieldLabel,
  List,
  ListItem,
  ListItemContent,
  ListItemTrigger,
  Overlay,
  OverlayHeader,
  OverlayPanel,
  OverlayPanelContent,
  type OverlayProps,
  OverlayTrigger,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
  Switch,
  Text,
  Tooltip,
  useId,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { type ChangeEvent, useState } from "react";

import "./overlay.stories.css";
import {
  ChevronRightIcon,
  CloseIcon,
  HelpCircleIcon,
  LightbulbIcon,
  MicroMenuIcon,
  NotificationIcon,
  SettingsIcon,
  UserIcon,
  VisibleIcon,
} from "@salt-ds/icons";
import persona from "../assets/avatar.png";

export default {
  title: "Core/Overlay",
} as Meta<typeof Overlay>;

export const Default: StoryFn<OverlayProps> = ({ ...args }) => {
  const id = useId();

  return (
    <Overlay {...args}>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>

      <OverlayPanel aria-labelledby={id}>
        <OverlayPanelContent>
          <h3 id={id} className="content-heading">
            Title
          </h3>
          <div>Content of Overlay</div>
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};

export const Bottom = Default.bind({});
Bottom.args = {
  placement: "bottom",
};

export const Left = Default.bind({});
Left.args = {
  placement: "left",
};

export const Right = Default.bind({});
Right.args = {
  placement: "right",
};

export const HideArrow = Default.bind({});
HideArrow.args = {
  placement: "bottom",
  hideArrow: true,
};

const HeaderTemplate: StoryFn = ({ onOpenChange, ...props }: OverlayProps) => {
  const [open, setOpen] = useState(false);

  const onChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <Overlay open={open} onOpenChange={onChange}>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel
        style={{
          width: 500,
        }}
      >
        <OverlayHeader header="Header block" {...props} />
        <OverlayPanelContent>
          <StackLayout gap={1}>
            <Text>
              Content of Overlay. Lorem Ipsum is simply dummy text of the
              printing and typesetting industry. Lorem Ipsum has been the
              industry's standard dummy text ever since the 1500s. When an
              unknown printer took a galley of type and scrambled it to make a
              type specimen book.
            </Text>
            <div>
              <Tooltip content={"I'm a tooltip"}>
                <Button>hover me</Button>
              </Tooltip>
            </div>
          </StackLayout>
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};

export const LongHeader = HeaderTemplate.bind({});
LongHeader.args = {
  header:
    "Comprehensive guidelines and detailed instructions for the optimal use and application of our services to ensure maximum efficiency and user satisfaction",
  actions: (
    <Button
      aria-label="Close overlay"
      appearance="transparent"
      sentiment="neutral"
    >
      <CloseIcon aria-hidden />
    </Button>
  ),
};

export const CloseButton = ({ onOpenChange }: OverlayProps) => {
  const [open, setOpen] = useState(false);
  const id = useId();

  const onChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const handleClose = () => setOpen(false);

  const closeButton = (
    <Button
      aria-label="Close overlay"
      appearance="transparent"
      sentiment="neutral"
      onClick={handleClose}
    >
      <CloseIcon aria-hidden />
    </Button>
  );

  return (
    <Overlay open={open} onOpenChange={onChange}>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel aria-labelledby={id}>
        <OverlayHeader header="Title" actions={closeButton} id={id} />
        <OverlayPanelContent>
          <div>
            Content of Overlay
            <br />
            <br />
            <Tooltip content={"I'm a tooltip"}>
              <Button>hover me</Button>
            </Tooltip>
          </div>
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};

const workspaceSettings = [
  { icon: VisibleIcon, label: "Appearance" },
  { icon: NotificationIcon, label: "Notification" },
  { icon: LightbulbIcon, label: "Keyboard shortcut" },
];
const accountSettings = [
  { icon: UserIcon, label: "Profile" },
  {
    icon: SettingsIcon,
    label: "Account settings",
    links: [
      { href: "#personal-details", label: "Personal details" },
      { href: "#security", label: "Security" },
      { href: "#privacy", label: "Privacy" },
    ],
  },
  { icon: HelpCircleIcon, label: "Help" },
];

export const ProfileSettings = () => {
  const workspaceTitleId = useId();
  const accountTitleId = useId();

  return (
    <Overlay placement="bottom" hideArrow>
      <OverlayTrigger>
        <Avatar
          aria-label="Open profile settings"
          name="Ada Lovelace"
          render={<button type="button" />}
          src={persona}
        />
      </OverlayTrigger>
      <OverlayPanel aria-label="Profile settings" style={{ width: 320 }}>
        <OverlayPanelContent>
          <StackLayout
            gap={1}
          >
            <StackLayout align="center" direction="row" gap={1}>
              <Avatar
                aria-label="Ada Lovelace"
                name="Ada Lovelace"
                size={2}
                src={persona}
              />
              <StackLayout gap={0}>
                <Text>
                  <strong>Ada Lovelace</strong>
                </Text>
                <Text color="secondary">Product designer</Text>
                <Text color="secondary">ada.lovelace@example.com</Text>
              </StackLayout>
            </StackLayout>
            <Divider variant="tertiary" />
            <StackLayout gap={0}>
              <Text
                color="secondary"
                id={workspaceTitleId}
                style={{
                  paddingBlock: "var(--salt-spacing-50)",
                  paddingInline: "var(--salt-spacing-100)",
                }}
                styleAs="label"
              >
                <strong>Workspace</strong>
              </Text>
              <List aria-labelledby={workspaceTitleId}>
                {workspaceSettings.map(({ icon: Icon, label }) => (
                  <ListItem key={label}>
                    <ListItemTrigger>
                      <ListItemContent>
                        <Icon aria-hidden />
                        {label}
                      </ListItemContent>
                    </ListItemTrigger>
                  </ListItem>
                ))}
              </List>
            </StackLayout>
            <Divider variant="tertiary" />
            <StackLayout gap={0}>
              <Text
                color="secondary"
                id={accountTitleId}
                style={{
                  paddingBlock: "var(--salt-spacing-50)",
                  paddingInline: "var(--salt-spacing-100)",
                }}
                styleAs="label"
              >
                <strong>Account</strong>
              </Text>
              <List aria-labelledby={accountTitleId}>
                {accountSettings.map(({ icon: Icon, label, links }) => (
                  <ListItem key={label}>
                    {links ? (
                      <Overlay hideArrow placement="right">
                        <OverlayTrigger>
                          <ListItemTrigger>
                            <ListItemContent>
                              <Icon aria-hidden />
                              {label}
                              <ChevronRightIcon
                                aria-hidden
                                style={{ marginInlineStart: "auto" }}
                              />
                            </ListItemContent>
                          </ListItemTrigger>
                        </OverlayTrigger>
                        <OverlayPanel aria-label={label} style={{ width: 240 }}>
                          <OverlayPanelContent>
                            <List aria-label={`${label} links`}>
                              {links.map((link) => (
                                <ListItem key={link.href}>
                                  <ListItemTrigger href={link.href}>
                                    <ListItemContent>
                                      {link.label}
                                    </ListItemContent>
                                  </ListItemTrigger>
                                </ListItem>
                              ))}
                            </List>
                          </OverlayPanelContent>
                        </OverlayPanel>
                      </Overlay>
                    ) : (
                      <ListItemTrigger>
                        <ListItemContent>
                          <Icon aria-hidden />
                          {label}
                        </ListItemContent>
                      </ListItemTrigger>
                    )}
                  </ListItem>
                ))}
              </List>
            </StackLayout>
            <Divider variant="tertiary" />
            <StackLayout gap={1}>
              <FormField>
                <FormFieldLabel>Mode</FormFieldLabel>
                <RadioButtonGroup defaultValue="system" direction="horizontal">
                  <RadioButton label="Light" value="light" />
                  <RadioButton label="Dark" value="dark" />
                  <RadioButton label="System" value="system" />
                </RadioButtonGroup>
              </FormField>
              <FormField>
                <FormFieldLabel>Theme</FormFieldLabel>
                <RadioButtonGroup
                  defaultValue="jpmorgan"
                  direction="horizontal"
                >
                  <RadioButton label="Legacy" value="legacy" />
                  <RadioButton label="J.P. Morgan" value="jpmorgan" />
                </RadioButtonGroup>
              </FormField>
            </StackLayout>
            <Divider variant="tertiary" />
            <Switch
              label="Focus mode"
              style={{
                minHeight: "var(--salt-size-base)",
                alignItems: "center",
              }}
            />
          </StackLayout>
        </OverlayPanelContent>
        <StackLayout padding={1}>
          <StackLayout gap={1}>
            <Button sentiment="accented">Logout</Button>
            <Button sentiment="accented" appearance="bordered">
              Add another account
            </Button>
          </StackLayout>
          <Text color="secondary" styleAs="notation">
            {"\u00A9 2026 JPMorgan Chase & Co. All rights reserved."}
          </Text>
        </StackLayout>
      </OverlayPanel>
    </Overlay>
  );
};

ProfileSettings.parameters = {
  layout: "padded",
};

export const LongContent = () => {
  const [open, setOpen] = useState(false);

  const onOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const handleClose = () => setOpen(false);

  const closeButton = (
    <Button
      aria-label="Close overlay"
      appearance="transparent"
      sentiment="neutral"
      onClick={handleClose}
    >
      <CloseIcon aria-hidden />
    </Button>
  );

  return (
    <Overlay placement="right" open={open} onOpenChange={onOpenChange}>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel
        style={{
          width: 300,
        }}
      >
        <OverlayHeader header="Title" actions={closeButton} />
        <OverlayPanelContent style={{ height: 200 }}>
          <StackLayout>
            <div>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s, when an unknown printer took a galley of
              type and scrambled it to make a type specimen book.
            </div>
            <div>
              It has survived not only five centuries, but also the leap into
              electronic typesetting, remaining essentially unchanged. It was
              popularised in the 1960s with the release of Letraset sheets
              containing Lorem Ipsum passages, and more recently with desktop
              publishing software like Aldus PageMaker including versions of
              Lorem Ipsum.
            </div>
          </StackLayout>
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};

const checkboxesData = [
  {
    label: "Overlay",
    value: "overlay",
  },
  {
    label: "Row",
    value: "row",
  },
];

const WithActionsContent = ({
  onClose,
  id,
}: {
  onClose: () => void;
  id: string | undefined;
}) => {
  const [controlledValues, setControlledValues] = useState([
    checkboxesData[0].value,
  ]);

  const [checkboxState, setCheckboxState] = useState({
    checked: false,
    indeterminate: true,
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const updatedChecked = event.target.checked;
    setCheckboxState({
      indeterminate: !updatedChecked && checkboxState.checked,
      checked:
        checkboxState.indeterminate && updatedChecked ? false : updatedChecked,
    });
  };

  const handleGroupChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (controlledValues.indexOf(value) === -1) {
      setControlledValues((prevControlledValues) => [
        ...prevControlledValues,
        value,
      ]);
    } else {
      setControlledValues((prevControlledValues) =>
        prevControlledValues.filter(
          (controlledValue) => controlledValue !== value,
        ),
      );
    }
  };

  const indeterminate = controlledValues.length <= 1;

  const handleExport = () => {
    console.log(`${controlledValues.length} file(s) exported`);
    onClose();
  };

  return (
    <>
      <h3 id={id} style={{ marginTop: 0 }}>
        Export
      </h3>
      <StackLayout gap={1}>
        <Checkbox
          indeterminate={indeterminate}
          checked={!indeterminate}
          label={`${controlledValues.length} of 2 selected`}
          onChange={handleChange}
        />
        <Divider variant="secondary" />
        <CheckboxGroup
          checkedValues={controlledValues}
          onChange={handleGroupChange}
        >
          {checkboxesData.map((data) => (
            <Checkbox key={data.value} {...data} />
          ))}
        </CheckboxGroup>
        <Divider variant="secondary" />
        <Button
          style={{ float: "right", marginRight: 2 }}
          onClick={handleExport}
        >
          Export
        </Button>
      </StackLayout>
    </>
  );
};

export const WithActions = ({ onOpenChange }: OverlayProps) => {
  const [open, setOpen] = useState(false);
  const id = useId();

  const onChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <Overlay open={open} onOpenChange={onChange} placement="bottom">
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel
        style={{
          width: 246,
        }}
        aria-labelledby={id}
      >
        <OverlayPanelContent>
          <WithActionsContent
            onClose={() => {
              setOpen(false);
            }}
            id={id}
          />
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};

export const WithTooltip: StoryFn<OverlayProps> = ({ ...args }) => {
  const id = useId();

  return (
    <Overlay {...args}>
      <Tooltip content="Show content">
        <OverlayTrigger>
          <Button aria-label="Show content">
            <MicroMenuIcon aria-hidden />
          </Button>
        </OverlayTrigger>
      </Tooltip>

      <OverlayPanel aria-labelledby={id}>
        <OverlayPanelContent>
          <h3 id={id} className="content-heading">
            Title
          </h3>
          <div>Content of Overlay</div>
        </OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};
