import { Avatar, Button, StackLayout, Text, Tooltip } from "@salt-ds/core";
import { CallIcon, ChatIcon, MessageIcon, UserIcon } from "@salt-ds/icons";
import { basicContact } from "./ContactDetails";

const persona = "/img/examples/avatar.png";

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
