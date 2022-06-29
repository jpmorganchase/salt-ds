import { ComponentMeta, ComponentStory, Story } from "@storybook/react";

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

const getComponent = (props: { variant?: string; className?: string }) => {
  const { variant = "default", className } = props;
  const { avatar, actions, primary, secondary, tertiary, metadata } =
    contactWithActions;
  return (
    <>
      <h3>{variant.charAt(0).toUpperCase() + variant.slice(1)}</h3>
      <div style={{ width: 400, marginBottom: 16 }}>
        <ContactDetails
          className={className}
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
                  key={Math.random()}
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
                    key={Math.random()}
                    icon={item.icon}
                    accessibleText={item.accessibleText}
                    onClick={item.action}
                  />
                );
              })}
            </ContactActions>
          )}
        </ContactDetails>
      </div>
    </>
  );
};

export const AllExamplesGrid: Story = (props: { className?: string }) => {
  const { className } = props;

  return (
    <div style={{ width: 800, display: "flex", flex: 1 }}>
      <ToolkitProvider theme={"light"}>
        <BackgroundBlock>
          {getComponent({ variant: "default", className })}
          {getComponent({ variant: "compact", className })}
          {getComponent({ variant: "mini", className })}
        </BackgroundBlock>
      </ToolkitProvider>
      <ToolkitProvider theme={"dark"}>
        <BackgroundBlock>
          {getComponent({ variant: "default", className })}
          {getComponent({ variant: "compact", className })}
          {getComponent({ variant: "mini", className })}
        </BackgroundBlock>
      </ToolkitProvider>
    </div>
  );
};

AllExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const BackwardsCompatGrid = AllExamplesGrid.bind({});
BackwardsCompatGrid.args = {
  className: "backwardsCompat",
};

BackwardsCompatGrid.parameters = {
  chromatic: { disableSnapshot: false },
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
      <BackwardsCompatGrid className="backwardsCompat" />
    </QAContainer>
  );
};
