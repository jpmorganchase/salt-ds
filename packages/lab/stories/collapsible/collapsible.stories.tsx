import {
  Avatar,
  Button,
  Card,
  Checkbox,
  CheckboxGroup,
  FlowLayout,
  Link,
  SplitLayout,
  StackLayout,
  Text,
  Tooltip,
} from "@salt-ds/core";
import {
  CallIcon,
  ChatIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  LocationIcon,
  MessageIcon,
  UserIcon,
} from "@salt-ds/icons";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@salt-ds/lab";
import persona from "@stories/assets/avatar.png";
import type { StoryFn } from "@storybook/react";
import { useState } from "react";

export default {
  title: "Lab/Collapsible",
  component: Collapsible,
};

export const Default: StoryFn<typeof Collapsible> = (args) => (
  <Collapsible {...args}>
    <CollapsibleTrigger>
      <Button>Click</Button>
    </CollapsibleTrigger>
    <CollapsiblePanel data-testid="collapsible-panel">
      <p data-testid="panel-content" style={{ maxWidth: "80ch" }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </p>
    </CollapsiblePanel>
  </Collapsible>
);

export const Accounts = () => {
  return (
    <StackLayout gap={1} style={{ minWidth: "400px" }}>
      <Text styleAs="h2">Accounts</Text>
      <StackLayout gap={1}>
        <Collapsible>
          <Card>
            <SplitLayout
              align="center"
              startItem={<Text styleAs="h4">Account 1</Text>}
              endItem={
                <FlowLayout align="center" gap={1}>
                  <Text color="secondary" styleAs="label">
                    4 of 4 products
                  </Text>
                  <CollapsibleTrigger>
                    <Button appearance="transparent">
                      <ChevronDownIcon aria-hidden />
                    </Button>
                  </CollapsibleTrigger>
                </FlowLayout>
              }
            />
            <CollapsiblePanel>
              <CheckboxGroup style={{ paddingTop: "var(--salt-spacing-300)" }}>
                <Checkbox label="Product 1" checked />
                <Checkbox label="Product 2" checked />
                <Checkbox label="Product 3" checked />
                <Checkbox label="Product 4" checked />
              </CheckboxGroup>
            </CollapsiblePanel>
          </Card>
        </Collapsible>
      </StackLayout>
    </StackLayout>
  );
};

const basicContact = {
  primary: "Jane Doe",
  secondary: "Example Bank",
  tertiary: "SPN 2188538",
  metadata: [
    {
      label: "Role",
      value: "Analyst",
      icon: <UserIcon aria-hidden />,
    },
    {
      label: "Location",
      value: "London, GBR",
      icon: <LocationIcon aria-hidden />,
    },
    {
      label: "Phone",
      value: "+1 (212) 555-0100",
      icon: <CallIcon aria-hidden />,
    },
    {
      label: "Email",
      value: (
        <Link href="mailto:jane.doe@example.com">jane.doe@example.com</Link>
      ),
      icon: <MessageIcon aria-hidden />,
    },
  ],
};

export const ContactDetails = () => {
  const [expandedDetails, setExpandedDetails] = useState(false);

  return (
    <Collapsible onOpenChange={(_, expanded) => setExpandedDetails(expanded)}>
      <StackLayout direction="row" gap={2} style={{ width: "400px" }}>
        <Avatar
          src={persona as string}
          aria-label={basicContact.primary}
          fallbackIcon={<UserIcon />}
          size={2}
        />
        <StackLayout direction={"column"} gap={1}>
          <StackLayout direction={"column"} gap={0.5}>
            <Text styleAs="h2">{basicContact.primary}</Text>
            <StackLayout direction={"column"} gap={0}>
              <Text styleAs="h4">{basicContact.secondary}</Text>
              <Text styleAs="h4">{basicContact.tertiary}</Text>
            </StackLayout>
          </StackLayout>
          <SplitLayout
            startItem={
              <StackLayout gap={1} direction={"row"}>
                <Tooltip
                  content={`Email ${basicContact.primary}`}
                  placement={"bottom"}
                  hideIcon
                >
                  <Button
                    appearance="transparent"
                    aria-label={`Email ${basicContact.primary}`}
                  >
                    <MessageIcon aria-hidden />
                  </Button>
                </Tooltip>
                <Tooltip
                  content={`Call ${basicContact.primary}`}
                  placement={"bottom"}
                  hideIcon
                >
                  <Button
                    appearance="transparent"
                    aria-label={`Call ${basicContact.primary}`}
                  >
                    <CallIcon aria-hidden />
                  </Button>
                </Tooltip>
                <Tooltip
                  content={`Text ${basicContact.primary}`}
                  placement={"bottom"}
                  hideIcon
                >
                  <Button
                    appearance="transparent"
                    aria-label={`Text ${basicContact.primary}`}
                  >
                    <ChatIcon aria-hidden />
                  </Button>
                </Tooltip>
              </StackLayout>
            }
            endItem={
              <CollapsibleTrigger aria-label="expand contact details">
                <Button appearance="transparent">
                  {expandedDetails ? (
                    <ChevronUpIcon aria-hidden />
                  ) : (
                    <ChevronDownIcon aria-hidden />
                  )}
                </Button>
              </CollapsibleTrigger>
            }
          />
          <CollapsiblePanel>
            <StackLayout
              direction={"row"}
              gap={2}
              style={{
                padding: "var(--salt-spacing-100)",
                borderTop: "solid",
                borderWidth: "1px",
                borderColor: "var(--salt-separable-primary-borderColor)",
              }}
            >
              <StackLayout direction={"column"} gap={0.5}>
                {basicContact.metadata.map((metadata) => {
                  return (
                    <Text color="secondary" key={metadata.label}>
                      {metadata.label}
                    </Text>
                  );
                })}
              </StackLayout>
              <StackLayout direction={"column"} gap={0.5}>
                {basicContact.metadata.map((metadata) => {
                  return <Text key={metadata.label}>{metadata.value}</Text>;
                })}
              </StackLayout>
            </StackLayout>
          </CollapsiblePanel>
        </StackLayout>
      </StackLayout>
    </Collapsible>
  );
};
