import {
  StackLayout,
  Avatar,
  Text,
  Card,
  Button,
  Tooltip,
  FlexLayout,
  FlowLayout,
  SplitLayout,
} from "@salt-ds/core";
import { DropdownNext, DropdownNextProps, Option } from "@salt-ds/lab";
import {
  MessageIcon,
  LocationIcon,
  CallIcon,
  ChatIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserIcon,
} from "@salt-ds/icons";
import { Meta } from "@storybook/react";
import { useState } from "react";
import persona from "../../assets/avatar.png";
import persona2 from "../../assets/avatar2.png";
import persona3 from "../../assets/avatar3.png";

export default {
  title: "Patterns/Contact Details",
} as Meta;

const basicContact = {
  primary: "Jane Doe",
  secondary: "ABC Bank",
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
      label: "Office",
      value: "+44 2077 431102",
      icon: <CallIcon aria-hidden />,
    },
    {
      label: "Email",
      value: "email@company.com",
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
                <Text variant="secondary" key={metadata.label}>
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
              variant="secondary"
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
              variant="secondary"
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
              variant="secondary"
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
                  variant="secondary"
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
                  variant="secondary"
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
                  variant="secondary"
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
              variant="secondary"
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
                  <Text variant="secondary" key={metadata.label}>
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

const contactList = [
  {
    primary: "Jane Doe",
    sid: "O12",
    avatarImage: persona,
    number: "+44 2023 102112",
    email: "jane@company.com",
  },
  {
    primary: "Logan Rider",
    sid: "U34",
    avatarImage: persona2,
    number: "+44 2734 673890",
    email: "logan@company.com",
  },
  {
    primary: "Paul Hill",
    sid: "L56",
    avatarImage: persona3,
    number: "+44 2077 431102",
    email: "paul@company.com",
  },
];

const adornmentMap: Record<string, JSX.Element> = {
  O12: <Avatar src={persona} size={1} />,
  U34: <Avatar src={persona2} size={1} />,
  L56: <Avatar src={persona3} size={1} />,
};

export const List = () => {
  const [selectedContactId, setSelectedContactId] = useState<string[]>([
    contactList[0].sid,
  ]);

  const handleSelectionChange: DropdownNextProps["onSelectionChange"] = (
    event,
    newSelected
  ) => {
    setSelectedContactId(newSelected);
  };

  const adornment: JSX.Element = adornmentMap[selectedContactId[0] ?? ""];

  return (
    <DropdownNext
      style={{ width: "266px" }}
      startAdornment={adornment}
      onSelectionChange={handleSelectionChange}
      defaultValue={contactList[0].primary}
    >
      {contactList.map((contact) => (
        <Option
          key={contact.primary}
          value={contact.sid}
          textValue={contact.primary}
        >
          <StackLayout
            direction={"row"}
            gap={1}
            align="center"
            style={{
              paddingLeft: "var(--salt-spacing-100)",
              paddingRight: "var(--salt-spacing-100)",
              paddingTop: "var(--salt-spacing-50)",
              paddingBottom: "var(--salt-spacing-50)",
            }}
          >
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
                <FlexLayout align="center" justify="center" gap={1}>
                  <CallIcon />
                  <Text>{contact.number}</Text>
                </FlexLayout>
                <FlexLayout align="center" justify="center" gap={1}>
                  <MessageIcon />
                  <Text>{contact.email}</Text>
                </FlexLayout>
              </FlowLayout>
            </StackLayout>
          </StackLayout>
        </Option>
      ))}
    </DropdownNext>
  );
};
