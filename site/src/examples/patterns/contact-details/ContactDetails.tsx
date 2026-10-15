import { Avatar, Link, StackLayout, Text } from "@salt-ds/core";
import { CallIcon, LocationIcon, MessageIcon, UserIcon } from "@salt-ds/icons";

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
