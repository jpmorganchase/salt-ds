import {
  CallIcon,
  HomeIcon,
  LocationIcon,
  MessageIcon,
  SettingsIcon,
  UserIcon,
} from "@brandname/icons";
import {
  ContactAction,
  ContactActions,
  ContactAvatar,
  ContactDetails,
  ContactDetailsVariant,
  ContactFavoriteToggle,
  ContactMetadata,
  ContactMetadataItem,
  ContactPrimaryInfo,
  ContactSecondaryInfo,
  ContactTertiaryInfo,
  Slider,
} from "@brandname/lab";
import { SliderValue } from "@brandname/lab/src/slider/internal/utils";
import { Story } from "@storybook/react";

import { useState } from "react";

export default {
  title: "Lab/ContactDetails/Development",
  component: ContactDetails,
};

interface ContactDetailsStoryProps {
  stacked?: boolean;
  variant?: ContactDetailsVariant;
  showAvatar?: boolean;
  showPrimary?: boolean;
  showSecondary?: boolean;
  showTertiary?: boolean;
  showMetadata?: boolean;
  collapsible?: boolean;
  metadataDescriptors?: "labels" | "icons";
  showFavoriteToggle?: boolean;
  showActions?: boolean;
  actionDescriptors?: "labels" | "icons";
  showIcons?: boolean;
  showBorder?: boolean;
  embedded?: boolean;
}

const DefaultContactDetailsTemplate: Story<ContactDetailsStoryProps> = (
  props
) => {
  const {
    variant,
    showBorder,
    showAvatar = true,
    showPrimary = true,
    showSecondary = true,
    showTertiary = true,
    showMetadata = true,
    collapsible = true,
    metadataDescriptors = "labels",
    showFavoriteToggle,
    showActions = true,
    actionDescriptors = "icons",
    showIcons = true,
    embedded,
  } = props;

  const [width, setWidth] = useState(390);
  const [stackAtBreakpoint, setStackAtBreakpoint] = useState(300);

  const onWidthChange = (value: SliderValue) => {
    setWidth(value as number);
  };

  const onStackAtBreakpointChange = (value: SliderValue) => {
    setStackAtBreakpoint(value as number);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Slider
        label="Width"
        min={100}
        max={500}
        step={10}
        marks={[100, 200, 300, 400, 500]}
        value={width}
        onChange={onWidthChange}
      />
      <Slider
        label="Stack at breakpoint"
        min={100}
        max={500}
        step={10}
        marks={[100, 200, 300, 400, 500]}
        value={stackAtBreakpoint}
        onChange={onStackAtBreakpointChange}
      />
      <ContactDetails
        variant={variant}
        embedded={embedded}
        stackAtBreakpoint={stackAtBreakpoint}
        style={{
          width,
          border: showBorder ? "solid 1px green" : undefined,
        }}
      >
        {showAvatar ? <ContactAvatar /> : null}
        {showPrimary ? <ContactPrimaryInfo text="Alex Brailescu" /> : null}
        {showFavoriteToggle ? <ContactFavoriteToggle /> : null}
        {showSecondary ? (
          <ContactSecondaryInfo
            text="Blackrock Advisors (UK) Limited"
            icon={showIcons ? HomeIcon : undefined}
          />
        ) : null}
        {showTertiary ? (
          <ContactTertiaryInfo
            text="SPN 2188538"
            icon={showIcons ? SettingsIcon : undefined}
          />
        ) : null}
        {showActions ? (
          <ContactActions>
            <ContactAction
              icon={CallIcon}
              label={actionDescriptors === "labels" ? "Call" : undefined}
              onClick={() => {
                console.log("Custom Action: Call");
              }}
            />
            <ContactAction
              icon={MessageIcon}
              label={actionDescriptors === "labels" ? "Message" : undefined}
              onClick={() => {
                console.log("Custom Action: Message");
              }}
            />
          </ContactActions>
        ) : null}
        {showMetadata ? (
          <ContactMetadata collapsible={collapsible}>
            <ContactMetadataItem
              label="Role"
              icon={metadataDescriptors === "icons" ? UserIcon : undefined}
              value="Analyst"
            />
            <ContactMetadataItem
              label="Location"
              icon={metadataDescriptors === "icons" ? LocationIcon : undefined}
              value="London, GBR"
            />
            <ContactMetadataItem
              label="Office"
              icon={metadataDescriptors === "icons" ? CallIcon : undefined}
              value="+44 2077 431102"
            />
            <ContactMetadataItem
              label="Bloomberg"
              icon={metadataDescriptors === "icons" ? MessageIcon : undefined}
              value="ABRAILESCU@bloomberg.net"
            />
            <ContactMetadataItem
              label="Email"
              icon={metadataDescriptors === "icons" ? MessageIcon : undefined}
              value="alex.brailescu@blackrock.com"
            />
          </ContactMetadata>
        ) : null}
      </ContactDetails>
    </div>
  );
};

export const Default = DefaultContactDetailsTemplate.bind({});

Default.argTypes = {
  variant: {
    options: ["default", "compact", "mini"],
    control: { type: "radio" },
  },
  metadataDescriptors: {
    options: ["labels", "icons"],
    control: { type: "radio" },
  },
  actionDescriptors: {
    options: ["labels", "icons"],
    control: { type: "radio" },
  },
};

Default.args = {
  collapsible: true,
  showFavoriteToggle: true,
  showActions: true,
  showIcons: true,
  showBorder: true,
  showAvatar: true,
  embedded: false,
  showPrimary: true,
  showSecondary: true,
  showTertiary: true,
};
