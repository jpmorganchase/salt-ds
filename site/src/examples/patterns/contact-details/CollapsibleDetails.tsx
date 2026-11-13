import {
  Avatar,
  Button,
  GridLayout,
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
import { Fragment, useState } from "react";
import { basicContact } from "./ContactDetails";

const persona = "/img/examples/avatar.png";

export const CollapsibleDetails = () => {
  const [expandedDetails, setExpandedDetails] = useState(false);

  function handleClick() {
    setExpandedDetails(!expandedDetails);
  }
  return (
    <StackLayout
      direction="row"
      gap={2}
      style={{ width: "400px", maxWidth: "100%" }}
    >
      <Avatar
        src={persona as string}
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
          <GridLayout
            as="dl"
            columns="max-content minmax(0, 1fr)"
            rows="auto"
            columnGap={2}
            rowGap={0.5}
            padding={1}
            style={{
              borderTop: "solid",
              borderWidth: "1px",
              borderColor: "var(--salt-separable-primary-borderColor)",
            }}
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
        )}
      </StackLayout>
    </StackLayout>
  );
};
