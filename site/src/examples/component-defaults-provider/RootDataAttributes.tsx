import { Button } from "@salt-ds/core";
import {
  ComponentDefaultsProvider,
  type ComponentDefaultsRegistry,
} from "@salt-ds/styles";

const outerDefaults: ComponentDefaultsRegistry = {
  saltButton: {
    rootDataAttributes: {
      "data-default-source": "outer-provider",
      "data-default-region": "outer-region",
    },
  },
};

const innerDefaults: ComponentDefaultsRegistry = {
  saltButton: {
    rootDataAttributes: {
      "data-default-source": "inner-provider",
      "data-inner-default": "component-defaults-provider",
    },
  },
};

export const RootDataAttributes = () => {
  return (
    <ComponentDefaultsProvider value={outerDefaults}>
      <ComponentDefaultsProvider value={innerDefaults}>
        <Button style={{ width: 180 }}>Defaulted button</Button>
      </ComponentDefaultsProvider>
    </ComponentDefaultsProvider>
  );
};
