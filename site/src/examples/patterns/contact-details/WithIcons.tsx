import { Avatar, StackLayout, Text } from "@salt-ds/core";
import { UserIcon } from "@salt-ds/icons";
import { basicContact } from "./ContactDetails";

const persona = "/img/examples/avatar.png";

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
