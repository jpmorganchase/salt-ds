import {
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

export const WithSpinner = () => {
  return (
    <StackLayout gap={1} align="center">
      <Spinner size="medium" />
      <Text>Supplementary content can go here if required.</Text>
    </StackLayout>
  );
};

export const Info = () => {
  return (
    <StackLayout gap={1} align="center">
      <StatusIndicator status="info" size={2} />
      <Text>
        <strong>No [content] available</strong>
      </Text>
      <Text>Supplementary content can go here if required.</Text>
      <Button>[Custom action]</Button>
    </StackLayout>
  );
};

export const Warning = () => {
  return (
    <StackLayout gap={1} align="center">
      <StatusIndicator status="warning" size={2} />
      <Text>
        <strong>No permission to access [content]</strong>
      </Text>
      <Text>Supplementary content can go here if required.</Text>
      <Button>[Custom action]</Button>
    </StackLayout>
  );
};

export const Error = () => {
  return (
    <StackLayout gap={1} align="center">
      <StatusIndicator status="error" size={2} />
      <Text>
        <strong>There&apos;s been a system error</strong>
      </Text>
      <Text>It should be temporary, so please try again.</Text>
      <Button>Reload</Button>
    </StackLayout>
  );
};

export const Success = () => {
  return (
    <StackLayout gap={1} align="center">
      <StatusIndicator status="success" size={2} />
      <Text>Supplementary content can go here if required.</Text>
    </StackLayout>
  );
};
