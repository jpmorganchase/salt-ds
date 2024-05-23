import {
  CircularProgress,
  StackLayout,
  Text,
  Spinner,
  StatusIndicator,
  Button,
} from "@salt-ds/core";
import { Meta } from "@storybook/react";

export default {
  title: "Patterns/Content Status",
} as Meta;

export const Info = () => {
  return (
    <StackLayout gap={3} align="center">
      <StatusIndicator status="info" size={2} />
      <StackLayout gap={1} align="center">
        <Text styleAs="h4">
          <strong>Message title</strong>
        </Text>
        <Text>
          Supplementary content can go here if required. This content area is
          flexible in height and width as needed.
        </Text>
      </StackLayout>
      <Button>Action</Button>
    </StackLayout>
  );
};

export const Warning = () => {
  return (
    <StackLayout gap={3} align="center">
      <StatusIndicator status="warning" size={2} />
      <StackLayout gap={1} align="center">
        <Text styleAs="h4">
          <strong>Message title</strong>
        </Text>
        <Text>
          Supplementary content can go here if required. This content area is
          flexible in height and width as needed.
        </Text>
      </StackLayout>
      <Button>Action</Button>
    </StackLayout>
  );
};

export const Error = () => {
  return (
    <StackLayout gap={3} align="center">
      <StatusIndicator status="error" size={2} />
      <StackLayout gap={1} align="center">
        <Text styleAs="h4">
          <strong>Message title</strong>
        </Text>
        <Text>
          Supplementary content can go here if required. This content area is
          flexible in height and width as needed.
        </Text>
      </StackLayout>
      <Button>Reload</Button>
    </StackLayout>
  );
};

export const Success = () => {
  return (
    <StackLayout gap={3} align="center">
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
    <StackLayout gap={3} align="center">
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
    <StackLayout gap={3} align="center">
      <CircularProgress value={38} />
      <Text>
        Supplementary content can go here if required. This content area is
        flexible in height and width as needed.
      </Text>
    </StackLayout>
  );
};
