import { ComponentMeta, ComponentStory } from "@storybook/react";

import { ToolkitProvider } from "@jpmorganchase/uitk-core";
import {
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
import { CallIcon, ChatIcon, MessageIcon } from "@jpmorganchase/uitk-icons";
import { QAContainer } from "docs/components";
import { BackgroundBlock } from "docs/components/BackgroundBlock";
import avatar1 from "./assets/avatar1.png";

export default {
  title: "Lab/ContactDetails/QA",
  component: ContactDetails,
} as ComponentMeta<typeof ContactDetails>;

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

const contactWithActions = {
  avatar: avatar1,
  primary: "Alex Brailescu",
  secondary: "Blackrock Advisors (UK) Limited",
  tertiary: "SPN 2188538",
  actions,
  metadata,
};

const getComponent = (variant = "default") => {
  const { avatar, actions, primary, secondary, tertiary, metadata } =
    contactWithActions;
  return (
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

      <ContactFavoriteToggle onChange={console.log} />

      <ContactPrimaryInfo text={primary} />
      <ContactSecondaryInfo text={secondary} />
      <ContactTertiaryInfo text={tertiary} />

      <ContactMetadata>
        {metadata.map((item: any) => {
          return (
            <ContactMetadataItem
              value={item.value}
              label={item.label}
              icon={item.icon}
            />
          );
        })}
      </ContactMetadata>

      {!!actions && (
        <ContactActions>
          {actions.map((item: any) => {
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
};

const AllVariants = () => {
  const containerStyle = {
    width: 400,
    marginBottom: 16,
  };

  return (
    <div className="backwardsCompat">
      <h3>Default</h3>
      <div style={containerStyle}>{getComponent()}</div>

      <h3>Compact</h3>
      <div style={containerStyle}>{getComponent("compact")}</div>
      <h3>Mini</h3>
      <div style={containerStyle}>{getComponent("mini")}</div>
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
