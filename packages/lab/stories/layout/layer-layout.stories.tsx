import { CSSProperties, useState } from "react";
import {
  LayerLayout,
  LAYER_POSITION,
  FlexLayout,
  FlexItem,
  ParentChildLayout,
  ParentChildItem,
  Card,
  RadioButton,
  RadioButtonGroup,
  Tabstrip,
  Tab,
  useIsStacked,
  StackedViewElement,
  Viewport,
} from "@brandname/lab";
import { Button, Icon } from "@brandname/core";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { ChevronLeftIcon, CloseIcon } from "@brandname/icons";

export default {
  title: "Layout/LayerLayout",
  component: LayerLayout,
} as ComponentMeta<typeof LayerLayout>;

const layerContent = (
  <>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut nunc lacus,
      scelerisque ut elit nec, commodo blandit est. Duis mollis dui at nisl
      faucibus, id maximus urna pellentesque. Praesent consequat vulputate
      dolor, a mattis metus suscipit vitae. Donec ullamcorper, neque sit amet
      laoreet ornare, diam eros posuere metus, id consectetur tellus nisl id
      ipsum. Fusce sit amet cursus mauris, vel scelerisque enim. Quisque eu
      dolor tortor. Nulla facilisi. Vestibulum at neque sit amet neque facilisis
      porttitor a ac risus.
    </p>
    <p>
      Mauris consequat sollicitudin commodo. Vestibulum ac diam vulputate,
      condimentum purus non, eleifend erat. Nunc auctor iaculis mi eu hendrerit.
      Suspendisse potenti. Cras tristique vehicula iaculis. Morbi faucibus
      volutpat tellus, sit amet fringilla dui rhoncus a. Suspendisse nunc nulla,
      mattis sed commodo ac, cursus ut augue. Quisque libero magna, rutrum sit
      amet elementum eget, pulvinar vel metus. Nam id est id odio rutrum
      venenatis. Donec sodales est lacinia eros pharetra tempor. Phasellus
      sodales venenatis tellus, eget tempor ipsum efficitur imperdiet. Sed
      volutpat porta lorem a fermentum. Curabitur fringilla, justo in vestibulum
      egestas, lacus felis feugiat orci, a congue tortor lacus sed mi. Quisque
      quis ante finibus, posuere urna eget, finibus tellus.
    </p>
  </>
);

const Template: ComponentStory<typeof LayerLayout> = (args) => {
  return <LayerLayout {...args}>{layerContent}</LayerLayout>;
};

export const ToolkitLayerLayout = Template.bind({});
ToolkitLayerLayout.args = {
  displayScrim: true,
  position: "center",
  disableAnimations: false,
};

ToolkitLayerLayout.argTypes = {
  position: {
    options: LAYER_POSITION,
    control: { type: "select" },
  },
};

const Top: ComponentStory<typeof LayerLayout> = (args) => {
  return <LayerLayout {...args}>{layerContent}</LayerLayout>;
};

export const ToolkitLayerLayoutTop = Top.bind({});
ToolkitLayerLayoutTop.args = {
  displayScrim: true,
  position: "top",
  disableAnimations: false,
};

ToolkitLayerLayoutTop.argTypes = {
  position: {
    options: LAYER_POSITION,
    control: { type: "select" },
  },
};

const Right: ComponentStory<typeof LayerLayout> = (args) => {
  return <LayerLayout {...args}>{layerContent}</LayerLayout>;
};

export const ToolkitLayerLayoutRight = Right.bind({});
ToolkitLayerLayoutRight.args = {
  displayScrim: true,
  position: "right",
  disableAnimations: false,
};

ToolkitLayerLayoutRight.argTypes = {
  position: {
    options: LAYER_POSITION,
    control: { type: "select" },
  },
};

const Left: ComponentStory<typeof LayerLayout> = (args) => {
  return <LayerLayout {...args}>{layerContent}</LayerLayout>;
};

export const ToolkitLayerLayoutLeft = Left.bind({});
ToolkitLayerLayoutLeft.args = {
  displayScrim: true,
  position: "left",
  disableAnimations: false,
};

ToolkitLayerLayoutLeft.argTypes = {
  position: {
    options: LAYER_POSITION,
    control: { type: "select" },
  },
};

const Bottom: ComponentStory<typeof LayerLayout> = (args) => {
  return <LayerLayout {...args}>{layerContent}</LayerLayout>;
};

export const ToolkitLayerLayoutBottom = Bottom.bind({});
ToolkitLayerLayoutBottom.args = {
  displayScrim: true,
  position: "bottom",
  disableAnimations: false,
};

ToolkitLayerLayoutBottom.argTypes = {
  position: {
    options: LAYER_POSITION,
    control: { type: "select" },
  },
};

const stepStyles = { fontSize: 14 };
const iconStyles: CSSProperties = {
  width: 12,
  height: 12,
  borderRadius: "100%",
  boxSizing: "border-box",
};
const connectorStyles = {
  borderStyle: "dotted",
  borderWidth: " 0 0 0 2px",
  borderColor: "#C5C9D0",
  margin: 5,
  minHeight: 20,
};

const steppedTracker = (
  <div role="list">
    <FlexLayout alignItems="center" role="listitem" aria-current="step">
      <FlexLayout
        alignItems="center"
        justifyContent="center"
        style={{ ...iconStyles, border: "none", backgroundColor: "#2670A9" }}
      />
      <span style={{ ...stepStyles, fontWeight: 600 }}>
        Select payment method
      </span>
    </FlexLayout>
    <div style={{ ...connectorStyles, borderColor: "#2670A9" }} />
    <FlexLayout alignItems="center" role="listitem" aria-current="step">
      <FlexLayout
        alignItems="center"
        justifyContent="center"
        style={{ ...iconStyles, border: "2px solid #84878E" }}
      />
      <span style={stepStyles}>Enter card details</span>
    </FlexLayout>
    <div style={connectorStyles} />
    <FlexLayout alignItems="center" role="listitem" aria-current="step">
      <FlexLayout
        alignItems="center"
        justifyContent="center"
        style={{ ...iconStyles, border: "2px solid #84878E" }}
      />
      <span style={stepStyles}>Choose payment date</span>
    </FlexLayout>
    <div style={connectorStyles} />
    <FlexLayout alignItems="center" role="listitem" aria-current="step">
      <FlexLayout
        alignItems="center"
        justifyContent="center"
        style={{ ...iconStyles, border: "2px solid #84878E" }}
      />
      <span style={stepStyles}>Review summary</span>
    </FlexLayout>
    <div style={connectorStyles} />
    <FlexLayout alignItems="center" role="listitem" aria-current="step">
      <FlexLayout
        alignItems="center"
        justifyContent="center"
        style={{ ...iconStyles, border: "2px solid #84878E" }}
      />
      <span style={stepStyles}>Authorize payment</span>
    </FlexLayout>
  </div>
);

const PaymentCard = ({ index }: { index: number }) => (
  <Card interactable style={{ flexBasis: "48%", maxHeight: 225 }}>
    <FlexLayout
      alignItems="center"
      justifyContent="center"
      direction="column"
      height="100%"
    >
      <FlexItem>
        <img
          alt={"placeholder"}
          src="https://via.placeholder.com/80x60?text=Logo"
          style={{ padding: 24 }}
        />
      </FlexItem>
      <FlexItem width="100%" style={{ borderTop: "1px solid #EAEDEF" }}>
        <RadioButton
          label={`Option ${index + 1}`}
          value={`option${index + 1}`}
        />
      </FlexItem>
    </FlexLayout>
  </Card>
);

const PaymentDialog: ComponentStory<typeof LayerLayout> = (args) => {
  const parent = (
    <ParentChildItem height="100%" style={{ borderRight: "1px solid #ddd" }}>
      {steppedTracker}
    </ParentChildItem>
  );

  const child = (
    <ParentChildItem height="100%">
      <FlexLayout direction="column" height="100%">
        <h1
          style={{
            margin: 0,
            fontSize: 32,
            fontWeight: 700,
            padding: "0 0 24px 24px",
          }}
        >
          Select payment method
        </h1>
        <FlexLayout style={{ flex: 1 }}>
          <RadioButtonGroup
            row
            name="sample"
            defaultValue="option1"
            style={{ gap: 18 }}
          >
            {Array.from({ length: 4 }, (_, index) => (
              <PaymentCard index={index} key={index} />
            ))}
          </RadioButtonGroup>
        </FlexLayout>
        <FlexLayout justifyContent="flex-end" style={{ paddingTop: 24 }}>
          <Button variant="cta" style={{ width: 100 }}>
            NEXT
          </Button>
        </FlexLayout>
      </FlexLayout>
    </ParentChildItem>
  );

  return (
    <LayerLayout {...args}>
      <FlexLayout alignItems="center" justifyContent="space-between">
        <FlexItem />
        <FlexItem style={{ fontSize: 14 }}>Pay your bill</FlexItem>
        <FlexItem>
          <Button>
            <Icon size={12}>
              <CloseIcon />
            </Icon>
          </Button>
        </FlexItem>
      </FlexLayout>
      <FlexLayout height="100%" style={{ padding: "24px 0" }}>
        <ParentChildLayout
          parentWidth={310}
          stackedViewElement="child"
          stackedAtBreakpoint={Viewport.SMALL}
          parent={parent}
          child={child}
        />
      </FlexLayout>
    </LayerLayout>
  );
};

export const ToolkitLayerLayoutPaymentDialog = PaymentDialog.bind({});
ToolkitLayerLayoutPaymentDialog.args = {
  displayScrim: true,
  position: "center",
  disableAnimations: false,
  width: 970,
  fullScreenAtBreakpoint: 1000,
};

ToolkitLayerLayoutPaymentDialog.argTypes = {
  position: {
    options: LAYER_POSITION,
    control: { type: "select" },
  },
};

const preferences = ["General", "Order Settings", "FX Price Grid", "Shortcuts"];

const useTabSelection = (initialValue?: any) => {
  const [selectedTab, setSelectedTab] = useState(initialValue ?? 0);
  const handleTabSelection = (tabIndex: number) => {
    setSelectedTab(tabIndex);
  };
  return [selectedTab, handleTabSelection];
};
const mockPreference = (
  <p>
    As a global leader, we deliver strategic advice and solutions, including
    capital raising, risk management, and trade finance to corporations,
    institutions and governments.
  </p>
);

const headingStyles = {
  fontSize: 22,
  lineHeight: 1.3,
  marginTop: 0,
  fontWeight: 600,
};

const stackedAtBreakpoint = Viewport.MEDIUM;

const PreferencesDialog: ComponentStory<typeof LayerLayout> = (args) => {
  const [open, setOpen] = useState(false);

  const [currentView, setCurrentView] = useState<StackedViewElement>("child");

  const [selectedTab, handleTabSelection] = useTabSelection();

  const isStacked = useIsStacked(stackedAtBreakpoint);
  const handleClose = () => setOpen(false);

  const handleParent = () => {
    setCurrentView("parent");
  };
  const handleChild = () => {
    setCurrentView("child");
  };

  const stackedChild = isStacked && currentView === "child";

  const parent = (
    <ParentChildItem height="100%">
      <Tabstrip
        onChange={handleTabSelection}
        orientation="vertical"
        onClick={() => {
          if (isStacked) {
            handleChild();
          }
        }}
      >
        {preferences.map((label, i) => (
          <Tab label={label} key={i} />
        ))}
      </Tabstrip>
    </ParentChildItem>
  );

  const child = (
    <ParentChildItem height="100%">
      <FlexLayout direction="column" height="100%">
        <h2
          style={{
            fontSize: 14,
          }}
        >
          Investment Banking
        </h2>
        {mockPreference}
      </FlexLayout>
    </ParentChildItem>
  );

  return open ? (
    <LayerLayout {...args} style={{ maxWidth: 640 }}>
      <FlexLayout alignItems="center" justifyContent="space-between">
        <FlexItem>
          {stackedChild && (
            <Button onClick={handleParent}>
              <Icon size={12}>
                <ChevronLeftIcon />
              </Icon>
            </Button>
          )}
        </FlexItem>
        <FlexItem>
          {stackedChild && (
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>
              {preferences[selectedTab]}
            </h2>
          )}
        </FlexItem>
        <FlexItem>
          <Button onClick={handleClose}>
            <Icon size={12}>
              <CloseIcon />
            </Icon>
          </Button>
        </FlexItem>
      </FlexLayout>
      {!stackedChild && <h1 style={headingStyles}>Preferences</h1>}

      <ParentChildLayout
        stackedViewElement={currentView}
        stackedAtBreakpoint={stackedAtBreakpoint}
        gap={24}
        parent={parent}
        child={child}
        style={{ padding: "24px 0", flex: 1 }}
      />

      <FlexLayout justifyContent="flex-end" style={{ paddingTop: 16 }}>
        <Button onClick={handleClose}>Close</Button>
      </FlexLayout>
    </LayerLayout>
  ) : (
    <Button onClick={() => setOpen((open) => !open)}>Open Preferences</Button>
  );
};

export const ToolkitLayerLayoutPreferencesDialog = PreferencesDialog.bind({});
ToolkitLayerLayoutPreferencesDialog.args = {
  displayScrim: true,
  position: "center",
  disableAnimations: false,
};

ToolkitLayerLayoutPreferencesDialog.argTypes = {
  position: {
    options: LAYER_POSITION,
    control: { type: "select" },
  },
};
