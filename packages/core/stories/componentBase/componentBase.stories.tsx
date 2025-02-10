import {
  Button,
  ComponentBase,
  type ComponentBaseProps,
  StackLayout,
  Text,
  resolveResponsiveValue,
  useBreakpoint,
  useDefaultProps,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react";
import "../layout/layout.stories.css";
export default {
  title: "Core/ComponentBase",
  component: ComponentBase,
  argTypes: {
    as: { type: "string" },
    position: {
      control: { type: "select" },
    },
  },
} as Meta<typeof ComponentBase>;

const SizedComponentBase: React.FC<ComponentBaseProps> = (props) => {
  const { matchedBreakpoints } = useBreakpoint();
  const currentBreakpoint = resolveResponsiveValue(
    { xs: "xs", sm: "sm", md: "md", lg: "lg", xl: "xl" },
    matchedBreakpoints,
  );
  const { size: defaultSize, ...rest } = useDefaultProps({
    name: "saltButton",
    props,
  });
  const currentSize = props?.size
    ? resolveResponsiveValue(props?.size, matchedBreakpoints)
    : defaultSize;
  return (
    <Button {...props}>
      {props.children} {currentBreakpoint} - {currentSize}
    </Button>
  );
};

export const ComponentBaseWithBreakpointsWrapper: StoryFn = () => {
  return (
    <StackLayout>
      <Text>
        Component A - will resize across breakpoints driven by responsive props
      </Text>
      <Text>
        Component B - will follow the defaultProps defined by
        DefaultPropsProvider
      </Text>
      <div style={{ display: "flex", gap: "var(--salt-spacing-200)" }}>
        <SizedComponentBase
          size={{
            xs: "small",
            sm: "medium",
            md: "large",
            lg: "large",
            xl: "large",
          }}
        >
          Component A
        </SizedComponentBase>
        <SizedComponentBase>Component B</SizedComponentBase>
      </div>
    </StackLayout>
  );
};
