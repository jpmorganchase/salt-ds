import {
  StackLayout,
  Text,
  Spinner,
  StatusIndicator,
  Button,
} from "@salt-ds/core";
import { CircularProgress } from "@salt-ds/lab";
import { Meta } from "@storybook/react";

export default {
  title: "Patterns/Content Status",
} as Meta;

export const Info = () => {
  return (
    <StackLayout gap={1} align="center">
      <StatusIndicator status="info" size={2} />
      <Text>
        <strong>Message title</strong>
      </Text>
      <Text>
        Supplementary content can go here if required. This content area is
        flexible in height and width as needed.
      </Text>
      <Button style={{ marginTop: "var(--salt-spacing-100)" }}>Action</Button>
    </StackLayout>
  );
};

export const Warning = () => {
  return (
    <StackLayout gap={1} align="center">
      <StatusIndicator status="warning" size={2} />
      <Text>
        <strong>Message title</strong>
      </Text>
      <Text>
        Supplementary content can go here if required. This content area is
        flexible in height and width as needed.
      </Text>
      <Button style={{ marginTop: "var(--salt-spacing-100)" }}>Action</Button>
    </StackLayout>
  );
};

export const Error = () => {
  return (
    <StackLayout gap={1} align="center">
      <StatusIndicator status="error" size={2} />
      <Text>
        <strong>Message title</strong>
      </Text>
      <Text>
        Supplementary content can go here if required. This content area is
        flexible in height and width as needed.
      </Text>
      <Button style={{ marginTop: "var(--salt-spacing-100)" }}>Reload</Button>
    </StackLayout>
  );
};

export const Success = () => {
  return (
    <StackLayout gap={1} align="center">
      <StatusIndicator status="success" size={2} />
      <Text>
        Supplementary content can go here if required. This content area is
        flexible in height and width as needed.
      </Text>
    </StackLayout>
  );
};

export const WithSpinner = () => {
  return (
    <StackLayout gap={1} align="center">
      <Spinner size="medium" />
      <Text>
        Supplementary content can go here if required. This content area is
        flexible in height and width as needed.
      </Text>
    </StackLayout>
  );
};

export const WithProgress = () => {
  return (
    <StackLayout gap={1} align="center">
      <CircularProgress value={38} />
      <Text>
        Supplementary content can go here if required. This content area is
        flexible in height and width as needed.
      </Text>
    </StackLayout>
  );
};
