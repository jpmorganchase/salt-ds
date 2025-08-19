import {
  Avatar,
  Button,
  Card,
  Dropdown,
  type DropdownProps,
  FlexLayout,
  FlowLayout,
  Link,
  Option,
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
import type { Meta } from "@storybook/react-vite";
import { useState } from "react";
import persona from "../../assets/avatar.png";
import persona2 from "../../assets/avatar2.png";
import persona3 from "../../assets/avatar3.png";

export default {
  title: "Patterns/Contact Details",
} as Meta;

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

export const ContactDetails = ({ avatarSrc = persona }) => {
  return (
    <StackLayout
      direction={"row"}
      gap={2}
      style={{
        width: "min-content",
      }}
    >
      <Avatar
        src={avatarSrc as string}
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
        <StackLayout direction={"row"} gap={2}>
          <StackLayout gap={0.5} direction={"column"}>
            {basicContact.metadata.map((metadata) => {
              return (
                <Text color="secondary" key={metadata.label}>
                  {metadata.label}
                </Text>
              );
            })}
          </StackLayout>
          <StackLayout gap={0.5} direction={"column"}>
            {basicContact.metadata.map((metadata) => {
              return <Text key={metadata.label}>{metadata.value}</Text>;
            })}
          </StackLayout>
        </StackLayout>
      </StackLayout>
    </StackLayout>
  );
};

export const WithIcons = ({ avatarSrc = persona }) => {
  return (
    <StackLayout
      direction={"row"}
      gap={2}
      style={{
        width: "min-content",
      }}
    >
      <Avatar
        src={avatarSrc as string}
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
        <StackLayout direction={"row"} gap={2}>
          <StackLayout gap={0.5} direction={"column"}>
            {basicContact.metadata.map((metadata) => {
              return (
                <StackLayout
                  direction={"row"}
                  key={metadata.label}
                  align="center"
                  gap={1}
                >
                  {metadata.icon}
                  <Text aria-label={`Phone ${basicContact.primary}`}>
                    {metadata.value}
                  </Text>
                </StackLayout>
              );
            })}
          </StackLayout>
        </StackLayout>
      </StackLayout>
    </StackLayout>
  );
};

export const CardEmbedded = () => {
  return (
    <Card>
      <ContactDetails />
    </Card>
  );
};

export const QuickAction = () => {
  return (
    <StackLayout direction="row" gap={2} style={{ width: "min-content" }}>
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
      </StackLayout>
    </StackLayout>
  );
};

export const CollapsibleDetails = () => {
  const [expandedDetails, setExpandedDetails] = useState(false);

  function handleClick() {
    setExpandedDetails(!expandedDetails);
  }
  return (
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
            <Button
              onClick={handleClick}
              appearance="transparent"
              aria-expanded={expandedDetails}
              aria-label={"expand contact details"}
            >
              {expandedDetails ? (
                <ChevronUpIcon aria-hidden />
              ) : (
                <ChevronDownIcon aria-hidden />
              )}
            </Button>
          }
        />
        {expandedDetails && (
          <StackLayout
            direction={"row"}
            gap={2}
            style={{
              borderTop: "solid",
              borderWidth: "1px",
              borderColor: "var(--salt-separable-primary-borderColor)",
              padding: "var(--salt-spacing-100)",
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
        )}
      </StackLayout>
    </StackLayout>
  );
};

type Contact = {
  primary: string;
  sid: string;
  avatarImage: string;
  number: string;
  email: string;
};

const contactList: Contact[] = [
  {
    primary: "Jane Doe",
    sid: "O12",
    avatarImage: persona,
    number: "+1 (212) 555-0100",
    email: "jane.doe@example.com",
  },
  {
    primary: "Logan Rider",
    sid: "U34",
    avatarImage: persona2,
    number: "+1 (212) 555-0101",
    email: "logan.rider@company.com",
  },
  {
    primary: "Paul Hill",
    sid: "L56",
    avatarImage: persona3,
    number: "+1 (212) 555-0102",
    email: "paul.hill@company.com",
  },
];

export const List = () => {
  const [selectedContact, setSelectedContact] = useState<Contact[]>([
    contactList[0],
  ]);

  const handleSelectionChange: DropdownProps<Contact>["onSelectionChange"] = (
    _event,
    newSelected,
  ) => {
    setSelectedContact(newSelected);
  };

  return (
    <Dropdown<Contact>
      style={{ width: "266px" }}
      startAdornment={
        selectedContact.length === 1 && (
          <Avatar src={selectedContact[0].avatarImage} size={1} />
        )
      }
      onSelectionChange={handleSelectionChange}
      selected={selectedContact}
      valueToString={(contact) => contact.primary}
    >
      {contactList.map((contact) => (
        <Option
          key={contact.sid}
          value={contact}
          style={{
            padding: "var(--salt-spacing-50) var(--salt-spacing-100)",
          }}
        >
          <StackLayout direction={"row"} align="center" gap={1}>
            <Avatar
              src={contact.avatarImage as string}
              aria-label={basicContact.primary}
              fallbackIcon={<UserIcon />}
              size={1}
            />
            <StackLayout direction={"column"} gap={0.5}>
              <Text>
                <strong> {contact.primary} </strong>
              </Text>
              <FlowLayout gap={3}>
                <FlexLayout gap={1} align="center">
                  <CallIcon />
                  <Text>{contact.number}</Text>
                </FlexLayout>
                <FlexLayout gap={1} align="center">
                  <MessageIcon />
                  <Text>{contact.email}</Text>
                </FlexLayout>
              </FlowLayout>
            </StackLayout>
          </StackLayout>
        </Option>
      ))}
    </Dropdown>
  );
};
