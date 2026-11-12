import {
  Avatar,
  Button,
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
  MessageIcon,
  UserIcon,
} from "@salt-ds/icons";
import { useState } from "react";
import { basicContact } from "./ContactDetails";

const persona = "/img/examples/avatar.png";

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
