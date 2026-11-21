import { Avatar, GridLayout, Link, StackLayout, Text } from "@salt-ds/core";
import { CallIcon, LocationIcon, MessageIcon, UserIcon } from "@salt-ds/icons";
import { Fragment } from "react";

const persona = "/img/examples/avatar.png";

export const basicContact = {
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
        width: "max-content",
        maxWidth: "100%",
      }}
    >
      <Avatar
        src={avatarSrc as string}
        aria-label={basicContact.primary}
        fallbackIcon={<UserIcon />}
        size={2}
      />
      <StackLayout direction={"column"} gap={1} style={{ minWidth: 0 }}>
        <StackLayout direction={"column"} gap={0.5}>
          <Text styleAs="h2">{basicContact.primary}</Text>
          <StackLayout direction={"column"} gap={0}>
            <Text styleAs="h4">{basicContact.secondary}</Text>
            <Text styleAs="h4">{basicContact.tertiary}</Text>
          </StackLayout>
        </StackLayout>
        <GridLayout
          as="dl"
          columns="max-content minmax(0, 1fr)"
          rows="auto"
          columnGap={2}
          rowGap={0.5}
        >
          {basicContact.metadata.map((metadata) => (
            <Fragment key={metadata.label}>
              <Text as="dt" color="secondary">
                {metadata.label}
              </Text>
              <Text as="dd" style={{ margin: 0, overflowWrap: "anywhere" }}>
                {metadata.value}
              </Text>
            </Fragment>
          ))}
        </GridLayout>
      </StackLayout>
    </StackLayout>
  );
};
