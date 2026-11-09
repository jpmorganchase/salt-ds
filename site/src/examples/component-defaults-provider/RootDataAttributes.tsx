import { Button, StackLayout, Text } from "@salt-ds/core";
import {
  ComponentDefaultsProvider,
  type ComponentDefaultsRegistry,
} from "@salt-ds/styles";

const defaults: ComponentDefaultsRegistry = {
  saltButton: {
    rootDataAttributes: {
      "data-default-source": "component-defaults-provider",
    },
  },
};

export const RootDataAttributes = () => {
  return (
    <ComponentDefaultsProvider value={defaults}>
      <StackLayout gap={1}>
        <Text>
          This button receives a root <code>data-default-source</code> attribute
          from the provider.
        </Text>
        <Button>Defaulted button</Button>
      </StackLayout>
    </ComponentDefaultsProvider>
  );
};
