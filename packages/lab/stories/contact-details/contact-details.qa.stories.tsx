import { useState } from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import classnames from "classnames";

import { ToolkitProvider, useTheme } from "@jpmorganchase/uitk-core";
import {
  Checkbox,
  ContactAction,
  ContactActions,
  ContactAvatar,
  ContactDetails,
  ContactFavoriteToggle,
  ContactMetadata,
  ContactMetadataItem,
  ContactPrimaryInfo,
  ContactSecondaryInfo,
  ContactTertiaryInfo,
  MailLinkComponent,
} from "@jpmorganchase/uitk-lab";
import {
  CallIcon,
  ChatIcon,
  CopyIcon,
  ExportIcon,
  MessageIcon,
} from "@jpmorganchase/uitk-icons";
import { QAContainer } from "docs/components";
import { BackgroundBlock } from "docs/components/BackgroundBlock";
import avatar1 from "./assets/avatar1.png";

export default {
  title: "Lab/ContactDetails/QA",
  component: ContactDetails,
} as ComponentMeta<typeof ContactDetails>;

const contactWithoutIcons = {
  primary: { value: "Alex Brailescu" },
  secondary: {
    value: "Blackrock Advisors (UK) Limited",
  },
  tertiary: {
    value: "SPN 2188538",
  },
};

const contactWithIcons = {
  primary: { value: "Alex Brailescu" },
  secondary: {
    value: "alex.brailescu@blackrock.com",
    icon: MessageIcon,
    ValueComponent: MailLinkComponent,
  },
  tertiary: {
    value: "+44 141 228 0210",
    icon: CallIcon,
  },
};

const actions = [
  { icon: CallIcon, action: () => console.log("Custom Action: Phone") },
  {
    icon: MessageIcon,
    accessibleText: "email",
    action: () => console.log("Custom Action: Message"),
  },
  { icon: ChatIcon, action: () => console.log("Custom Action: Chat") },
];

const metadata = [
  {
    label: "Role",
    value: "Analyst",
  },
  {
    label: "Location",
    value: "London, GBR",
  },
  {
    label: "Office",
    value: "+44 2077 431102",
  },
  {
    label: "Bloomberg",
    value: "ABRAILESCU@bloomberg.net",
    ValueComponent: MailLinkComponent,
  },
  {
    label: "Email",
    value: "alex.brailescu@blackrock.com",
    ValueComponent: MailLinkComponent,
  },
];

const metadataWithIcon = [
  {
    label: "Bloomberg",
    icon: MessageIcon,
    value: "ABRAILESCU@bloomberg.net",
    ValueComponent: MailLinkComponent,
  },
  {
    label: "Office",
    value: "+44 3071 234539",
    icon: CallIcon,
  },
];

const contactWithActions = {
  avatar: avatar1,
  ...contactWithoutIcons,
  actions,
  metadata,
};

const contactWithIconsAvatar = {
  avatar: avatar1,
  ...contactWithIcons,
  metadata,
};

const contactWithMetaIcon = {
  avatar: avatar1,
  ...contactWithoutIcons,
  metadata: metadataWithIcon,
};

// const styles = ({ toolkit: toolkitTheme }: Theme) => {
//   const {
//     palette: { type, blue900, blue10 },
//   } = toolkitTheme;

//   return {
//     container: {
//       width: 400,
//       marginBottom: 16,
//     },
//     narrowContainer: {
//       width: 300,
//       marginBottom: 16,
//     },
//     withBackground: {
//       background: type === "dark" ? blue900 : blue10,
//     },
//   };
// };

const getDefault = ({
  data,
  collapsible = false,
  avatar = true,
  favorite = true,
  isFavorite = false,
  variant = "default",
}) => (
  <ContactDetails
    variant={
      variant === "compact"
        ? "compact"
        : variant === "mini"
        ? "mini"
        : "default"
    }
  >
    {!!avatar && <ContactAvatar src={avatar1} />}

    {!!favorite && (
      <ContactFavoriteToggle
        defaultIsFavorite={isFavorite}
        onChange={console.log}
      />
    )}

    <ContactPrimaryInfo text={data.primary.value} />
    <ContactSecondaryInfo text={data.secondary.value} />
    <ContactTertiaryInfo text={data.tertiary.value} />

    <ContactMetadata collapsible={collapsible}>
      {data.metadata.map((item: any) => {
        return (
          <ContactMetadataItem
            value={item.value}
            label={item.label}
            icon={item.icon}
          />
        );
      })}
    </ContactMetadata>

    {!!data.actions && (
      <ContactActions>
        {data.actions.map((item: any) => {
          return (
            <ContactAction
              icon={item.icon}
              accessibleText={item.accessibleText}
              onClick={item.action}
            />
          );
        })}
      </ContactActions>
    )}
  </ContactDetails>
);

const AllVariants = () => {
  const containerStyle = {
    width: 400,
    marginBottom: 16,
  };

  return (
    <div className="backwardsCompat">
      <h3>Default</h3>
      <div style={containerStyle}>
        {getDefault({ data: contactWithActions, collapsible: false })}
      </div>

      <h3>Compact</h3>
      <div style={containerStyle}>
        {getDefault({
          data: contactWithActions,
          variant: "compact",
        })}
      </div>
      <h3>Mini</h3>
      <div style={containerStyle}>
        {getDefault({
          data: contactWithActions,
          variant: "mini",
        })}
        {/* <ContactDetails
          contact={contactWithActions}
          embedded={embedded}
          showFavoriteToggle
          variant="mini"
        /> */}
      </div>
    </div>
  );
};

export const CompareWithOriginalToolkit: ComponentStory<
  typeof ContactDetails
> = () => {
  return (
    <QAContainer
      width={800}
      className="uitkContactDetailsQA"
      imgSrc="/visual-regression-screenshots/ContactDetails-vr-snapshot.png"
    >
      <div
        className="backwardsCompat"
        style={{ width: 800, display: "flex", flex: 1 }}
      >
        <ToolkitProvider theme={"light"}>
          <BackgroundBlock style={{ background: "white" }}>
            <AllVariants />
          </BackgroundBlock>
        </ToolkitProvider>
        <ToolkitProvider theme={"dark"}>
          <BackgroundBlock>
            <AllVariants />
          </BackgroundBlock>
        </ToolkitProvider>
      </div>
    </QAContainer>
  );
};

export const QAExample: ComponentStory<typeof ContactDetails> = () => {
  return (
    <div
      className="backwardsCompat"
      style={{ width: 800, display: "flex", flex: 1 }}
    >
      <ToolkitProvider theme={"light"}>
        <BackgroundBlock style={{ background: "white" }}>
          <AllVariants />
        </BackgroundBlock>
      </ToolkitProvider>
      <ToolkitProvider theme={"dark"}>
        <BackgroundBlock>
          <AllVariants />
        </BackgroundBlock>
      </ToolkitProvider>
    </div>
  );
};
