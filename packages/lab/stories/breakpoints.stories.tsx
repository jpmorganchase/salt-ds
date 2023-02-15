import { StackLayout, Button, Card } from "@salt-ds/core";
import {
  makeResponsive,
  ResponsiveChildren,
  BreakpointsProvider,
  useResponsiveValue,
  useResponsiveProps,
  createResponsiveSystem,
} from "@salt-ds/lab";

export default {
  title: "Lab/Responsive Props",
};

const ResponsiveStackLayout = makeResponsive(StackLayout);

export const MakeResponsiveExample = () => (
  <BreakpointsProvider>
    <ResponsiveStackLayout
      gap={{
        default: 0,
        sm: 1,
        md: 2,
        lg: 3,
        xl: 4,
      }}
      direction={{
        default: "column",
        md: "row",
      }}
    >
      <Button>Button 1</Button>
      <Button>Button 2</Button>
      <Button>Button 3</Button>
      <Button>Button 4</Button>
    </ResponsiveStackLayout>
  </BreakpointsProvider>
);

export const ResponsiveChildrenExample = () => {
  return (
    <BreakpointsProvider>
      <ResponsiveChildren
        xs={<h1>XS</h1>}
        sm={<h1>SM</h1>}
        md={<h1>MD</h1>}
        lg={<h1>LG</h1>}
        xl={<h1>XL</h1>}
      >
        <h1>Default</h1>
      </ResponsiveChildren>
    </BreakpointsProvider>
  );
};

const UseResponsiveValueExampleContent = () => {
  const backgroundColor = useResponsiveValue({
    default: "blue",
    xs: "red",
    sm: "green",
    md: "tomato",
    lg: "goldenrod",
    xl: "cyan",
  });

  return (
    <BreakpointsProvider>
      <Card
        style={{
          backgroundColor,
        }}
      >
        Background changes with the viewport size
      </Card>
    </BreakpointsProvider>
  );
};

export const UseResponsiveValueExample = () => {
  return (
    <BreakpointsProvider>
      <UseResponsiveValueExampleContent />
    </BreakpointsProvider>
  );
};

const UseResponsivePropsExampleContent = () => {
  const { backgroundColor, color } = useResponsiveProps({
    color: {
      default: "white",
      lg: "black",
    },
    backgroundColor: {
      default: "black",
      sm: "darkgrey",
      md: "darkblue",
      lg: "lightpink",
      xl: "white",
    },
  });

  return (
    <Card
      style={{
        backgroundColor,
        color,
      }}
    >
      Background and text color change but at different breakpoints
    </Card>
  );
};

export const UseResponsivePropsExample = () => {
  return (
    <BreakpointsProvider>
      <UseResponsivePropsExampleContent />
    </BreakpointsProvider>
  );
};

const customResponsiveSystem = createResponsiveSystem({
  tiny: 0,
  kindabig: 800,
  mahoosive: 1200,
});

const CustomResponsiveCard = customResponsiveSystem.makeResponsive(Card);

export const CustomBreakpointsExample = () => {
  return (
    <customResponsiveSystem.BreakpointsProvider>
      <CustomResponsiveCard
        style={{
          default: { background: "red" },
          tiny: { background: "tomato", color: "white" },
          kindabig: { background: "goldenrod", color: "black" },
          mahoosive: { background: "darkgrey", color: "white" },
        }}
      >
        Card 1
      </CustomResponsiveCard>
    </customResponsiveSystem.BreakpointsProvider>
  );
};
